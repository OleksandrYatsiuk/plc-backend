import { CustomMessage, EContentTypes, EMessageTypes } from './../interfaces/messages.interface';
import * as express from 'express';
import * as mongoose from 'mongoose';
import axios from 'axios';
import BaseController from "./base.controller";
import model from './schemas/messages.schema';
import { Messages } from '../interfaces/index'
import { NotFoundException, UnprocessableEntityException } from '../exceptions/index';
import { Message } from 'telegraf/typings/telegram-types';
import * as multer from 'multer';
import { bot } from '../telegram-bot/telegram-bot'

export class MessagesController extends BaseController {
    public url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/`;
    public path = '/messages';
    public model: mongoose.PaginateModel<Messages & mongoose.Document>;
    public http = axios;
    public upload = multer({ dest: 'uploads/', preservePath: true })
    constructor() {
        super();


        this.initializeRoutes();
        this.model = model;

    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}`, this.getList);
        this.router.post(`${this.path}`, this.save);
        this.router.post(`${this.path}/message`, this.upload.any(), this.sendToUser);
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
    private sendToUser = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const msg: CustomMessage = request.body;

        bot.telegram.getFileLink(msg.message.content.link)
            .then(link => {
                msg.message.content.link = link;
                this.model.create(msg)
                    .then(message => response.status(200).json({ result: this.parseModel(message) }))
                    .catch(err => next(new Error(err.message)))
            })
            .catch(err => next(new Error(err.message)))

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