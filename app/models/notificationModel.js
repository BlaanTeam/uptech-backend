const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Model = mongoose.model;

const notifcationTypes = {
    LIKE_POST: 0,
    COMMENT_ON_POST: 1,
    FOLLOW_USER: 2,
    APP_NOTICE: 3,
};

const notificationSchema = new Schema({
    notificationType: {
        type: Number,
        enum: Object.values(notifcationTypes),
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
    Notification: Model("notifications", notificationSchema),
    notifcationTypes,
};
