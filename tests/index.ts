import { expect } from 'chai';
import Oncall from '../src';

describe('Oncall', () => {
    it('works', () => {
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
        expect(oncall.displayOncall).to.throw();


    });
});