
export interface CommandOption {
  usage: string;
  shortcut: string;
  required?: true | false;
}

export interface CommandDescription {
  usage: string;
  lifecycleEvents: string[];
  commands?: { [key: string]: CommandDescription };
  options?: { [key: string]: CommandOption };
}

export interface ServerlessInstance {
  cli: {
    log(str: string): any
  };
  config: {
    servicePath: string;
  };
  service: {
    provider: {
      name: string
    }
    functions: { [key: string]: ServerlessFunction }
    package: ServerlessPackage
    getAllFunctions: () => string[]
  };
}

export interface ServerlessOptions {
  function?: string;
  watch?: boolean;
  extraServicePath?: string;
}

export interface ServerlessFunction {
  handler: string;
  package: ServerlessPackage;
}

export interface ServerlessPackage {
  include: string[];
  exclude: string[];
  artifact?: string;
  individually?: boolean;
}