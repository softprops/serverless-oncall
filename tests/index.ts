import { expect } from 'chai';
import Oncall from '../src';

describe('Oncall', () => {
    it('works', () => {
        const oncall = new Oncall(
            {
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
            },
            {

            }
        );
        // https://www.chaijs.com/api/bdd/
        expect(oncall.displayOncall).to.throw();

    });
});