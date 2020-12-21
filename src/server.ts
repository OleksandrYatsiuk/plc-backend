import App from './app';
import 'dotenv/config';

const app = new App(+process.env.PORT);
app.listen();
