import * as express from 'express';
import * as mongoose from 'mongoose';
import BaseController from "./base.controller";
import model from './schemas/messages.schema';
import { Messages } from '../interfaces/index'
import { NotFoundException, UnprocessableEntityException } from '../exceptions/index';

export class MessagesController extends BaseController {
    public path = '/messages';
    public model: mongoose.PaginateModel<Messages & mongoose.Document>;

    constructor() {
        super();
        this.initializeRoutes();
        this.model = model;
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}`, this.getList);
        this.router.post(`${this.path}`, this.save);
        this.router.get(`${this.path}/:id`, this.geItem);
        this.router.delete(`${this.path}/:id`, this.removeItem);
    }
    private save = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data: Messages = request.body;
        this.model.create(data)
            .then(message => response.status(200).json({ result: this.parseModel(message) }))
            .catch(err => next(new UnprocessableEntityException([{ field: 'name', message: err.message }])))
    };


    private getList = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data = request.params;
        this.model.paginate({}, { page: +data.page || 1, limit: +data.limit || 20 })
            .then(({ docs, total, limit, page, pages }) => response.status(200).json({ result: docs.map(course => this.parseModel(course)) }))
            .catch(err => next(new UnprocessableEntityException([{ field: 'name', message: err.message }])))
    }

    private geItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params;
        this.model.findById(id)
            .then(course => response.status(200).json({ result: this.parseModel(course) }))
            .catch(err => next(new NotFoundException('Course')));
    }

    private removeItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params
        this.model.findByIdAndDelete(id)
            .then(() => response.status(204).json())
            .catch(() => next(new NotFoundException('Course')));
    }

    private parseModel(message: Messages) {
        return {
            id: message._id,
            chat_id: message.chat_id,
            lessonId: message.lessonId,
            type: message.type,
            message: message.message,
            createdAt: message.createdAt
        }
    }
}