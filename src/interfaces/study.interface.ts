import * as mongoose from 'mongoose';

export interface IStudyProgress extends mongoose.Document {
    readonly id: string;
    userId: string;
    lessonId: string;
    courseId: string;
    status: EStudyProgress;
    createdAt: number;
    updatedAt: number;
}
export enum EStudyProgress {
    NOT_STARTED = 0,
    STARTED = 1,
    IN_PROGRESS = 2,
    COMPLETED = 3
}
export enum EStudyStatus {
    ENABLED = 0,
    DISABLED = 1,
}