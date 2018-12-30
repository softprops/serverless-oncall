# serverless-oncall [![Build Status](https://travis-ci.org/softprops/serverless-oncall.svg?branch=master)](https://travis-ci.org/softprops/serverless-oncall)

> ⚡📟 easly manage oncall for serverless services

## Motivation

Serverless services facilitate fast develop and deploy cycles. Once in production, these applcations should also have an answer for: "Okay, so how is this application supported when customers start using it"? The answer should not be to wait until
customers tell you your service is down.

The Serverless framework leverages multiple providers that manage many operational aspects of the _runtimes_
your application runs on but they do not manage the operational aspects of _your application_ itself. That's up to you.

A number of great monitoring solutions exist and there are event [serverless plugins](https://github.com/ACloudGuru/serverless-plugin-aws-alerts) to leverage them. Serverless oncall fills the gap
of how you then **act** on these monitoring systems.

Serverless oncall leverages [pagerduty](https://www.pagerduty.com/)*, a managed oncall scheduling, dispatch and notification hub, to map your application service to an oncall rotation that
intended to support its operations. The intended target for this support ideally is the developers that own the service.

This plugin is intended to pair well with the [AWS Alerts plugin](https://github.com/ACloudGuru/serverless-plugin-aws-alerts) but is not coupled to AWS serverless provider.

## Usage

Oncall configuration is managed the same way you manage your application, though
describing it in your application's `serverless.yml` file.

```yaml
custom:
  oncall:
    # the escalation_policy you want pager duty alerts associated with
    escalationPolicy: ${env:PD_ESC_POLICY,''}
    # credential used to authenticate with pagerduty api
    # visit https://{company}.pagerduty.com/api_keys to create one
    apiKey: ${env:PD_API_KEY,''}
    # a list of integration types to associate with your oncall service
    # this will determine how monitoring systems interact with your
    # oncall service
    # currently only the "cloudwatch" integration is support but more integrations are
    # planned for the future
    # you may omit this configuration if you wish and configure these manually
    # in the pager duty web console
    integrations:
      - cloudwatch
```

This plugin currently requires a pagerduty api key to interact with the pagerduty api. It is recommended to
**not** inline your api key's value directly in your `serverless.yaml` in plain text to avoid accidently checking it into source control.
You can leverage [serverless variables](https://serverless.com/framework/docs/providers/aws/guide/variables/) as you would with other secret credentials to resolve this value without including it in your source code.

The example above is using env variables to resolve these values. You would then invoke a serverless command by providing them
externally.

```bash
$ PD_ESC_POLICY=xxx PD_API_KEY=xxxxxxx npx serverless info
```

### Commands

#### escalationPolicies

In order to create or update an oncall service you will need to first select an appropriate escalation policy to associate the service with. You can think of roughly as selecting the target group of individuals to be notified. This plugin provides the `escalationPolicies` command for conveniene of listing these but does not manage them directly. Use the pagerduty UI do that instead.

```bash
$ npx serverless oncall escalationPolicies
```

Your organization will likely have more than one time. The list above will include escalations for
all teams. To limit this list to a single (your) team use the `-t` flag and provide that teams pagerduty team identifier.

```bash
$ npx serverless oncall escalationPolicies -t {team}
```

#### sync

```bash
$ npx serverless oncall sync
```

### info

serverless-oncall integrates itself with the serverless built-in command, [info](https://serverless.com/framework/docs/providers/aws/cli-reference/info/) and prints
out high level information about the state of its associated oncall service. If you just want a quick
link to the oncall service, use this.

```bash
$ npx serverless info
```

\* serverless-oncall may support other oncall providers in the future


Doug Tangren (softprops) 2018