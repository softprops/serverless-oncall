import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import Oncall = require("../src");


before(() => {
    chai.should();
    chai.use(chaiAsPromised);
});

// https://www.chaijs.com/api/bdd/
describe('Oncall', () => {
    describe("serverless.yml configuration", () => {
        it('requires a serverless.custom field', async () => {
            const noCustomField = {
                cli: {
                    log(args: any) { },
                    consoleLog(args: any) { }
                },
                service: {
                    service: 'foobar',
                    provider: {
                        name: 'aws'
                    }
                },
                getProvider(name: string) {
                    return {
                        getStage() {
                            return "test"
                        }
                    }
                }
            };
            const oncall = new Oncall(
                noCustomField, {}
            );

            return oncall.info().should.be.rejected;
        });

        it('requires a serverless.custom.oncall field', async () => {
            const noCustomField = {
                cli: {
                    log(args: any) { },
                    consoleLog(args: any) { }
                },
                service: {
                    service: 'foobar',
                    provider: {
                        name: 'aws'
                    }
                },
                custom: { },
                getProvider(name: string) {
                    return {
                        getStage() {
                            return "test";
                        }
                    };
                }
            };
            const oncall = new Oncall(
                noCustomField, {}
            );

            return oncall.info().should.be.rejected;
        });
    });

    describe("patchTransformPayload", () => {
        it ("patches payloads with event transform info", () => {
            let serverless = {
                cli: {
                    log(args: any) { },
                    consoleLog(args: any) { }
                },
                service: {
                    service: 'foobar',
                    provider: {
                        name: 'aws'
                    }
                },
                custom: {
                    oncall: {

                    }
                 },
                getProvider(name: string) {
                    return {
                        getStage() {
                            return "test";
                        }
                    };
                }
            };
            const oncall = new Oncall(
                serverless, {}
            );
            const patched = oncall.patchTransformPayload("test-service", {
                vendor: "abc",
                type: "test_int",
                name: "Test"
            }, "/* hello world */");
            chai.expect(patched).to.deep.equal({
                integration: {
                    config: {
                        fields: {
                            code: {
                                value: "/* hello world */"
                            }
                        }
                    },
                    name: "Test Integration",
                    type: "test_int",
                    vendor: {
                        id: "abc",
                        type: "vendor_reference"
                    }
                }
            });
        });
    });
});