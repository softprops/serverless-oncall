import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import Oncall from '../src';

before(() => {
    chai.should();
    chai.use(chaiAsPromised);
});

describe('Oncall', () => {
    it('works', async () => {
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
            }
        };
        const oncall = new Oncall(
            noCustomField, {}
        );
        // https://www.chaijs.com/api/bdd/
        return oncall.displayOncall().should.be.rejected;
    });
});