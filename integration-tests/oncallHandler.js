// https://v2.developer.pagerduty.com/docs/creating-an-integration-inline

var helloWorld = {
  event_type: PD.Trigger,
  incident_key: PD.inputRequest.body.incident_key,
  description: PD.inputRequest.body.description,
  details: PD.inputRequest.body,
  client: "Hello world",
  client_url: "https://github.com/softprops/serverless-oncall",
  contexts: [{
    "type": "link",
    "href": "https://github.com/softprops/serverless-oncall#README",
    "text": "please see the documentation for serverless-oncall for more information"
  }, {
    "type": "image",
    "src": "https://serverless.com/static/serverlessBolt.be31a2cb.png"
  }]
};

PD.emitGenericEvents([helloWorld]);