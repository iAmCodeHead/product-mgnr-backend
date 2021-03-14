const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const CommentSchema = new Schema({
    comment: {
        type: String,
        required: true
    },
    commentBy: {
        name: {
            type: String,
            required: true
        },
        id: {
            type: Schema.Types.ObjectId,
            required: true
        },
        location: {
            type: String,
        }
    },
    commentOn: {
        productName: {
            type: String,
            required: true
        },
        id: {
            type: Schema.Types.ObjectId,
            required: true
        },
        location: {
            type: String,
        }
    }
},{
    timestamps: true
});

mongoose.model('Comments', CommentSchema);
