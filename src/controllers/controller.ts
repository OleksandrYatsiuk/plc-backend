import { Router } from "express";
import * as express from "express";




export default interface Controller {
  path: string;
  router: Router;
}
export default class Controller implements Controller {
  constructor() {
    this.path = "/";
    this.router = express.Router();
  }

}
