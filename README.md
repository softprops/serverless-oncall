# serverless-oncall [![Build Status](https://travis-ci.org/softprops/serverless-oncall.svg?branch=master)](https://travis-ci.org/softprops/serverless-oncall) [![npm](https://img.shields.io/npm/v/serverless-oncall.svg)](https://www.npmjs.com/package/serverless-oncall)

> ⚡📟 easly manage oncall for serverless services

## 🤔 Motivation

Serverless services facilitate fast develop and deploy cycles. Once in production, these applcations should also have an answer for: "Okay, so how is this application supported when customers start using it"? The answer should not be to wait until
customers tell you your service is down.

The Serverless framework leverages multiple providers that manage many operational aspects of the _runtimes_
your application runs on but they do not manage the operational aspects of _your application_ itself. That's up to you.

A number of great monitoring solutions exist and there are even [serverless plugins](https://github.com/ACloudGuru/serverless-plugin-aws-alerts) to leverage them! Serverless oncall fills the gap
of how you then **act** on these monitoring systems.

Serverless oncall leverages [pagerduty](https://www.pagerduty.com/)*, a managed oncall scheduling, dispatch and notification hub, to map your application service to an oncall rotation that
intended to support its operation. The intended target for this support ideally is the developers that own the service.

This plugin is intended to pair well with the [AWS Alerts plugin](https://github.com/ACloudGuru/serverless-plugin-aws-alerts) but is not coupled to AWS serverless provider.

## 📦 Install

Install the plugin with `npm`

```bash
$ npm i -D serverless-oncall
```

Update your `serverless.yml` file with the following

```yaml
plugins:
 - serverless-oncall

custom:
  oncall:
    # the escalation_policy you want pager duty alerts associated with
    escalationPolicy: ${env:PD_ESC_POLICY,''}

    # credential used to authenticate with pagerduty api
    # visit https://{company}.pagerduty.com/api_keys to create one
    apiKey: ${env:PD_API_KEY,''}

    # a list of integrations to associate with your oncall service
    # this will determine where monitoring systems send information to.
    #
    # currently only the "cloudwatch" and "transform" integration are supported but more integrations are
    # planned for the future
    # you may omit this configuration if you wish and configure these manually
    # in the pagerduty web console
    integrations:
      - cloudwatch:
      - tranform:
          code: 'code here'
```

This plugin currently requires a pagerduty api key to interact with the pagerduty api.

💡 You can learn how to get your own api key [here](https://support.pagerduty.com/docs/using-the-api)

It is recommended to
**not** inline your api key's value directly in your `serverless.yaml` in plain text to avoid accidently checking it into source control.
You can leverage [serverless variables](https://serverless.com/framework/docs/providers/aws/guide/variables/) as you would with other secret credentials to resolve this value without including it in your source code.

The example above is using [env variables](https://serverless.com/framework/docs/providers/aws/guide/variables#referencing-environment-variables) to resolve these values. You would then invoke a serverless command by providing them
externally.

```bash
$ PD_ESC_POLICY=xxx PD_API_KEY=xxxxxxx npx serverless info
```

Serverless framework provides [many options](https://serverless.com/framework/docs/providers/aws/guide/variables/) for storing these externally from your source code. Pick one.

### integrations

As mentioned above the way you intergrate a monitoring systems is with pagerduty.
The delivery of this information to your oncall team is key so its worth considering your options

### Cloudwatch

This integration is easy to configure limited in the way information is delivered

### Transform

This integration requires some configuration but is more flexible with how information is delievered

Below is a recommended way of keeping that configuration managable.

The `transform` integration lets you provde a snippet of javascript that pager duty will
run when it recieves an incident event. This lets you desired how you want your information
to be delievered and displayed to your oncall team. The example below leverages serverless frameworks ability externalize and dereference data in separate files.


```yaml
custom:
  oncall:
    integrations:
      # event transform integration (pagerduty's serverless event transformer)
      - transform:
          code: "${file(transformConfig.js):code}"
```

The `transform.code` field is a string of javascript source. This assumes
`transformConfig.js` is a file that will provide that by loading in
an `oncallHandler.js` file.

```sh
$ cat transformConfig.js
module.exports.code = () => {
  // read in javascript source
  return require('fs').readFileSync('oncallHandler.js').toString();
}
```

```sh
$ cat oncallHandler.js
// https://v2.developer.pagerduty.com/docs/creating-an-integration-inline
var helloWorld = {
  event_type: PD.Trigger,
  incident_key: PD.inputRequest.body.incident_id,
  description: PD.inputRequest.body.description,
  details: PD.inputRequest.body,
  client: "Hello world",
  client_url: "https://github.com/softprops/serverless-oncall"
};
​
PD.emitGenericEvents([helloWorld]);
```

This approach also brings the potential of unit testing your transform code as it is now
just a standalone javascript file. The
[pagerduty docs](https://v2.developer.pagerduty.com/docs/creating-an-integration-inline)
may help here.

## 🎙️ Commands

serverless-oncall adds new commands to your servleress vocabulary. You can discover these new commands though the built-in `--help` option

```bash
$ npx serverless --help | grep oncall
```

### escalationPolicies

In order to create or update an oncall service you will need to first select an appropriate escalation policy to associate the service with. You can think of roughly as selecting the target group of individuals to be notified. This plugin provides the `escalationPolicies` command for conveniene of listing these but does not manage them directly. Use the pagerduty UI do that instead.

```bash
$ npx serverless oncall escalationPolicies
```

Your organization will likely have more than one time. The list above will include escalations for
all teams. To limit this list to a single (your) team use the `-t` flag and provide that teams pagerduty team identifier.

```bash
$ npx serverless oncall escalationPolicies -t {team}
```

### sync

This command will use the information described your serverless.yml oncall resource
to create resources with a remote provider, currently pagerduty

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

## 🚧 Planned work

* interface design. the current design relects an minimum viable design. this is subject to change.
* support more integrations
* support more oncall service providers

## 👯 Contributing

Contributions are welcome. Please read [our contributing doc](CONTRIBUTING.md) for more information.

Doug Tangren (softprops) 2018