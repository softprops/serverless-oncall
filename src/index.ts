import { EscalationPolicy, Services, PagerDutyClient, Service, IntegrationConfig, Integration } from './@types/pagerduty';
import { Provider, CommandDescription, ServerlessInstance, ServerlessOptions } from './@types/serverless';
import * as PagerDuty from 'node-pagerduty';

const API_KEY_MISSING: string =
  "The serverless-oncall plugin requires a custom oncall configuration block containing an `oncall.apiKey` identifier\n\n" +
  '  ```\n' +
  '  custom:\n'+
  '    oncall:\n'+
  '      apiKey: "your-api-key-here"\n'+
  '      ^^^^^^\n'+
  '  ```\n\n' +
  "You can obtain one by visiting https://{your-company}.pagerduty.com/api_keys or talk to your friendly pagerduty admin";

const ESCALTION_POLICY_MISSING: string =
  'The serverless-oncall plugin requires a custom oncall configuration block containing an `oncall.escalationPolicy` identifier\n\n' +
  '  ```\n' +
  '  custom:\n'+
  '    oncall:\n'+
  '      escalationPolicy: "your-esclation-policy-identifier-here"\n'+
  '      ^^^^^^^^^^^^^^^^\n'+
  '  ```\n';

const INTEGRATIONS:  { [key: string]: IntegrationConfig }  = {
    'cloudwatch': {
        vendor: "PZQ6AUS",
        type: "aws_cloudwatch_inbound_integration"
    },
    /* https://github.com/softprops/serverless-oncall/issues/2
    'transform': {
        vendor: "PCJ0EFQ",
        type: "event_transformer_api_inbound_integration"
    }*/
};

