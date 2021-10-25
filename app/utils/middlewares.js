const { verifyAccessToken, signAccessToken } = require("./jwt");
const { User } = require("../models/authModel");
const createError = require("http-errors");

// this function will protect the route by check the access token if exist in headers and if really valid
const protectRouter = async (req, res, next) => {
    try {
        if (!req.headers.hasOwnProperty("x-auth-token"))
            throw createError.Unauthorized();
        let accessToken = req.headers["x-auth-token"]?.trim();
        let payload = await verifyAccessToken(accessToken);
        let user = await User.findOne({ userName: payload.username });
        if (!user || !user.mailConfirmed) throw createError.Unauthorized();
        req.currentUser = user;
        next();
    } catch (err) {
        next(err);
    }
};
// this function will protect the socketio from any unauthorized request
const protectSocketIo = async (socket, next) => {
    try {
        if (!socket.handshake.headers.hasOwnProperty("x-auth-token")) {
            throw createError.Unauthorized();
        }
        let accessToken = socket.handshake.headers["x-auth-token"]?.trim();
        let payload = await verifyAccessToken(accessToken);
        let user = await User.findOne(
            { userName: payload.username },
            { userPass: 0 }
        );
        if (!user && !user.mailConfirmed) throw createError.Unauthorized();
        socket.currentUser = user;
        next();
    } catch (err) {
        next({ message: JSON.stringify(err) });
    }
};

const errorHandler = async (err, req, res, next) => {
    const props = err.props || {};
    const error = {
        status: err.status,
        msg: err.message,
        ...props,
    };
    res.status(err.status || 500);
    res.json({ error });
};

module.exports = {
    protectRouter,
    protectSocketIo,
    errorHandler,
};
