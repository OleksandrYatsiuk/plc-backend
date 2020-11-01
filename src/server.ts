import { PagesController } from './controllers/pages.controller';
import App from './app';
import 'dotenv/config';
import { CoursesController, 
	LessonsController, MessagesController,
	 PaymentsController, StudyProgressController, 
	 UsersController } from './controllers';

const app = new App(
	[
		new PaymentsController(),
		new UsersController(),
		new CoursesController(),
		new LessonsController(),
		new MessagesController(),
		new PagesController(),
		new StudyProgressController()
	],
	+process.env.PORT,
	'/v1'
);
app.listen();
