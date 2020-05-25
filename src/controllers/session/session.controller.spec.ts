
import * as sinon from 'sinon';
import { expect } from 'chai';
import { Request, Response, NextFunction } from 'express';
import { sessionControllerLogin, sessionControllerLogout } from './session.controller';


describe('src/controllers/session/session.controller.ts', () => {
    let sandbox: sinon.SinonSandbox;
    let req: Partial<Request> = {};
    let responseStub: Partial<Response>;
    let next: Partial<NextFunction>;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        responseStub = {
            send: sandbox.stub(),
        }
    });

    it('should send a message' , () => {
        sessionControllerLogin(req as Request, responseStub as Response, next as NextFunction);
        expect(responseStub.send).to.be.calledWith('Lift off!');
    });
});
