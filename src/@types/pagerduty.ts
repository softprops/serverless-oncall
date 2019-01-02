
// todo: break into separate files

export interface Services {
    services: Service[];
    limit: number;
    offset: number;
    total: number | null;
    more: true | false;
}

export interface ServiceResponse {
    service: Service;
}

export interface Service {
    id: string;
    name: string;
    description: string | null;
    teams: Entity[];
    escalation_policy: Entity;
    status: string;
    integrations: Integration[];
    html_url: string;
}

export interface Integration {
    id: string;
    type: string;
    summary: string;
    name: string;
    config: any;
    html_url: string;
    vendor: {
        summary: string;
    };
    integration_key: string;
}

export interface EscalationPolicy {
    id: string;
    summary: string;
    description: string;
    teams: {
        name: string,
        id: string
    }[];
}

export interface Entity {
    id: string;
    summary: string;
    html_url: string;
}

export interface PagerDutyClient {
    /** https://v2.developer.pagerduty.com/v2/page/api-reference#!/Services  */
    services: {
        listServices(qs?: any): Promise<{ body: string }>
        createService(args: any): Promise<{ body: ServiceResponse }>
        createIntegration(serviceId: string, payload: any): Promise<{ body: { integration: Integration } }>,
        updateIntegration(serviceId: string, integrationId: string, payload: any): Promise<{ body: { integration: Integration } }>,
    };
    /** https://v2.developer.pagerduty.com/v2/page/api-reference#!/Escalation_Policies */
    escalationPolicies: {
        listEscalationPolicies(qs?: any): Promise<{ body: string }>
    };
}

export interface IntegrationConfig {
    vendor: string;
    type: string;
    name: string;
}