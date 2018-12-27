# serverless-oncall [![Build Status](https://travis-ci.org/softprops/serverless-oncall.svg?branch=master)](https://travis-ci.org/softprops/serverless-oncall)

> ⚡📟 manage oncall for serverless services

## Motivation

Meet speed of development with resposibility of operations. Serverless architectures
facilitate breaking larger applications into manageable components that are faster
to develop and deploy. Once in production you should also have an answer for
"how is this supported"?

Serverless framework leverages providers that manage many operational aspects of the runtimes
your application runs on but they do not manage the operational aspects of _your application_.

This serverless plugin helps with that. It leverages [pagerduty](https://www.pagerduty.com/)*, a managed oncall scheduling, dispatch and notification hub, to map you application service to an oncall rotation that
intended to support its operations. The intended target for this support _is_ the developers that own the service.

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

This plugin requires pagerduty api key to interact with the pagerduty api. It is recommended
**not** to inline this key in your configuration to avoid checking it into source control.
You can leverage serverless variables as you would with other secret credentials

### escalationPolicies

```bash
$ npx serverless oncall escalationPolicies
```

```bash
$ npx serverless oncall escalationPolicies -t {team}
```

### sync

```bash
$ npx serverless oncall sync
```


\* serverless-oncall may support other oncall providers in the future


Doug Tangren (softprops) 2018