import * as mongoose from 'mongoose';
import * as  mongoosePaginate from 'mongoose-paginate';
import { Course } from '../../interfaces/index';

const schema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    description: { type: String },
    status: { type: Number, default: 0 },
    createdAt: { type: Number, default: Date.now() },
    updatedAt: { type: Number, default: Date.now() },
}, { versionKey: false });

schema.plugin(mongoosePaginate);

export default mongoose.model<Course & mongoose.Document>('courses', schema);