import * as express from 'express';
import { LiqPayService } from '../services/liqpay.service';
import BaseController from "./base.controller";
// import { code200 } from "../../middleware";

export interface Payment {
    action?: string;
    amount: number | string;
    currency?: string;
    description: string;
    order_id: string;
    version?: string;
}

export class PaymentsController extends BaseController {
    public path = '/payments';
    private payment = new LiqPayService();

    constructor() {
        super();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}`, this.generatePayment);
        this.router.post(`${this.path}/status`, this.checkPayment);
    }

    private generatePayment = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const data: Payment = request.body;
        const payment = this.payment.cnb_form({
            ...data,
            action: 'pay',
            currency: 'UAH',
            version: '3'
        });
        response.status(200).json({ result: payment });
    };

    private checkPayment = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const { order_id } = request.params
        this.payment.check('request', { order_id, version: '3', action: 'status' }, (body) => {
            if (body.status == 'error') {
                response.status(422).json({ result: body.err_description })
            } else {
                response.status(200).json({ result: body })
            }
        }, (err, response) => {
            response.status(422).json({ result: err.err })
        })
    };


}