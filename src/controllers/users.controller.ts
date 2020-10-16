import * as express from 'express';
import * as mongoose from 'mongoose';
import BaseController from "./base.controller";
import model from './schemas/users.schema';
import { User } from '../interfaces/index'
// import { code200 } from "../../middleware";

export class UsersController extends BaseController {
    public path = '/users';
    public model: mongoose.PaginateModel<User & mongoose.Document>;

    constructor() {
        super();
        this.initializeRoutes();
        this.model = model;
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}`, this.getList);
        this.router.post(`${this.path}/register`, this.register);
        this.router.patch(`${this.path}/current`, this.update);
        this.router.get(`${this.path}/user`, this.geItem);
        this.router.delete(`${this.path}/:id`, this.removeItem);
    }
    // phone
    private register = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data: User = request.body;
        this.model.exists({ phone: data.phone })
            .then(exist => {
                if (!exist) {
                    this.model.create(data)
                        .then(user => response.status(200).json({ result: this.parseModel(user) }))
                        .catch(err => response.status(422).json({ result: err.message || err }))
                } else {
                    this.model.findOne({ phone: data.phone })
                        .then(user => response.status(200).json({ result: this.parseModel(user) }))
                }
            })
    };


    private update = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data: User = request.body;
        this.model.findOneAndUpdate({ phone: data.phone }, { ...data, updatedAt: Date.now() }, { new: true })
            .then(user => response.status(200).json({ result: this.parseModel(user) }))
            .catch(err => response.status(422).json({ result: err.message || err }));
    }

    private getList = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data = request.params;
        this.model.paginate({}, { page: +data.page || 1, limit: +data.limit || 20 })
            .then(({ docs, total, limit, page, pages }) => {
                response.status(200).json({ result: docs.map(user => this.parseModel(user)) });
            })
            .catch(err => response.status(422).json({ result: err.message || err }));
    }

    private geItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data = request.params;
        this.model.findOne(data)
            .then(user => {
                response.status(200).json({ result: this.parseModel(user) })
            })
            .catch(err => response.status(422).json({ result: err.message || err }));
    }

    private removeItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.query
        this.model.findByIdAndDelete(id)
            .then(user => response.status(204).json())
            .catch(err => response.status(422).json({ result: err.message || err }));
    }

    private parseModel(user: User) {
        return {
            id: user._id,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            chat_id: user.chat_id,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }
}