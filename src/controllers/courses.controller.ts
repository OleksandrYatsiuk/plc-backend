import * as express from 'express';
import * as mongoose from 'mongoose';
import BaseController from "./base.controller";
import model from './schemas/courses.schema';
import { Course } from '../interfaces/index'
// import { code200 } from "../../middleware";

export class CoursesController extends BaseController {
    public path = '/courses';
    public model: mongoose.PaginateModel<Course & mongoose.Document>;

    constructor() {
        super();
        this.initializeRoutes();
        this.model = model;
    }

    private initializeRoutes(): void {
        this.router.get(`${this.path}`, this.getList);
        this.router.post(`${this.path}`, this.register);
        this.router.get(`${this.path}/:id`, this.geItem);
        this.router.delete(`${this.path}/:id`, this.removeItem);
    }
    // phone
    private register = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data: Course = request.body;
        this.model.exists({ name: data.name })
            .then(exist => {
                if (!exist) {
                    this.model.create(data)
                        .then(user => response.status(200).json({ result: this.parseModel(user) }))
                        .catch(err => response.status(422).json({ result: err.message || err }))
                }
            })
    };


    private getList = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data = request.params;
        this.model.paginate({}, { page: +data.page || 1, limit: +data.limit || 20 })
            .then(({ docs, total, limit, page, pages }) => {
                response.status(200).json({ result: docs.map(course => this.parseModel(course)) });
            })
            .catch(err => response.status(422).json({ result: err.message || err }));
    }

    private geItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params;
        this.model.findById(id)
            .then(course => {
                response.status(200).json({ result: this.parseModel(course) })
            })
            .catch(err => response.status(404).json({ result: "Course was not found" }));
    }

    private removeItem = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { id } = request.params
        this.model.findByIdAndDelete(id)
            .then(user => response.status(204).json())
            .catch(err => response.status(422).json({ result: err.message || err }));
    }

    private parseModel(course: Course) {
        return {
            id: course._id,
            name: course.name,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt
        }
    }
}