const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Model = mongoose.model;

const notifTypes = {
    LIKE_POST: 0,
    COMMENT_ON_POST: 1,
    FOLLOW_USER: 2,
    APP_NOTICE: 3,
};

const notifSchema = new Schema({
    notifType: {
        type: Number,
        enum: Object.values(notifTypes),
        required: true,
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "users",
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "users",
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: "posts",
    },
    isRead: {
        type: Boolean,
        required: true,
        default: false,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
    },
});

module.exports = {
    Notif: Model("notifications", notifSchema),
    notifTypes,
};
