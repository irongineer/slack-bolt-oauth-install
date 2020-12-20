export const offlineKeys = [
  'IS_OFFLINE',
  'DYNAMODB_PORT',
  'KMS_PORT',
  'SQS_PORT',
] as const;
export const slackKeys = ['USERNAME', 'ICON_URL', 'CHANNEL'] as const;
export const stageKeys = ['STAGE'] as const;
export const debugKeys = ['DEBUG'] as const;
export const awsKeys = ['AWS_REGION'] as const;

export const keys = [
  ...offlineKeys,
  ...slackKeys,
  ...stageKeys,
  ...debugKeys,
  ...awsKeys,
];

type OfflineKey = typeof offlineKeys[number];
type SlackKey = typeof slackKeys[number];
type StageKey = typeof stageKeys[number];
type DebugKey = typeof debugKeys[number];
type AwsKey = typeof awsKeys[number];

export type Key = OfflineKey | SlackKey | StageKey | DebugKey | AwsKey;

const getOfflineValue = (key: OfflineKey) => process.env[key];
const getSlackValue = (key: SlackKey) => process.env[key];
const getStageValue = (key: StageKey) => process.env[key];
const getDebugValue = (key: DebugKey) => process.env[key];
const getAwsValue = (key: AwsKey) => process.env[key];

const getValue = (key: Key) => process.env[key];

const getInt = (key: Key, defaultValue: number): number => {
  const value = getValue(key);
  if (!value) {
    return defaultValue;
  }
  const intValue = parseInt(value, 10);
  if (isNaN(intValue)) {
    return defaultValue;
  }
  return intValue;
};

const getObject = (key: Key) => {
  const value = getValue(key);
  return value ? JSON.parse(value) : {};
};

interface OfflineConfiguration {
  isOffline: () => boolean;
  dynamodbPort: () => number;
  kmsPort: () => number;
  sqsPort: () => number;
}

const getPort = (key: OfflineKey, defaultPort: number) =>
  getInt(key, defaultPort);

export const offline: OfflineConfiguration = {
  // Depends on serverless-offline plugin which adds IS_OFFLINE to process.env when running offline
  isOffline: () => !!getOfflineValue('IS_OFFLINE'),
  dynamodbPort: () => getPort('DYNAMODB_PORT', 8000),
  kmsPort: () => getPort('KMS_PORT', 4001),
  sqsPort: () => getPort('SQS_PORT', 9324),
};

interface SlackConfiguration {
  username: () => string | undefined;
  iconUrl: () => string | undefined;
  channel: () => string | undefined;
}

export const slack: SlackConfiguration = {
  username: () => getSlackValue('USERNAME'),
  iconUrl: () => getSlackValue('ICON_URL'),
  channel: () => getSlackValue('CHANNEL'),
};

interface StageConfiguration {
  name: () => string | undefined;
}

export const stage: StageConfiguration = {
  name: () => getStageValue('STAGE'),
};

interface DebugConfiguration {
  enabled: () => boolean;
}

export const debug: DebugConfiguration = {
  enabled: () => !!getDebugValue('DEBUG'),
};

interface AwsConfiguration {
  region: () => string | undefined;
}

export const aws: AwsConfiguration = {
  region: () => getAwsValue('AWS_REGION'),
};
