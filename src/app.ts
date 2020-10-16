import * as express from 'express';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
// import errorMiddleware from './middleware/error.middleware';
import { Controller } from './interfaces/controller.interface';

export default class App {
	public app: express.Application;
	public port: number;
	public version: string;
	public host: string;
	public hostDb=`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-9ab1f.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`

	constructor(controllers: Controller[], port: number, version: string) {
		this.app = express();
		this.port = port || 5000;
		this.version = version;
		this.setBodyParser();
		this.setCors();
		this.initializeControllers(controllers);
		// this.initializeErrorHandling();
		this.connectToTheDatabase();
	}
	/**
	* Headers (CORS)
	*/
	public setCors() {
		this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
			res.header('Access-Control-Allow-Origin', '*');
			if (req.method == 'OPTIONS') {
				res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
				res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin');
				return res.status(200).json({});
			}
			next();
		});
	}

	public setBodyParser() {
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: false }));
	}

	public listen() {
		this.app.listen(this.port, () => {
			console.log(`App running on http://${process.env.API_URL}:${this.port || 5000}`);
			require('./telegram-bot');
		});
	}

	// private initializeErrorHandling() {
	// 	this.app.use(errorMiddleware);
	// }

	private initializeControllers(controllers: Controller[]) {
		controllers.forEach((controller) => {
			this.app.use(`/api${this.version}`, controller.router)

		})
		this.app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
			response.status(404).json("Page not found!");
			// next(code404(response, 'Page not found!'));
		});
	}

	private connectToTheDatabase() {

        mongoose
            .connect(this.hostDb, {
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            })
            .then(() => console.info('MongoDB connected successfully!'))
            .catch((error) => console.error(`MongoDB error:\n ${error}`));
    }
}
