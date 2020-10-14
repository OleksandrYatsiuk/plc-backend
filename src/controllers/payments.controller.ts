import Controller from "./Controller";
import * as express from 'express';
import { LiqPayService } from '../services/liqpay.service';
// import { code200 } from "../../middleware";

export class PaymentsController extends Controller {
    public path = '/payments';
    private payment = new LiqPayService();

    constructor() {
        super();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}`, this.generatePayment);
    }

    private generatePayment = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const data = request.body;
        const payment = this.payment.cnb_form({
            ...data,
            action: 'pay',
            // amount: '1',
            currency: 'UAH',
            // 'description': 'description text',
            // 'order_id': '1233f',
            version: '3'
        });
        response.status(200).json({result:payment});
        // code200(response, payment);
    };


}