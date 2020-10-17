import App from './app';
import 'dotenv/config';
import { CoursesController, LessonsController, PaymentsController, UsersController } from './controllers';

const app = new App(
	[
		new PaymentsController(),
		new UsersController(),
		new CoursesController(),
		new LessonsController()
	],
	+process.env.PORT,
	'/v1'
);
app.listen();
