import * as mongoose from 'mongoose';

export interface Messages extends mongoose.Document {
    readonly id: string;
    message: Message;
    chat_id: string;
    lessonId: string;
    createdAt?: number;
}
export interface CustomMessage {
    readonly id?: string;
    message: Message;
    chat_id: number;
    lessonId: string;
    createdAt?: number;
}

interface Message {
    id: number;
    text: string;
    date: number;
    photo?: FileOptions;
    document?: FileOptions;
}
export interface FileOptions {
    type: TFileTypes;
    link: string;
    caption: string;
}

export type TFileTypes = 'file' | 'photo';