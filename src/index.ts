import { CommandDescription, ServerlessInstance, ServerlessOptions } from './types';

export class Oncall {

  readonly serverless: ServerlessInstance;
  readonly options: ServerlessOptions;
  readonly commands: { [key: string]: CommandDescription };
  readonly hooks: { [key: string]: any };

  constructor(serverless: ServerlessInstance, options: ServerlessOptions) {
    this.serverless = serverless;
    this.options = options;
    this.commands = {
      oncall: {
        usage: "Manages service oncall resources and incident management",
        lifecycleEvents: ["sync"],
        commands: {
          sync: {
            usage: "Sync's serverless.yml oncall resource information with a remote provider",
            lifecycleEvents: ["init", "end"]
          }
        }
      }
    };
    this.hooks = {
      'oncall:sync:init': this.sync.bind(this),
      'oncall:sync': this.sync.bind(this),
      'oncall:sync:end': this.end.bind(this),
    };
  }

  sync() {
    this.serverless.cli.log("sync...");
  }

  end() {
    this.serverless.cli.log("end...");
  }


}

module.exports = Oncall;
