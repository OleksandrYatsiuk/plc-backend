import * as mongoose from 'mongoose';

export interface User extends mongoose.Document {
    readonly id: string;
    firstName?: string;
    lastName?: string;
    phone: string;
    email?: string;
    status: number;
    createdAt: number;
    updatedAt: number;
}