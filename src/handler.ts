/* eslint-disable no-console */
import { APIGatewayEvent, Context as LambdaContext } from 'aws-lambda';
import * as awsServerlessExpress from 'aws-serverless-express';
import {
  App,
  ExpressReceiver,
  ViewSubmitAction,
  Context,
  LogLevel,
  CodedError,
  BlockAction,
  StaticSelectAction,
  RadioButtonsAction,
  GlobalShortcut,
  Installation,
} from '@slack/bolt';
import { payloads } from './payloads';
import * as helpers from './helpers';
import {
  scopes,
  buildPutWorkspaceParams,
  buildSlackInstallation,
} from './shared/model/Workspace';
import {
  scopes as userScopes,
  buildPutUserParams,
  buildUserInstallation,
} from './shared/model/User';
import { putWorkspace, getWorkspaceByKey } from './shared/dao/workspace';
import { putUser, getUserByKey } from './shared/dao/user';

interface ViewSubmitActionWithResponseUrls extends ViewSubmitAction {
  response_urls: ResponseUrlInfo[];
}

interface ResponseUrlInfo {
  block_id: string;
  action_id: string;
  channel_id: string;
  response_url: string;
}

interface CustomStatus {
  status_text: string;
  status_emoji: string;
  status_expiration: number;
}

const processBeforeResponse = true;

// ------------------------
// Bolt App Initialization
// ------------------------
const receiver = new ExpressReceiver({
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'my-state-secret',
  scopes,
  installationStore: {
    storeInstallation: async installation => {
      console.log('storeInstallation', installation);
      // TODO Get tenantId and sub from DB by teamId and userId
      const tenantId = installation.team.id; // Temporary
      const sub = installation.user.id; // Temporary
      const workspace = buildPutWorkspaceParams({ tenantId, installation });
      const user = buildPutUserParams({ tenantId, sub, installation });
      await Promise.all([putWorkspace(workspace), putUser(user)]);
      return Promise.resolve();
    },
    fetchInstallation: async installQuery => {
      console.log('fetchInstallation', installQuery);
      const workspace = await getWorkspaceByKey(installQuery.teamId);
      const user = await getUserByKey(
        installQuery.teamId,
        installQuery.userId || '',
      );
      console.log('workspace', workspace);
      console.log('user', user);
      if (!workspace) {
        throw new Error('Failed to get workspace!');
      }
      if (!user) {
        throw new Error('Failed to get user!');
      }
      const workspaceInstallation = buildSlackInstallation(workspace);
      const userInstallation = buildUserInstallation(user);
      const installation: Installation<'v2', false> = {
        ...workspaceInstallation,
        user: userInstallation,
      };
      return installation;
    },
  },
  processBeforeResponse,
});
const app = new App({
  receiver,
  processBeforeResponse,
  logLevel: LogLevel.DEBUG,
});

// ------------------------
// Custom Route
// ------------------------
receiver.router.get('/slack/user_install', async (_req, res) => {
  try {
    // feel free to modify the scopes
    const url = await receiver.installer?.generateInstallUrl({
      scopes,
      userScopes,
      metadata: JSON.stringify({
        tenantId: 'tenant-id',
        state: 'sessionState',
      }),
    });

    res.send(helpers.buildSlackUrl(url || ''));
  } catch (error) {
    console.log(error);
  }
});

// ------------------------
// Application Logic
// ------------------------
app.shortcut<GlobalShortcut>(
  'muscle',
  async ({ ack, context, body, logger }) => {
    logger.info("app.shortcut('muscle')");
    try {
      await openAskTrainingModal(body, context);
      await ack();
    } catch (e) {
      logger.error(e);
      await ack();
    }
  },
);

const openAskTrainingModal = async (
  body: GlobalShortcut,
  context: Context,
): Promise<void> => {
  // トレーニングを何回やるか尋ねるモーダルのブロック
  const askTrainingBlock = payloads.askTrainingBlock;

  // モーダルを開く
  const modalViewResult = await app.client.views.open({
    token: context.botToken,
    trigger_id: body.trigger_id,
    view: askTrainingBlock,
  });
  console.log('modalViewResult', modalViewResult);
};

