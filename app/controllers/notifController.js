const { Notif } = require("../models/notifModel");
const { isUserActive, getSessions } = require("../utils/redis");
const { notifValidator } = require("../utils/validationSchema");
const socket = require("../utils/socketIo");
const createError = require("http-errors");

const addNotif = async (payload) => {
    try {
        let notif = new Notif(payload);
        await notif.save();
        await notif
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
            socket.emit("notif", notif);
        }
    } catch (err) {
        throw err;
    }
};

const getNotifs = async (req, res, next) => {
    try {
        let currentUser = req.currentUser;
        let perPage = 10;
        let query = await notifValidator(req.query, { createdAt: 2 });
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
        let notifs = await Notif.aggregate([
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
        res.json(notifs);
    } catch (err) {
        next(err);
    }
};

const deleteNotif = async (req, res, next) => {
    try {
        let currentUser = req.currentUser;
        let { notifId } = await notifValidator(req.params, {
            notifId: 1,
        });

        let notif = await Notif.findOne({ _id: notifId });
        if (!notif) throw createError.NotFound();
        else if (notif.receiver.toString() !== currentUser._id.toString())
            throw createError.Forbidden();
        await notif.remove();
        res.status(204);
        res.end();
    } catch (err) {
        next(err);
    }
};

const readNotif = async (req, res, next) => {
    try {
        let currentUser = req.currentUser;
        let { notifId } = await notifValidator(req.params, { notifId: 2 });
        let notif = await Notif.findOne({ _id: notifId });
        if (!notif) throw createError.NotFound();
        else if (notif.receiver.toString() !== currentUser._id.toString())
            throw createError.Forbidden();
        else if (notif.isRead) {
            res.status(304);
            res.end();
            return;
        }
        notif.isRead = true;
        notif.updatedAt = Date.now();
        await notif.save();
        res.json(notif);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    addNotif,
    getNotifs,
    deleteNotif,
    readNotif,
};
