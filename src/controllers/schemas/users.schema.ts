import * as mongoose from 'mongoose';
import * as  mongoosePaginate from 'mongoose-paginate';
import { User } from '../../interfaces/index';

const userSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    email: { type: String, default: null },
    phone: { type: String, unique: true, required: true },
    status: { type: Number, default: 0 },
    createdAt: { type: Number, default: Date.now() },
    updatedAt: { type: Number, default: Date.now() },
}, { versionKey: false });

userSchema.plugin(mongoosePaginate);

export default mongoose.model<User & mongoose.Document>('users', userSchema);