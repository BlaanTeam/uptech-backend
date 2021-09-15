const { Notification } = require("../models/notificationModel");
const { isUserActive, getSessions } = require("../utils/redis");
const { notificationValidator } = require("../utils/validationSchema");
const socket = require("../utils/socketIo");
const createError = require("http-errors");

const addNotification = async (payload) => {
    try {
        let notification = new Notification(payload);
        await notification.save();
        await notification
            .populate({
                path: "sender",
                select: "userName profile",
            })
            .execPopulate();
        let isActive = await isUserActive(payload.receiver);
        if (isActive) {
            let sessionIds = await getSessions(payload.receiver);
            sessionIds.forEach((id) => {
                socket.to(id);
            });
            // emit the message event
            socket.emit("notification", notification);
        }
    } catch (err) {
        throw err;
    }
};

const getNotifications = async (req, res, next) => {
    try {
        let currentUser = req.currentUser;
        let perPage = 10;
        let query = await notificationValidator(req.query, { createdAt: 2 });
        let matchQuery = {};
        if (query.createdAt) {
            matchQuery = {
                $and: [
                    {
                        createdAt: { $lt: query.createdAt },
                    },
                    {
                        receiver: currentUser._id,
                    },
                ],
            };
        } else {
            matchQuery = {
                receiver: currentUser._id,
            };
        }
        let notifications = await Notification.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: "users",
                    let: { userId: "$sender" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$userId"],
                                },
                            },
                        },
                        {
                            $project: {
                                userName: 1,
                                profile: 1,
                            },
                        },
                    ],
                    as: "sender",
                },
            },
            {
                $unwind: "$sender",
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            { $limit: perPage },
        ]);
        res.json(notifications);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    addNotification,
    getNotifications,
};
