import * as express from 'express';
import * as mongoose from 'mongoose';
import BaseController from './base.controller';
import model from './schemas/pages.schema';
import { IStaticPages } from '../interfaces/index'
import {  UnprocessableEntityException } from '../exceptions/index';

export class PagesController extends BaseController {
    public path = '/static-pages';
    public model: mongoose.PaginateModel<IStaticPages & mongoose.Document>;

    constructor() {
        super();
        this.initializeRoutes();
        this.model = model;
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}`, this.getList);
        this.router.post(`${this.path}`, this.create);
    }
    private create = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data: IStaticPages = request.body;
        this.model.create(data)
            .then(user => response.status(200).json({ result: this.parseModel(user) }))
            .catch(err => next(new UnprocessableEntityException([{ field: 'type', message: err.message }])))
    };


    private getList = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data = request.query;
        const filterData = JSON.parse(JSON.stringify(data));
        delete filterData.page;
        delete filterData.limit;
        this.model.paginate(filterData || {}, { page: +data.page || 1, limit: +data.limit || 20 })
            .then(({ docs, total, limit, page, pages }) => response.status(200).json({ result: docs.map(page => this.parseModel(page)) }))
            .catch(err => next(new UnprocessableEntityException([{ field: 'name', message: err.message }])))
    }

    private parseModel(page: IStaticPages): Partial<IStaticPages> {
        return {
            id: page._id,
            type: page.type,
            content: page.content,
            createdAt: page.createdAt,
            updatedAt: page.updatedAt
        }
    }
}