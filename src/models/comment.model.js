import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose.Schema(
    {
        content: {
            Type: String,
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
)

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema); // Comment converts into lowercase and in plural while saving in the database like comments