import * as express from 'express';
import * as mongoose from 'mongoose';
import BaseController from './base.controller';
import model from './schemas/study-progress.schema';
import lessonsModel from './schemas/lessons.schema';
import { IStudyProgress } from '../interfaces/index';

export class StudyProgressController extends BaseController {
    public path = '/study-progress';
    public model: mongoose.PaginateModel<IStudyProgress & mongoose.Document>;
    public lessonsModel = lessonsModel;
    constructor() {
        super();
        this.initializeRoutes();
        this.model = model;
    }

    private initializeRoutes(): void {
        this.router.patch(`${this.path}`, this.update);
        this.router.get(`${this.path}`, this.getList);
        this.router.get(`${this.path}/progress/:id`, this.progress);
        this.router.post(`${this.path}/add`, this.add);
    }


    private progress = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const { id } = request.params;
        const { courseId } = request.query;
        const filter = { userId: id };
        if (courseId) {
            filter['courseId'] = courseId;
        }
        this.model.find(filter)
            .populate('courseId', 'name').populate('lessonId', 'name')
            .sort({ courseId: 'asc', progress: 'desc' })
            .then(result => this.send200(response, result))
            .catch(err => next(this.send500(err)));
    }

    private getList = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const data = request.query;
        const queryParam = JSON.parse(JSON.stringify(data));
        delete queryParam['page'];
        delete queryParam['limit'];

        this.model.paginate(queryParam, { page: +data.page || 1, limit: +data.limit || 20 })
            .then(({ docs, total, limit, page, pages }) =>
                this.send200Data(response, { total, limit, page, pages }, docs.map(study => this.parseModel(study)))
            )
            .catch(err => next(this.send422(err.message)));
    }

    private add = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const { courseId, userId, chat_id }: Partial<IStudyProgress> = request.body;

        this.model.exists({ userId, courseId }).then(exist => {
            if (!exist) {
                this.lessonsModel.find({ courseId })
                    .then(lessons => {
                        if (lessons.length > 0) {
                            const data: Partial<IStudyProgress> = lessons.map(lessonId => ({ courseId, userId, lessonId, chat_id }))
                            this.model.insertMany(data)
                                .then(result => this.send200(response, result))
                                .catch(err => next(this.send422(err.message || err)));
                        } else {
                            this.send200(response, {})
                        }
                    })
            } else {
                next(this.send422([{ field: 'courseId', message: 'Course is already available!' }]));
            }
        })
    }


    private update = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
        const query = request.query
        const data: Partial<IStudyProgress> = request.body
        this.model.findOneAndUpdate(query, { ...data, updatedAt: Date.now() }, { new: true })
            .then(study => this.send200(response, this.parseModel(study)))
            .catch(err => next(this.send422(err.message || err)));
    }

    private parseModel(study: Partial<IStudyProgress>): Partial<IStudyProgress> {
        return {
            id: study._id,
            userId: study.userId,
            lessonId: study.lessonId,
            status: study.status,
            createdAt: study.createdAt,
            updatedAt: study.updatedAt
        }
    }
}