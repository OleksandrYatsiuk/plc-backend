import * as express from 'express';
import * as mongoose from 'mongoose';
import BaseController from "./base.controller";
import model from './schemas/lessons.schema';
import courseModel from './schemas/courses.schema';
import { Lesson } from '../interfaces/index'

export class LessonsController extends BaseController {
    public path = '/lessons';
    public model: mongoose.PaginateModel<Lesson & mongoose.Document>;
    public courseModel = courseModel;
    constructor() {
        super();
        this.initializeRoutes();
        this.model = model;
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}`, this.getList);
        this.router.post(`${this.path}`, this.create);
        this.router.get(`${this.path}/:id`, this.geItem);
        this.router.patch(`${this.path}/:id`, this.updateItem);
        this.router.delete(`${this.path}/:id`, this.removeItem);
    }
    private create = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data: Lesson = request.body;
        this.model.exists({ name: data.name })
            .then(exist => {
                if (!exist) {
                    this.model.create(data)
                        .then(user => this.send200(response, this.parseModel(user)))
                        .catch(err => next(this.send422([{ field: 'name', message: err.message }])))
                } else {
                    next(this.send422([{ field: 'name', message: `Lesson "${data.name}" is already exist.` }]))
                }
            })
    };

    private getList = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        let data = request.query;
        if (Object.keys(data).length > 0) {
            data = { courseId: data.courseId }
        }
        this.model.paginate(data, { page: +data.page || 1, limit: +data.limit || 20 })
            .then(({ docs, total, limit, page, pages }) =>
                this.send200Data(response, { limit, page, pages, total },
                    docs.map(lesson => this.parseModel(lesson))))
            .catch(err => next(this.send422(err.message)));
    }

    private geItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params;
        this.model.findById(id)
            .then(lesson => this.send200(response, this.parseModel(lesson)))
            .catch(err => next(this.send404('Lesson')));
    }

    private updateItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params;
        const data = request.body;
        this.model.findByIdAndUpdate(id, { ...data, updatedAt: Date.now() }, { new: true })
            .then(lesson => this.send200(response, this.parseModel(lesson)))
            .catch(err => next(this.send404('Lesson')));

    }

    private removeItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params
        this.model.findByIdAndDelete(id)
            .then(() => this.send204(response))
            .catch(err => next(this.send404('Lesson')));
    }

    private parseModel(lesson: Partial<Lesson>): Partial<Lesson> {
        return {
            id: lesson._id,
            name: lesson.name,
            context: lesson.context,
            file: lesson.file,
            free: lesson.free,
            status: lesson.status,
            courseId: lesson.courseId,
            createdAt: lesson.createdAt,
            updatedAt: lesson.updatedAt
        }
    }
}