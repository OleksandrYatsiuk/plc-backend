import App from './app';
import 'dotenv/config';
import {
	PaymentsController
} from './controllers/payments.controller';

const app = new App(
	[
		new PaymentsController()
	],
	+process.env.PORT,
	'/v1'
);
app.listen();
