import * as express from 'express';
import * as mongoose from 'mongoose';
import BaseController from './base.controller';
import model from './schemas/users.schema';
import { User } from '../interfaces/index'

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
        this.router.post(`${this.path}/start`, this.start);
        this.router.patch(`${this.path}/current`, this.update);
        this.router.get(`${this.path}/user`, this.geItem);
        this.router.delete(`${this.path}/:id`, this.removeItem);
    }

    private register = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data: User = request.body;
        this.model.exists({ phone: data.phone })
            .then(exist => {
                if (!exist) {
                    this.model.create(data)
                        .then(user => this.send200(response, this.parseModel(user)))
                        .catch(err => next(this.send422([{ field: 'phone', message: err.message }])))
                } else {
                    this.model.findOne({ phone: data.phone })
                        .then(user => this.send200(response, this.parseModel(user)));
                }
            })
    };


    private update = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data: User = request.body;
        this.model.findOneAndUpdate({ phone: data.phone }, { ...data, updatedAt: Date.now() }, { new: true })
            .then(user => this.send200(response, this.parseModel(user)))
            .catch(err => next(this.send422(err.message || err)))
    }

    private getList = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data = request.params;
        this.model.paginate({}, { page: +data.page || 1, limit: +data.limit || 20 })
            .then(({ docs, total, limit, page, pages }) => {
                this.send200Data(response, { total, limit, page, pages }, docs.map(user => this.parseModel(user)))
            })
            .catch(err => next(this.send422(err.message || err)))
    }

    private geItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data = request.params;
        this.model.findOne(data)
            .then(user => {
                if (user) {
                    this.send200(response, this.parseModel(user))
                } else {
                    next(this.send404('User'));
                }
            })
            .catch(err => next(this.send422(err.message || err)))
    }

    private removeItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params
        this.model.findByIdAndDelete(id)
            .then(user => this.send204(response))
            .catch(err => next(this.send422(err.message || err)))
    }

    private start = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const param = request.params
        const { lessonId } = request.body
        this.model.findOneAndUpdate(param, { $push: { lessons: lessonId } })
            .then(user => this.send200(response, null))
            .catch(err => next(this.send422(err.message || err)))
    }

    private parseModel(user: Partial<User>): Partial<User> {
        return {
            id: user._id,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            chat_id: user.chat_id,
            haveMessages: user.haveMessages,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }
}