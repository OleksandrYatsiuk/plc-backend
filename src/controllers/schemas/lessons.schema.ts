import * as mongoose from 'mongoose';
import * as  mongoosePaginate from 'mongoose-paginate';
import { Lesson } from '../../interfaces/index';

const schema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    context: { type: String, default: 0 },
    courseId: { type: String, required: true },
    file: { type: String, default: 0 },
    status: { type: Number, default: 0 },
    createdAt: { type: Number, default: Date.now() },
    updatedAt: { type: Number, default: Date.now() },
}, { versionKey: false });

schema.plugin(mongoosePaginate);

export default mongoose.model<Lesson & mongoose.Document>('lessons', schema);