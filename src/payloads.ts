import { userInfo } from 'os';

const payloads: {
  [key: string]: any;
} = {
  askTrainingBlock: {
    type: 'modal',
    title: {
      type: 'plain_text',
      text: 'スクワット何回やる？ :muscle:',
      emoji: true,
    },
    close: {
      type: 'plain_text',
      text: 'キャンセル',
      emoji: true,
    },
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*スクワット何回やる？ :muscle:*',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '回数を選ぶ',
        },
        accessory: {
          action_id: 'training_reps_selection',
          type: 'static_select',
          placeholder: {
            type: 'plain_text',
            text: '選択してください',
            emoji: true,
          },
          options: [
            {
              text: {
                type: 'plain_text',
                text: '10回！',
                emoji: true,
              },
              value: '10',
            },
            {
              text: {
                type: 'plain_text',
                text: '20回！',
                emoji: true,
              },
              value: '20',
            },
            {
              text: {
                type: 'plain_text',
                text: '30回！',
                emoji: true,
              },
              value: '30',
            },
          ],
        },
      },
    ],
  },
  askResultBlock: (context: any) => {
    return {
      callback_id: 'training_result_share',
      private_metadata: context,
      type: 'modal',
      title: {
        type: 'plain_text',
        text: '結果報告！',
        emoji: true,
      },
      submit: {
        type: 'plain_text',
        text: '報告',
        emoji: true,
      },
      close: {
        type: 'plain_text',
        text: 'ナイショ',
        emoji: true,
      },
      blocks: [
        {
          block_id: 'result',
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `お疲れさまでした！ ${
              JSON.parse(context).reps
            } 回できましたか？？ :muscle:`,
          },
          accessory: {
            action_id: 'result_selection',
            type: 'radio_buttons',
            options: [
              {
                text: {
                  type: 'plain_text',
                  text: 'できた！ :muscle:',
                  emoji: true,
                },
                value: 'done',
              },
              {
                text: {
                  type: 'plain_text',
                  text: 'できなかった・・・',
                  emoji: true,
                },
                value: 'undone',
              },
            ],
          },
        },
        {
          block_id: 'channel',
          type: 'input',
          element: {
            action_id: 'channel_selection',
            type: 'conversations_select',
            placeholder: {
              type: 'plain_text',
              text: 'チャンネルを選択',
              emoji: true,
            },
            response_url_enabled: true,
            default_to_current_conversation: true,
            filter: {
              exclude_bot_users: true,
            },
          },
          label: {
            type: 'plain_text',
            text: '報告先',
            emoji: true,
          },
        },
      ],
    };
  },
  trainingResult: (user: string, reps: string, result: string) => {
    return {
      user,
      reps,
      result,
    };
  },
  message: (context: any) => {
    return {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:muscle: ${context.user} はスクワット ${context.reps} 回 *${context.result}*`,
          },
        },
      ],
    };
  },
};

export { payloads };
