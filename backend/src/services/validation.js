// Enhanced ValidationService.js with better debugging
class ValidationService {
  validateJoinRoom(userId, username, roomCode, rooms) {
    username = username?.trim();
    roomCode = roomCode?.trim();

    // console.log("Trying to join room:", roomCode);

    if (!username) {
      throw new Error("Username is required");
    }

    if (!roomCode) {
      throw new Error("Room code is required");
    }

    if (!rooms || typeof rooms !== "object") {
      throw new Error("Invalid rooms data");
    }

    const room = rooms[roomCode];
    // console.log("Found room:", room);

    if (!room) {
      throw new Error("Room does not exist");
    }

    if (room.players.some(p => p.id === userId)) {
      throw new Error("User is already in the room");
     }

    if (!room.players || !Array.isArray(room.players)) {
      throw new Error("Invalid room data");
    }

    if (room.players.some((p) => p.username === username)) {
      throw new Error("Username is already taken");
    }
  }

  // validateCardPlay(player, cards, claimedValue) {
  //   console.log(player, cards, claimedValue);
  //   console.log(player.hand);
  //   if (!player || !player.hand) {
  //     throw new Error("Invalid player data");
  //   }

  //   if (!cards || !Array.isArray(cards) || cards.length === 0) {
  //     throw new Error("Must play at least one card");
  //   }

  //   const invalidCards = cards.filter(
  //     (card) => !player.hand.some((playerCard) => playerCard.id === card.id)
  //   );

  //   if (invalidCards.length > 0) {
  //     throw new Error("Invalid cards played");
  //   }

  //   if (!claimedValue || typeof claimedValue !== "string") {
  //     throw new Error("Must claim a valid card value");
  //   }
  // }

  /**
   * Validate card play with enhanced sequential placement checks
   * @param {Object} player - Player attempting to play cards
   * @param {Array} cards - Cards being played
   * @param {string} claimedValue - Claimed card value
   * @throws {Error} If validation fails
   */
  validateCardPlay(player, cards, claimedValue) {
    // Check if it's the player's turn
    if (!player) {
      throw new Error('Invalid player');
    }

    // Validate cards belong to the player
    cards.forEach(card => {
      const playerOwnsCard = player.hand.some(c => c.id === card.id);
      if (!playerOwnsCard) {
        throw new Error('Player does not own all specified cards');
      }
    });

    // Validate all played cards are of the claimed value
    // const invalidCards = cards.filter(card => card.value !== claimedValue);
    // if (invalidCards.length > 0) {
    //   throw new Error('All played cards must match the claimed value');
    // }

    // Additional checks can be added here if needed
  }

  validateCreateRoom(username) {
    if (!username || username.trim() === "") {
      throw new Error("Username is required");
    }
    return true;
  }

  validateRoomExists(roomCode, rooms) {
    roomCode = roomCode?.trim();
    console.log("Checking existence of room:", roomCode);
    console.log("Available rooms:", rooms);

    if (!roomCode || !rooms || !rooms[roomCode]) {
      throw new Error("Room does not exist");
    }
    return true;
  }
}

module.exports = new ValidationService();
