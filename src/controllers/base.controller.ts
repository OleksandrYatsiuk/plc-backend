import * as express from "express";
import { Controller } from '../interfaces/controller.interface';


export default class BaseController implements Controller {
  public path: string;
  public router: express.Router;
  constructor() {
    this.path = '/';
    this.router = express.Router();
  }

}
