import { ServerlessInstance, ServerlessOptions } from './types';

export class OncallPlugin {
  serverless: ServerlessInstance;
  options: ServerlessOptions;
  constructor(serverless: ServerlessInstance, options: ServerlessOptions) {
    this.serverless = serverless;
    this.options = options;
  }
}

module.exports = OncallPlugin;
