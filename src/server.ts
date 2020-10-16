import App from './app';
import 'dotenv/config';
import { PaymentsController, UsersController } from './controllers';

const app = new App(
	[
		new PaymentsController(),
		new UsersController()
	],
	+process.env.PORT,
	'/v1'
);
app.listen();
