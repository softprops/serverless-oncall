# serverless-oncall [![Build Status](https://travis-ci.org/softprops/serverless-oncall.svg?branch=master)](https://travis-ci.org/softprops/serverless-oncall)

> ⚡📟 manage oncall for serverless services

## Motivation

Serverless architectures
facilitate breaking larger applications into manageable components that are faster
to develop and deploy. Once in production you should also have an answer for
"how is this supported"?

Serverless framework leverages providers that manage many operational aspects of the runtimes
your application runs on but they do not manage the operational aspects of _your application_.

This serverless plugin meets speed of development with _resposibility_ of operations by [cutting the curb](https://en.wikipedia.org/wiki/Curb_cut) towards setting up a maintainable oncall system. It leverages [pagerduty](https://www.pagerduty.com/)*, a managed oncall scheduling, dispatch and notification hub, to map you application service to an oncall rotation that
intended to support its operations. The intended target for this support _is_ the developers that own the service.

This plugin is intended to pair well with the [AWS Alerts plugin](https://github.com/ACloudGuru/serverless-plugin-aws-alerts) but is not coupled to AWS provider serverless services.

## Usage

Oncall configuration is managed the same way you manage your application, though
describing it in your applications `serverless.yml` file.

```yaml
custom:
  oncall:
    # the escalation_policy you want pager duty alerts associated with
    escalationPolicy: ${env:PD_ESC_POLICY,''}
    # credential used to authenticate with pagerduty api
    # visit https://{company}.pagerduty.com/api_keys to create one
    apiKey: ${env:PD_API_KEY,''}
```

This plugin currently requires a pagerduty api key to interact with the pagerduty api. It is recommended to
**not** inline this apikey in your `serverless.yaml` in plain text to avoid accidently checking it into source control.
You can leverage [serverless variables](https://serverless.com/framework/docs/providers/aws/guide/variables/) as you would with other secret credentials to resolve this value without including it in your source code.


### Commands

#### escalationPolicies

In order to create or update an oncall service you will need to first select an appropriate escalation policy to associate the service with. You can think of roughly as selecting the target group of individuals to be notified. This plugin provides the `escalationPolicies` command for conveniene of listing these but does not manage them directly. Use the pagerduty UI do that instead.

```bash
$ npx serverless oncall escalationPolicies
```

```bash
$ npx serverless oncall escalationPolicies -t {team}
```

#### sync

```bash
$ npx serverless oncall sync
```


\* serverless-oncall may support other oncall providers in the future


Doug Tangren (softprops) 2018