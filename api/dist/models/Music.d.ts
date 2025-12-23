import mongoose, { Document } from 'mongoose';
export interface IMusic extends Document {
    id: number;
    title: string;
    url: string;
}
export declare const Music: mongoose.Model<IMusic, {}, {}, {}, mongoose.Document<unknown, {}, IMusic, {}, {}> & IMusic & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Music.d.ts.map