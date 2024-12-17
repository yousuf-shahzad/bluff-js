const crypto = require('crypto');
const constants = require('../config/constants');

class RoomManager {
  constructor() {
    this.rooms = {};
  }

  generateRoomCode() {
    let roomCode;
    do {
      roomCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    } while (this.rooms[roomCode]);
    return roomCode;
  }

  createRoom(userId, username) {
    const roomCode = this.generateRoomCode();
    this.rooms[roomCode] = {
      code: roomCode,
      players: [
      ],
      gameStarted: false,
      currentPile: [],
      currentClaimedValue: null,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      maxPlayers: constants.ROOM_CODES.MAX_PLAYERS,
      hostId: userId  // Store the host's user ID
    };
    return roomCode;
  }

  joinRoom(roomCode, userId, username, socketId) {
    const room = this.rooms[roomCode];
    if (!room || room.players.length >= constants.ROOM_CODES.MAX_PLAYERS) {
      return false;
    }

    room.players.push({ 
      id: userId, 
      username, 
      hand: [],
      socketId: socketId 
    });

    room.lastActivity = Date.now();
    return true;
  }

  cleanupInactiveRooms() {
    const now = Date.now();
    Object.keys(this.rooms).forEach(roomCode => {
      const room = this.rooms[roomCode];
      if (now - room.lastActivity > constants.ROOM_CODES.MAX_INACTIVE_TIME) {
        delete this.rooms[roomCode];
      }
    });
  }
}

module.exports = new RoomManager();