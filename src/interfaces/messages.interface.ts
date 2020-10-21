import * as mongoose from 'mongoose';

export interface Messages extends mongoose.Document {
    readonly id: string;
    message: Message;
    chat_id: string;
    lessonId: string;
    createdAt?: number;
}
interface Message {
    id: number;
    text: string;
    date: number;
    photo: {
        id: string;
        caption: string;
    },
    document: {
        id: string;
        caption: string;
    }
}