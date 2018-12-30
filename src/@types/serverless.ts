export interface CommandOption {
    usage: string;
    shortcut: string;
    required?: boolean;
}

export interface CommandDescription {
    usage: string;
    lifecycleEvents?: string[];
    commands?: { [key: string]: CommandDescription };
    options?: { [key: string]: CommandOption };
}

export interface ServerlessInstance {
    cli: {
        log(args: any): any
        consoleLog(args: any): any
    };
    service: {
        service: string
        provider: {
            name: string
        }
        /** serverless framework cannot enforce a schema for these so everything must be optionally
         *  present though required in some cases
         */
        custom?: {
            oncall?: {
                /** required: pager duty (v2 api) credential */
                apiKey?: string
                /** required: pager duty escalation policy to associate oncall service with */
                escalationPolicy?: string
                /** optional: list of integration identifiers */
                integrations?: string[]
            }
        }
    };
    getProvider(name: string): Provider;
}

export interface Provider {
    getStage(): string;
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