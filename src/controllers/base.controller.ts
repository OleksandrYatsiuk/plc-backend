import * as express from "express";
import { Controller } from '../interfaces/controller.interface';


export default class BaseController implements Controller {
  public path;
  public router;
  constructor() {
    this.path = '/';
    this.router = express.Router();
  }

}
