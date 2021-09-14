const { Notification } = require("../models/notificationModel");
const { isUserActive, getSessions } = require("../utils/redis");
const socket = require("../utils/socketIo");
// const createError = require("http-errors");

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

module.exports = {
    addNotification,
};
