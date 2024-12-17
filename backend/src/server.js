require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');  // Add this import

const logger = require("./utils/logger");
const roomManager = require("./utils/roomManager");
const gameLogic = require("./services/gameLogic");
const validationService = require("./services/validation");
const { PORT } = require("./config/constants");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Socket.IO Connection Handler
io.on("connection", (socket) => {
  // Extract user details from connection query
  const userId = socket.handshake.query.userId;
  const username = socket.handshake.query.username;

  // Create Room
  // Modify the createRoom handler
  socket.on("createRoom", (data) => {
    try {
      const userId = data.userId;
      const username = data.username;
  
      const roomCode = roomManager.createRoom(userId, username);
      socket.join(roomCode);
  
      const room = roomManager.rooms[roomCode];
      
      // Calculate players left to join
      const playersLeft = room.maxPlayers - room.players.length;
  
      // Explicitly emit to the host that they've created the room
      socket.emit("roomCreated", {
        roomCode,
        hostId: userId, 
        username: username,
        // playersLeft: playersLeft  // Add this line
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });
  
  // Modify the joinRoom handler
  socket.on("joinRoom", ({ username, roomCode, userId, socketId }) => {
    try {
      const room = roomManager.rooms[roomCode];
      console.log("Room:", room);
      console.log("User ID:", userId);

      validationService.validateJoinRoom(userId, username, roomCode, roomManager.rooms);
      
      // Check if this is the original host trying to rejoin
  
      const joinSuccessful = roomManager.joinRoom(roomCode, userId, username, socketId);
  
      if (!joinSuccessful) {
        socket.emit("error", { message: "Cannot join room" });
        return;
      }
  
      socket.join(roomCode);
      const updatedRoom = roomManager.rooms[roomCode];
  
      // Emit to all players that a new player has joined
      io.to(roomCode).emit("playerJoined", {
        player: { id: userId, username }
        // Add a flag to indicate if this is the original host rejoining
      });
  
      if (updatedRoom.players.length === updatedRoom.maxPlayers) {
        const gameStartedRoom = gameLogic.startGame(updatedRoom);
        updateGameState(roomCode, gameStartedRoom);
      } else {
        // If the game hasn't started, broadcast updated players left
        const playersLeft = updatedRoom.maxPlayers - updatedRoom.players.length;
      }
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });
  

  // Check Room
  socket.on("checkRoom", (roomCode) => {
    try {
      validationService.validateRoomExists(roomCode, roomManager.rooms);
      socket.emit("roomExists", true);
    } catch (error) {
      socket.emit("roomExists", false);
    }
  });

  // Play Cards
  socket.on("playCards", ({ roomCode, cards, claimedValue, userId }) => {
    const room = roomManager.rooms[roomCode];
    const player = room.players.find((p) => p.id === userId);
    console.log("Id:", userId);
    console.log("Player:", player);

    try {
      validationService.validateCardPlay(player, cards, claimedValue);

      const updatedRoom = gameLogic.playCards(
        room,
        player,
        cards,
        claimedValue
      );
      updatedRoom.currentPlayer = gameLogic.getNextPlayer(room, userId);

      updateGameState(roomCode, updatedRoom);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  // Call Bluff
  socket.on("callBluff", (roomCode) => {
    const room = roomManager.rooms[roomCode];

    const updatedRoom = gameLogic.resolveBluffCall(room, userId);

    const gameWinner = gameLogic.checkGameOver(updatedRoom);
    if (gameWinner) {
      io.to(roomCode).emit("gameOver", {
        winner: {
          id: gameWinner.id,
          username: gameWinner.username,
        },
      });
      delete roomManager.rooms[roomCode];
    } else {
      updateGameState(roomCode, updatedRoom);
    }
  });
});

// Update Game State Helper
function updateGameState(roomCode, room) {
  io.to(roomCode).emit("gameState", {
    players: room.players.map((p) => ({
      id: p.id,
      username: p.username,
      cardCount: p.hand.length,
    })),
    currentPlayer: room.currentPlayer,
    currentPile: room.currentPile,
    currentClaimedValue: room.currentClaimedValue,
    gameStarted: room.gameStarted,
  });

  // Send individual hands to players
  room.players.forEach((player) => {
    io.to(player.socketId).emit("dealCards", player.hand);
  });
}

// Periodic Room Cleanup
setInterval(() => {
  roomManager.cleanupInactiveRooms();
}, 60 * 60 * 1000);

// Start Server
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
