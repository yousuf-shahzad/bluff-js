const { createDeck, shuffleDeck } = require('../utils/deck');
const logger = require('../utils/logger');

class GameLogic {
  startGame(room) {
    const deck = shuffleDeck(createDeck());
    
    // Distribute cards evenly
    room.players.forEach((player, index) => {
      player.hand = deck.slice(index * 13, (index + 1) * 13);
    });

    // add 1 random card to the pile
    room.currentPile = [deck[room.players.length * 13]];

    room.gameStarted = true;
    room.currentPlayer = room.players[0].id;

    console.log(room.players[0]);


    logger.info('Game started', { 
      roomCode: room.code, 
      players: room.players.map(p => p.username) 
    });

    return room;
  }

  getNextPlayer(room, currentPlayerId) {
    const currentIndex = room.players.findIndex(p => p.id === currentPlayerId);
    return room.players[(currentIndex + 1) % room.players.length].id;
  }

  checkGameOver(room) {
    const playersWithCards = room.players.filter(player => player.hand.length > 0);
    
    if (playersWithCards.length === 1) {
      const winner = playersWithCards[0];
      logger.info('Game Over', {
        roomCode: room.code,
        winner: winner.username
      });
      return winner;
    }
    return null;
  }

  playCards(room, player, cards, claimedValue) {
    cards.forEach(card => {
      const cardIndex = player.hand.findIndex(c => c.id === card.id);
      if (cardIndex !== -1) {
        player.hand.splice(cardIndex, 1);
        room.currentPile.push(card);
      }
    });

    room.currentClaimedValue = claimedValue;
    logger.info('Cards played', { 
      roomCode: room.code, 
      playerId: player.id, 
      cardCount: cards.length,
      claimedValue 
    });

    return room;
  }

  resolveBluffCall(room, callerSocketId) {
    const lastPlayer = room.players.find(p => p.id !== callerSocketId);
    const caller = room.players.find(p => p.id === callerSocketId);
    
    const hasClaimedCards = room.currentPile.some(card => 
      card.value === room.currentClaimedValue
    );

    if (hasClaimedCards) {
      // Caller picks up cards if bluff call was wrong
      caller.hand.push(...room.currentPile);
    } else {
      // Last player picks up cards if bluff was successful
      lastPlayer.hand.push(...room.currentPile);
    }

    room.currentPile = [];
    room.currentClaimedValue = null;

    logger.info('Bluff called', { 
      roomCode: room.code, 
      caller: caller.username, 
      result: hasClaimedCards ? 'Failed' : 'Successful'
    });

    return room;
  }
}

module.exports = new GameLogic();