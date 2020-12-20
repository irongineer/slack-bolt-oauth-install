import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import { debug } from './env';

export const onlineOptions: ServiceConfigurationOptions = {
  // https://aws.amazon.com/jp/premiumsupport/knowledge-center/lambda-function-retry-timeout-sdk/
  maxRetries: 3,
  httpOptions: {
    connectTimeout: 1000,
    timeout: 1000,
  },
  logger: debug.enabled() ? console : undefined,
};
