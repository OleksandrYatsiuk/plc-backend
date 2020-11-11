import { NotFoundException, UnprocessableEntityException, HttpException, InternalServerError } from "../exceptions";
import * as express from "express";
import { Pagination } from "interfaces";
import { code200, code200DataProvider, code204, code201, code401 } from "../middleware/base.middleware";
import { Controller } from '../interfaces/controller.interface';


export default class BaseController implements Controller {
  public path: string;
  public router: express.Router;
  constructor() {
    this.path = '/';
    this.router = express.Router();
  }

  public send200(response: express.Response, data?) {
    return code200(response, data || null);
  }

  public send200Data(response: express.Response, pagination: Pagination, data?) {
    return code200DataProvider(response, pagination, data);
  }

  public send204(response: express.Response) {
    return code204(response);
  }

  public send201(response: express.Response, data) {
    return code201(response, data);
  }

  public send401(response: express.Response) {
    return code401(response);
  }

  public send404(errors) {
    return new NotFoundException(errors);
  }

  public send422(errors) {
    return new UnprocessableEntityException(errors);
  }

  public send500(data: any) {
    return new HttpException(InternalServerError, data)
  }
}
