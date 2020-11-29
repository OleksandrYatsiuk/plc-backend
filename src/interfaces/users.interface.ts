import * as mongoose from 'mongoose';

export interface User extends mongoose.Document {
    readonly id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    code: number;
    chat_id: number;
    status: number;
    haveMessages: boolean;
    createdAt: number;
    updatedAt: number;
}
