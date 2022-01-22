const chessGame = require("./chess-game");
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  chessGame.initializeGame(io, socket);
});

http.listen(process.env.PORT || 4000, function () {
  console.log("listening on *:4000");
});
