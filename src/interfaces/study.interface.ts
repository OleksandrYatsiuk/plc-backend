import * as mongoose from 'mongoose';

export interface IStudyProgress extends mongoose.Document {
    readonly _id: string;
    userId: string;
    chat_id:number;
    lessonId: string;
    courseId: string;
    status: EStudyProgress;
    createdAt: number;
    isAnswered: boolean;
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