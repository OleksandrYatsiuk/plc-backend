import * as express from 'express';
import { sendRequest } from './request-interval';

export default class App {
	public app: express.Application;
	public port: number

	constructor(port: number) {
		this.app = express();
		this.port = port || 5000;
	}

	public listen() {
		this.app.listen(this.port, () => {
			console.log(`App running on http://${process.env.API_URL}:${this.port}`);
			require('./telegram-bot');
			sendRequest();
		});
	}
}
