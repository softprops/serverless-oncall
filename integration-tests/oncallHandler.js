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