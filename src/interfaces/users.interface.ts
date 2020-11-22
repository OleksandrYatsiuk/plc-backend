import * as mongoose from 'mongoose';

export interface User extends mongoose.Document {
    readonly id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    chat_id: number;
    status: number;
    haveMessages: boolean;
    createdAt: number;
    updatedAt: number;
}
