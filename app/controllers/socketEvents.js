const { Message, Conversation } = require("../models/chatModel");
const { Notif } = require("../models/notifModel");
const { isUserActive, getSessions } = require("../utils/redis");
const { chatValidator } = require("../utils/validationSchema");
const createError = require("http-errors");
// handle socket.io events here
const typingEvent = async (socket, payload) => {
    try {
        let data = await chatValidator(payload, { userId: 1, convId: 1 });
        let isActive = await isUserActive(data.userId);
        if (isActive) {
            let sessionIds = await getSessions(data.userId);
            sessionIds.forEach((id) => {
                socket.to(id);
            });
            // emit the message event
            socket.emit("typing", { convId: data.convId });
        }
    } catch (err) {
        socket.emit("error", err);
    }
};

const markReadEvent = async (socket, payload) => {
    try {
        let currentUser = socket.currentUser;
        let data = await chatValidator(payload, { messageId: 1, userId: 1 });
        console.log(data);
        let message = await Message.aggregate([
            {
                $match: {
                    _id: data.messageId,
                },
            },
            {
                $addFields: {
                    read: {
                        $cond: [
                            {
                                $eq: [
                                    {
                                        $size: {
                                            $filter: {
                                                input: "$readByRecipients",
                                                as: "array",
                                                cond: {
                                                    $eq: [
                                                        "$$array.userId",
                                                        currentUser._id,
                                                    ],
                                                },
                                            },
                                        },
                                    },
                                    1,
                                ],
                            },
                            true,
                            false,
                        ],
                    },
                },
            },
            {
                $lookup: {
                    from: "conversations",
                    let: { convId: "$convId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$convId"] },
                                        { $in: [data.userId, "$userIds"] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                            },
                        },
                    ],
                    as: "conv",
                },
            },
            {
                $unwind: "$conv",
            },
            {
                $project: {
                    __v: 0,
                    readByRecipients: 0,
                    convId: 0,
                },
            },
        ]);
        message = message[0];
        if (message) {
            let isActive = await isUserActive(message.userId);
            if (isActive) {
                let sessionIds = await getSessions(message.userId);
                sessionIds.forEach((id) => {
                    socket.to(id);
                });
                // emit the message event
                socket.emit("read", { messageId: message._id });
            }
            if (!message.read) {
                await Message.findOneAndUpdate(
                    {
                        _id: message._id,
                    },
                    {
                        $addToSet: {
                            readByRecipients: { userId: data.userId },
                        },
                    },
                    {
                        projection: {
                            _id: 1,
                        },
                    }
                );
            }
        } else {
            // TODO: throw valid error
            throw new Error();
        }
    } catch (err) {
        socket.emit("error", err);
    }
};

const countUnRead = async (socket, payload) => {
    try {
        let currentUser = socket.currentUser;
        let notifs = await Notif.aggregate([
            {
                $match: {
                    $and: [
                        { receiver: currentUser._id },
                        {
                            isRead: false,
                        },
                    ],
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $limit: 10,
            },
            { $count: "notifsCount" },
        ]);
        let msgs = await Conversation.aggregate([
            {
                $match: {
                    $and: [
                        { userIds: currentUser._id },
                        { messages: { $elemMatch: { $exists: true } } },
                    ],
                },
            },
            {
                $addFields: {
                    lastMessage: {
                        $arrayElemAt: ["$messages", -1],
                    },
                },
            },

            {
                $sort: {
                    timestamp: -1,
                },
            },
            {
                $limit: 10,
            },
            {
                $lookup: {
                    from: "messages",
                    let: { msgId: "$lastMessage", userId: currentUser._id },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ["$_id", "$$msgId"],
                                        },
                                        {
                                            $ne: ["$userId", "$$userId"],
                                        },
                                        {
                                            $eq: [
                                                { $size: "$readByRecipients" },
                                                1,
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "lastMessage",
                },
            },
            { $unwind: "$lastMessage" },
            {
                $count: "msgsCount",
            },
        ]);
        let msgsCount = !msgs[0] ? 0 : msgs[0].msgsCount;
        let notifsCount = !notifs[0] ? 0 : notifs[0].notifsCount;
        socket.emit("count-unread", { msgsCount, notifsCount });
    } catch (err) {
        console.log(err);
        socket.emit("error", err);
    }
};
module.exports = {
    typingEvent,
    markReadEvent,
    countUnRead,
};