export = class Oncall {

    readonly serverless: ServerlessInstance;
    readonly options: ServerlessOptions;
    readonly commands: { [key: string]: CommandDescription };
    readonly hooks: { [key: string]: any };
    readonly provider: Provider;

    constructor(serverless: ServerlessInstance, options: ServerlessOptions) {
        this.serverless = serverless;
        this.options = options;
        this.provider = this.serverless.getProvider(this.serverless.service.provider.name);
        this.commands = {
            oncall: {
                usage: "Manages service oncall resources and incident management",
                commands: {
                    sync: {
                        usage: "Syncs serverless.yml oncall resource information with a remote provider",
                        lifecycleEvents: ["sync"]
                    },
                    escalationPolcies: {
                        usage: "List available ecalation policies provided by a remote provider",
                        lifecycleEvents: ["escalationPolcies"],
                        options: {
                            team: {
                                usage: 'limit policies to those of a given team',
                                shortcut: 't'
                            }
                        }
                    }
                }
            }
        };
        this.hooks = {
            'oncall:sync:sync': this.sync.bind(this),
            'oncall:escalationPolcies:escalationPolcies': this.escalationPolicies.bind(this),
            'after:info:info': this.info.bind(this)
        };
    }

    async findSevice(client: PagerDutyClient, serviceName: string): Promise<Service | undefined> {
        const args: { [key: string]: string } = { query: serviceName, 'include[]': 'integrations' };
        // this list should be sufficiently filtered that pagination is not needed
        let res = await client.services.listServices(args);
        const s: Services = JSON.parse(res.body);
        return s.services.find(s => s.name === serviceName);
    }

    async createService(client: PagerDutyClient, serviceName: string, escalationPolicy: string): Promise<Service | undefined> {
        const payload = {
            service: {
                type: "service",
                name: serviceName,
                description: "Managed by serverless oncall",
                escalation_policy: {
                    id: escalationPolicy,
                    type: 'escalation_policy_reference'
                },
                alert_creation: 'create_alerts_and_incidents'
            }
        };
        return client.services.createService(payload).then(res => {
            return res.body.service;
        });
    }

    integrationPayload(serviceName: string, integration: IntegrationConfig): object {
        // todo: figure out how to provide a config object so we can support custom event transforms,
        // a much more flexible integration.
        // https://www.pagerduty.com/blog/new-api-endpoints-increase-platform-extensibility/
        // docs https://v2.developer.pagerduty.com/v2/page/api-reference#!/Services/post_services_id_integrations
        // see https://v2.developer.pagerduty.com/v2/docs/creating-an-integration-inline for code api
        // see https://gist.github.com/richadams/3f51b617dc4051563fe358d7b0d40fe2 for a code example
        return {
            integration: {
                /*config: {
                    fields: {
                        code: {
                            type: 'code',
                            value: "PD.emitGenericEvents([])// test"
                        }
                    }
                },*/
                name: `${serviceName} Integration`,
                summary: `Generated by serverless-oncall plugin`,
                type: integration.type,
                vendor: {
                    id: integration.vendor,
                    type: "vendor_reference"
                }
            }
        };
    }

    // helper method to create am integration from the pagerduty api
    async createIntegration(client: PagerDutyClient, serviceName: string, serviceId: string, integration: IntegrationConfig): Promise<Integration> {
        let response = await client.services.createIntegration(serviceId, this.integrationPayload(
            serviceName, integration
        ));
        return response.body.integration;
    }

    // helper method to fetch escalation policies from the pager duty api
    async listEscalationPolcies(client: PagerDutyClient, options: any): Promise<EscalationPolicy[]> {
        const args: { [key: string]: string } = { 'include[]': 'teams' };
        if (options.team !== undefined) {
            args['team_ids[]'] = options.team;
        }
        if (options.offset !== undefined) {
            args.offset = options.offset;
        }
        return client.escalationPolicies.listEscalationPolicies(args).then(res => {
            const response: { escalation_policies: EscalationPolicy[], limit: number, offset: number, more: boolean } = JSON.parse(res.body);
            if (response.more) {
                return this.listEscalationPolcies(
                    client,
                    Object.assign(
                        options,
                        {
                            offset: response.offset + response.limit
                        }
                    )
                ).then(next =>
                    response.escalation_policies.concat(next)
                );
            } else {
                return response.escalation_policies;
            }
        });
    }

    async escalationPolicies() {
        const oncall = this.config();
        const apiKey = oncall.apiKey;
        if (!apiKey) {
            throw new Error(API_KEY_MISSING);
        }
        this.serverless.cli.log(`Fetching oncall escalationPolicies...`);
        return await this.listEscalationPolcies(new PagerDuty(apiKey), this.options).then(policies => {
            policies.forEach(p => {
                this.serverless.cli.log(`${p.summary} (${p.id})`);
                if (p.teams.length > 0) {
                    this.serverless.cli.log(` * Managed by ${p.teams.map(t => `the ${t.name} team (${t.id})`)}`);
                } else {
                    this.serverless.cli.log(` * Managed by an individual`);
                }
            });
        });
    }

    config() {
        const custom = this.serverless.service.custom || {};
        return custom.oncall || {};
    }

    async sync() {
        const config = this.config();
        const serviceName = `${this.serverless.service.service}-${this.provider.getStage()}`;
        this.serverless.cli.log(`Syncing oncall for service ${serviceName}...`);

        const apiKey = config.apiKey;
        if (!apiKey) {
            throw new Error(API_KEY_MISSING);
        }
        const escalationPolicy = config.escalationPolicy;
        if (!escalationPolicy) {
            throw new Error(ESCALTION_POLICY_MISSING);
        }
        const pd: PagerDutyClient = new PagerDuty(apiKey);
        let service = await this.findSevice(pd, serviceName);
        if (service === undefined) {
            this.serverless.cli.log(`Creating oncall service named ${serviceName}`);
            service = await this.createService(pd, serviceName, escalationPolicy);
            if (service !== undefined) {
                for (let name of (config.integrations || [])) {
                    let integration = INTEGRATIONS[name];
                    if (integration) {
                        this.serverless.cli.log(`Creating ${name} oncall integration...`);
                        let newIntegration = await this.createIntegration(pd, serviceName, service.id, integration);
                        if (newIntegration) {
                            this.logIntegration(newIntegration);
                        }
                    } else {
                        this.serverless.cli.log(`Skipping unsupported oncall integration ${name}`);
                    }
                }
            } else {
                this.serverless.cli.log(`Failed to create oncall service`);
            }
        } else {
            this.serverless.cli.log(`Oncall service exists`);
            if (service.integrations.length > 0) {
                // todo: was this user created?
            } else {
                for (let name of (config.integrations || [])) {
                    let integration = INTEGRATIONS[name];
                    if (integration) {
                        this.serverless.cli.log(`Creating ${name} oncall integration...`);
                        let newIntegration = await this.createIntegration(pd, serviceName, service.id, integration);
                        if (newIntegration) {
                            this.logIntegration(newIntegration);
                        }
                    } else {
                        this.serverless.cli.log(`Skipping unsupported oncall integration ${name}`);
                    }
                }
            }
        }
    }

    logIntegration(integration: Integration) {
        this.serverless.cli.consoleLog(`      * ${integration.vendor.summary}: ${integration.html_url}`);
        this.serverless.cli.consoleLog(`         Integration URL: https://events.pagerduty.com/integration/${integration.integration_key}/enqueue`);
    }

    logService(service: Service) {
        this.serverless.cli.consoleLog(`    Service ${service.name}: ${service.html_url}`);
        this.serverless.cli.consoleLog(`    Integrations`);
        if (service.integrations.length > 0) {
            service.integrations.forEach(integration => this.logIntegration(integration));
        } else {
            this.serverless.cli.consoleLog(`    None`);
        }
    }

    async info() {
        const config = this.config();
        const serviceName = `${this.serverless.service.service}-${this.provider.getStage()}`;
        const apiKey = config.apiKey;
        if (!apiKey) {
            throw new Error(API_KEY_MISSING);
        }
        const pd: PagerDutyClient = new PagerDuty(apiKey);
        let pdService = await this.findSevice(pd, serviceName);
        if (pdService === undefined) {
            // service does not yet exist
            return;
        }
        this.serverless.cli.log("Oncall");
        this.logService(pdService);
    }
};
