import * as express from 'express';
import * as mongoose from 'mongoose';
import BaseController from "./base.controller";
import model from './schemas/lessons.schema';
import { Lesson } from '../interfaces/index'
import { NotFoundException, UnprocessableEntityException } from '../exceptions';

export class LessonsController extends BaseController {
    public path = '/lessons';
    public model: mongoose.PaginateModel<Lesson & mongoose.Document>;

    constructor() {
        super();
        this.initializeRoutes();
        this.model = model;
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}`, this.getList);
        this.router.get(`${this.path}/:id`, this.geItem);
        this.router.post(`${this.path}`, this.create);
        this.router.patch(`${this.path}/:id`, this.updateItem);
        this.router.delete(`${this.path}/:id`, this.removeItem);
    }
    private create = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data: Lesson = request.body;
        this.model.exists({ name: data.name })
            .then(exist => {
                if (!exist) {
                    this.model.create(data)
                        .then(user => response.status(200).json({ result: this.parseModel(user) }))
                        .catch(err => next(new UnprocessableEntityException([{ field: 'name', message: err.message }])))
                }
            })
    };

    private getList = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let data = request.query;
        data ? data = { courseId: data.courseId } : data = {};
        this.model.paginate(data, { page: +data.page || 1, limit: +data.limit || 20 })
            .then(({ docs, total, limit, page, pages }) => {
                response.status(200).json({ result: docs.map(lesson => this.parseModel(lesson)) });
            })
            .catch(err => response.status(422).json({ result: err.message || err }));
    }

    private geItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params;
        this.model.findById(id)
            .then(lesson => {
                response.status(200).json({ result: this.parseModel(lesson) })
            })
            .catch(err => next(new NotFoundException('Lesson')));
    }

    private updateItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params;
        const data = request.body;
        this.model.findByIdAndUpdate(id, data, { new: true })
            .then(lesson => response.status(200).json({ result: this.parseModel(lesson) }))
            .catch(err => next(new NotFoundException('Lesson')))

    }

    private removeItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params
        this.model.findByIdAndDelete(id)
            .then(() => response.status(204).json())
            .catch(err => next(new NotFoundException('Lesson')));
    }

    private parseModel(lesson: Lesson) {
        return {
            id: lesson._id,
            name: lesson.name,
            context: lesson.context,
            file: lesson.file,
            status: lesson.status,
            courseId: lesson.courseId,
            createdAt: lesson.createdAt,
            updatedAt: lesson.updatedAt
        }
    }
}