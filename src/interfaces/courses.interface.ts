import * as mongoose from 'mongoose';

export interface Course extends mongoose.Document {
    readonly id: string;
    name: string;
    status?: number;
    description?: string;
    createdAt: number;
    updatedAt: number;
}
export interface Lesson extends mongoose.Document {
    readonly id: string,
    name: string,
    context?: string;
    file?: File;
    courseId: string;
    status?: number;
    createdAt: number;
    updatedAt: number;
} 