app.action<BlockAction<StaticSelectAction>>(
  'training_reps_selection',
  async ({ ack, action, body, context, logger }) => {
    await ack();

    const reps = action.selected_option.value;
    const privateMetadata = JSON.stringify({ reps: reps }); // reps value

    // トレーニング結果を尋ねるモーダルのブロック
    const askResultBlock = payloads.askResultBlock(privateMetadata);
    try {
      // モーダルビューを更新
      if (body.view) {
        const modalUpdateResult = await app.client.views.update({
          token: context.botToken,
          // リクエストに含まれる view_id を渡す
          view_id: body.view.id,
          // 更新された view の値をペイロードに含む
          view: askResultBlock,
        });
        logger.info('modalUpdateResult', modalUpdateResult);
      } else {
        throw new Error('Missing body.view!');
      }
    } catch (e) {
      logger.error(`:x: Failed to post a message (error: ${e})`);
    }
  },
);

app.action<BlockAction<RadioButtonsAction>>(
  'result_selection',
  async ({ ack, body, context }) => {
    await ack();

    // トレーニング結果によってカスタムステータスを決定
    await changeCustomStatusByTrainingResult(body, context);
  },
);

app.view<ViewSubmitActionWithResponseUrls>(
  'training_result_share',
  async ({ view, body, context, ack, logger }) => {
    logger.info("app.view('training_result_share')");

    // ペイロードから input タイプのブロックでユーザーが入力した情報を抽出します
    // https://api.slack.com/reference/interaction-payloads/views#view_submission
    const values = body.view.state.values;
    logger.info('view.state.values: ', values);

    // values[blockId][actionId].value/selected_*
    const actionId = 'result_selection';
    const selected_option = values['result']
      ? values['result'][actionId].selected_option
      : undefined;

    // 入力値のバリデーションを実行します
    // https://api.slack.com/surfaces/modals/using#displaying_errors
    const errors: any = {};
    if (typeof selected_option !== 'undefined' && !selected_option) {
      errors['result'] = 'ちゃんと結果を選択してください！';
    }
    if (Object.entries(errors).length > 0) {
      // モーダル内に対応するエラ〜メッセージを表示します
      // FIXME エラーは検知しているが、バリデーションメッセージが Slack 画面上に表示されない
      await ack({
        response_action: 'errors',
        errors,
      });
      logger.error('Error!!!: ', errors);

      return;
    }

    const result = selected_option.text.text;
    // parse trainingResult data stored in views metadata
    const reps = JSON.parse(view.private_metadata).reps;

    // formatting the user's name to mention that user in the message (see: https://api.slack.com/messaging/composing/formatting)
    const user = helpers.hasProperty(body.user, 'id')
      ? `<@${body.user.id}>`
      : '';

    const trainingResult = payloads.trainingResult(user, reps, result);
    const payload = payloads.message(trainingResult);

    // get the response url for the selected channel and post to it
    try {
      await app.client.chat.postMessage({
        token: context.botToken,
        channel: body.response_urls[0].channel_id,
        text: payload.blocks[0].text.text,
      });

      // clear all open views after user shares to channel
      await ack({
        response_action: 'clear',
      });
    } catch (e) {
      logger.error(`:x: Failed to post a message (error: ${e})`);
      await ack();
    }
  },
);

const printCompleteJSON = async (error: CodedError): Promise<void> => {
  console.error(JSON.stringify(error));
};

const changeCustomStatusByTrainingResult = async (
  body: BlockAction<RadioButtonsAction>,
  context: Context,
): Promise<void> => {
  const value = body.actions[0].selected_option?.value;
  const customStatus = {} as CustomStatus;
  if (value === 'done') {
    customStatus.status_text = '絶好調';
    customStatus.status_emoji = ':muscle:';
    customStatus.status_expiration = 0;
  } else if (value === 'undone') {
    customStatus.status_text = '絶不調';
    customStatus.status_emoji = ':mask:';
    customStatus.status_expiration = 0;
  } else {
    customStatus.status_text = '';
    customStatus.status_emoji = '';
    customStatus.status_expiration = 0;
  }
  // status を変更
  const statusChangeResult = await app.client.users.profile.set({
    token: context.userToken,
    profile: JSON.stringify(customStatus),
  });
  console.log('statusChangeResult', statusChangeResult);
};

// Check the details of the error to handle cases where you should retry sending a message or stop the app
app.error(printCompleteJSON);

// ------------------------
// AWS Lambda Handler
// ------------------------
const server = awsServerlessExpress.createServer(receiver.app);
module.exports.app = (event: APIGatewayEvent, context: LambdaContext) => {
  console.log('⚡️ Bolt app is running!');

  awsServerlessExpress.proxy(server, event, context);
};
