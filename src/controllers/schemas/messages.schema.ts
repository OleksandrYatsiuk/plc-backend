import * as mongoose from 'mongoose';
import * as  mongoosePaginate from 'mongoose-paginate';
import { Messages } from '../../interfaces/index';

const schema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    chat_id: { type: Number },
    lessonId: { type: String },
    message: {
        id: { type: Number },
        text: { type: String, default:'' },
        date: { type: Number },
        photo: {
            id: { type: String },
            caption: { type: String, default:'' }
        },
        document: {
            id: { type: String },
            caption: { type: String, default:'' }
        }
    },
    createdAt: { type: Number, default: Date.now() },
}, { versionKey: false });

schema.plugin(mongoosePaginate);

export default mongoose.model<Messages & mongoose.Document>('messages', schema);