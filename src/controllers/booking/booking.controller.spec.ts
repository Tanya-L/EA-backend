import * as sinon from 'sinon';
import {expect} from 'chai';
import {NextFunction, Request, Response} from 'express';
import {getBookingController} from "@controllers/booking/bookingGetController";


describe('src/controllers/booking/booking.controller.ts', () => {
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

    it('should send a message', () => {
        getBookingController(req as Request, responseStub as Response, next as NextFunction);
        expect(responseStub.send).to.be.calledWith('Lift off!');
    });
});
