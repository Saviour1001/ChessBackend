/**
 * Here is where we should register event listeners and emitters.
 */

var io;
var gameSocket;
// gamesInSession stores an array of all active socket connections
var gamesInSession = [];

const initializeGame = (sio, socket) => {
  console.log("new socket added" + socket.id);
  /**
   * initializeGame sets up all the socket event listeners.
   */

  // initialize global variables.
  io = sio;
  gameSocket = socket;

  // pushes this socket to an array which stores all the active sockets.
  gamesInSession.push(gameSocket);

  // Run code when the client disconnects from their socket session.
  gameSocket.on("disconnect", onDisconnect);

  // Sends new move to the other socket session in the same room.
  gameSocket.on("new move", newMove);

  // User creates new game room after clicking 'submit' on the frontend
  gameSocket.on("createNewGame", createNewGame);

  // User joins gameRoom after going to a URL with '/game/:gameId'
  gameSocket.on("wantsToJoin", wantsToJoin);

  gameSocket.on("playerJoinsGame", playerJoinsGame);

  gameSocket.on("send data", sendData);
};

function wantsToJoin(gameId) {
  console.log("joing " + io.sockets.adapter.rooms);
  /**
   * Joins the given socket to a session with it's gameId
   */

  // Look up the room ID in the Socket.IO manager object.
  var room = io.sockets.adapter.rooms.get(gameId);
  console.log(room);

  // If the room exists...
  if (room === undefined) {
    this.emit("status", "This game session does not exist.");
    return;
  }
  if (room.size < 2) {
    //console.log(room.size);
    this.emit("match found");
  } else {
    // Otherwise, send an error message back to the player.
    this.emit("status", "There are already 2 people playing in this room.");
  }
}

function playerJoinsGame(idData) {
  console.log("joing " + io.sockets.adapter.rooms);
  /**
   * Joins the given socket to a session with it's gameId
   */

  // A reference to the player's Socket.IO socket object
  var sock = this;

  // Look up the room ID in the Socket.IO manager object.
  var room = io.sockets.adapter.rooms.get(idData.gameId);
  console.log(room);

  // If the room exists...
  if (room === undefined) {
    this.emit("status1", "This game session does not exist.");
    return;
  }
  if (room.size < 2) {
    // Join the room
    sock.join(idData.gameId);

    console.log(room.size);

    io.sockets.in(idData.gameId).emit("start game", idData.address);
  } else {
    // Otherwise, send an error message back to the player.
    this.emit("status1", "There are already 2 people playing in this room.");
  }
}

function createNewGame(gameId) {
  /*      // Return the Room ID (gameId) and the socket ID (mySocketId) to the browser client
     this.emit('createNewGame', {gameId: gameId, mySocketId: this.id}); */
  console.log("createNewGame " + gameId);
  // Join the Room and wait for the other player
  this.join(gameId);
}

function newMove(move) {
  /**
   * First, we need to get the room ID in which to send this message.
   * Next, we actually send this message to everyone except the sender
   * in this room.
   */
  console.log("move " + move);
  const gameId = move.gameId;

  io.to(gameId).emit("opponent move", move);
}

function onDisconnect() {
  var i = gamesInSession.indexOf(gameSocket);
  gamesInSession.splice(i, 1);
}

function sendData(data) {
  console.log("sending data " + data);
  io.to(data.gameId).emit("send data", data);
}

exports.initializeGame = initializeGame;
