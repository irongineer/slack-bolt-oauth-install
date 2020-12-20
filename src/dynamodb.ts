import DynamoDB from 'aws-sdk/clients/dynamodb';
import { captureAWSClient } from 'aws-xray-sdk';
import { onlineOptions } from './aws';
import { offline, debug } from './env';
const { isOffline, dynamodbPort } = offline;

const offlineOptions: DynamoDB.Types.ClientConfiguration = {
  region: 'localhost',
  endpoint: `http://localhost:${dynamodbPort()}`,
  logger: debug.enabled() ? console : undefined,
};

const dynamodb = isOffline()
  ? new DynamoDB(offlineOptions)
  : captureAWSClient(new DynamoDB(onlineOptions));

const documentClient = isOffline()
  ? new DynamoDB.DocumentClient(offlineOptions)
  : new DynamoDB.DocumentClient(onlineOptions);
// https://github.com/aws/aws-sdk-js/issues/1846

if (!isOffline()) {
  captureAWSClient((documentClient as any).service);
}
export default {
  raw: dynamodb,
  doc: documentClient,
};
