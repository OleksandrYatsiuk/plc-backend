import { CustomMessage } from './../interfaces/messages.interface';
import * as express from 'express';
import * as mongoose from 'mongoose';
import axios from 'axios';
import BaseController from "./base.controller";
import model from './schemas/messages.schema';
import studyModel from './schemas/study-progress.schema';
import { Messages } from '../interfaces/index'
import { NotFoundException, UnprocessableEntityException } from '../exceptions/index';
import * as multer from 'multer';
import { bot } from '../telegram-bot/telegram-bot'

export class MessagesController extends BaseController {
    public url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/`;
    public path = '/messages';
    public model: mongoose.PaginateModel<Messages & mongoose.Document>;
    public studyModel = studyModel;
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
        this.router.post(`${this.path}/:id`, this.removeItem);
        this.router.post(`${this.path}/refresh`, this.refreshFile);
    }

    private save = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data: Messages = request.body;
        this.studyModel.findOneAndUpdate({ lessonId: data.lessonId, chat_id: data.chat_id }, { isAnswered: false, updatedAt: Date.now() }, { new: true })
            .then(res => {
                this.model.create(data)
                    .then(message => response.status(200).json({ result: this.parseModel(message) }))
                    .catch(err => next(new UnprocessableEntityException([{ field: 'name', message: err.message }])))
            })
            .catch(err => response.status(500).json({ result: err.message }))
    };


    private getList = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data = request.query;
        const queryParam = JSON.parse(JSON.stringify(data));
        delete queryParam['page'];
        delete queryParam['limit'];

        this.model.paginate(queryParam, { page: +data.page || 1, limit: +data.limit || 20 })
            .then(({ docs, total, limit, page, pages }) => {
                response.status(200).json({
                    result: docs.map(course => this.parseModel(course)), pagination: {
                        page, limit, total, pages
                    }
                })
            })
            .catch(err => next(new UnprocessableEntityException([{ field: 'name', message: err.message }])))
    }

    private geItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params;
        this.model.findById(id)
            .then(course => response.status(200).json({ result: this.parseModel(course) }))
            .catch(err => next(new NotFoundException('Message')));
    }

    private removeItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params;
        const msg: CustomMessage = request.body;
        bot.telegram.deleteMessage(msg.chat_id, msg.message.id)
            .then(res => {
                this.model.findByIdAndDelete(id)
                    .then(() => response.status(204).json())
                    .catch(err => next(new NotFoundException('Message')));
            })
            .catch(err => response.status(500).json({ result: err.message }))
    }
    private sendToUser = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const msg: CustomMessage = request.body;
        this.studyModel.findOneAndUpdate({ lessonId: msg.lessonId, chat_id: msg.chat_id }, { isAnswered: true, updatedAt: Date.now() }, { new: true })
            .then(res => {
                if (!msg.message.content.link) {
                    this.model.create(msg)
                        .then(message => response.status(200).json({ result: this.parseModel(message) }))
                        .catch(err => next(new Error(err.message)))
                } else {
                    bot.telegram.getFileLink(msg.message.content.link)
                        .then(link => {
                            msg.message.content.link = link;
                            msg.message.content.fileId = msg.message.content.link;
                            this.model.create(msg)
                                .then(message => response.status(200).json({ result: this.parseModel(message) }))
                                .catch(err => next(new Error(err.message)))
                        })
                        .catch(err => next(new Error(err.message)))
                }
            })
            .catch(err => response.status(500).json({ result: err.message }))
    }
    private refreshFile = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const msg: Messages['message'] = request.body;
        bot.telegram.getFileLink(msg.content?.fileId)
            .then(link => {
                msg.content.link = link;
                this.model.findByIdAndUpdate(msg.id, { $set: msg }, { new: true })
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