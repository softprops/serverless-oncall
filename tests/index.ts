import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import Oncall = require("../src")


before(() => {
    chai.should();
    chai.use(chaiAsPromised);
});

// https://www.chaijs.com/api/bdd/
describe('Oncall', () => {
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
                }
            }
        };
        const oncall = new Oncall(
            noCustomField, {}
        );

        return oncall.info().should.be.rejected;
    });
});