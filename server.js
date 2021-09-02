const server = require("./app");
const socket = require("./app/utils/socketIo");
const debug = require("debug")("back-end:server");
const { normalizePort } = require("./app/utils/globals");
const io = require("./app/utils/socketIo");

// Attach socketio to server

io.attach(server);

/**
 * Listen on provided port, on all network interfaces.
 */
const port = normalizePort(process.env.PORT || "3000");
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    const addr = server.address();
    // debug(`Server start at http://${addr}:${addr.port}`)
    console.debug(`
  * Environment : ${process.env.ENV}\n
  * Running on  http://localhost:${addr.port}/  (Press CTRL+C to quit)\n
  `);
}
