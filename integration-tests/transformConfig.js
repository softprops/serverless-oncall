// https://serverless.com/framework/docs/providers/aws/guide/variables/#reference-variables-in-javascript-files
module.exports.code = () => {
  return require('fs').readFileSync('oncallHandler.js').toString();
}