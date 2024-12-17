const { createDeck, shuffleDeck } = require('../utils/deck');
const logger = require('../utils/logger');

class GameLogic {
  /**
   * Determine if a card can be legally placed based on the current pile
   * @param {Array} currentPile - Current cards in the pile
   * @param {Array} playedCards - Cards being played
   * @param {string} claimedValue - Value claimed for the cards
   * @returns {boolean} Whether the cards can be legally placed
   */
  validateCardPlacement(currentPile, playedCards, claimedValue) {
    // If no cards in pile, any card can be played
    if (currentPile.length === 0) {
      return true;
    }

    // Get the last card in the current pile
    const lastCard = currentPile[currentPile.length - 1];
    
    // Define card order
    const CARD_ORDER = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    // Find indexes of last card and claimed card
    const lastCardIndex = CARD_ORDER.indexOf(lastCard.value);
    const claimedCardIndex = CARD_ORDER.indexOf(claimedValue);

    // Allowed transitions
    const allowedTransitions = [
      { from: 'A', to: ['2', 'K'] },
      { from: 'K', to: ['A', '2'] },
      { from: '2', to: ['3', 'A'] }
    ];

    // Check if this is a special transition
    const specialTransition = allowedTransitions.find(
      t => t.from === lastCard.value && t.to.includes(claimedValue)
    );

    if (specialTransition) {
      return true;
    }

    // Standard sequential placement
    const standardTransition = 
      claimedCardIndex === (lastCardIndex + 1) % CARD_ORDER.length;

    return standardTransition;
  }

  /**
   * Start the game by distributing cards and setting initial game state
   * @param {Object} room - The game room object
   * @returns {Object} Updated room state
   */
  startGame(room) {
    // Validate player count
    if (room.players.length < 2 || room.players.length > 4) {
      throw new Error('Game must have 2-4 players');
    }

    // Create and shuffle the deck
    const deck = shuffleDeck(createDeck());
    
    // Calculate cards per player
    const cardsPerPlayer = Math.floor(52 / room.players.length);
    
    // Distribute cards evenly
    room.players.forEach((player, index) => {
      const startIndex = index * cardsPerPlayer;
      player.hand = deck.slice(startIndex, startIndex + cardsPerPlayer);
      player.initialCardCount = player.hand.length;
    });
    
    // Initialize game state
    room.currentPile = [];

    // Add random card from deck to top of pile
    const randomCardIndex = Math.floor(Math.random() * deck.length);
    room.currentPile.push(deck[randomCardIndex]);

    room.gameStarted = true;
    room.currentPlayer = room.players[0].id;
    room.currentClaimedValue = null;
    
    logger.info('Game started', {
      roomCode: room.code,
      players: room.players.map(p => ({
        username: p.username, 
        cardCount: p.hand.length
      }))
    });
    
    return room;
  }

  /**
   * Determine the next player in the game
   * @param {Object} room - The game room object
   * @param {string} currentPlayerId - ID of the current player
   * @returns {string} ID of the next player
   */
  getNextPlayer(room, currentPlayerId) {
    const currentIndex = room.players.findIndex(p => p.id === currentPlayerId);
    return room.players[(currentIndex + 1) % room.players.length].id;
  }

  /**
   * Check if the game is over
   * @param {Object} room - The game room object
   * @returns {Object|null} Winner player object or null
   */
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

  /**
   * Play cards with claimed value
   * @param {Object} room - The game room object
   * @param {Object} player - The player playing cards
   * @param {Array} cards - Cards being played
   * @param {string} claimedValue - Value claimed for the played cards
   * @returns {Object} Updated room state
   */
  /**
   * Play cards with sequential placement validation
   * @param {Object} room - The game room object
   * @param {Object} player - The player playing cards
   * @param {Array} cards - Cards being played
   * @param {string} claimedValue - Value claimed for the played cards
   * @returns {Object} Updated room state
   * @throws {Error} If card placement is invalid
   */
  playCards(room, player, cards, claimedValue) {
    // Validate input
    if (!claimedValue) {
      throw new Error('Must claim a card value when playing cards');
    }

    // Validate card placement
    if (!this.validateCardPlacement(room.currentPile, cards, claimedValue)) {
      throw new Error('Invalid card placement. Cards must be played sequentially.');
    }

    // Remove cards from player's hand
    cards.forEach(card => {
      const cardIndex = player.hand.findIndex(c => c.id === card.id);
      if (cardIndex !== -1) {
        player.hand.splice(cardIndex, 1);
        room.currentPile.push(card);
      }
    });

    // Update game state
    room.currentClaimedValue = claimedValue;
    room.currentClaimedCards = cards;

    logger.info('Cards played', {
      roomCode: room.code,
      playerId: player.id,
      cardCount: cards.length,
      claimedValue
    });

    return room;
  }

  /**
   * Resolve a bluff call
   * @param {Object} room - The game room object
   * @param {string} callerSocketId - Socket ID of the player calling the bluff
   * @returns {Object} Updated room state
   */
  resolveBluffCall(room, callerSocketId) {
    // Find caller and last player
    const caller = room.players.find(p => p.id === callerSocketId);
    const lastPlayer = room.players.find(p => p.id !== callerSocketId);
    
    // Check if the claimed cards match the actual claim
    const hasClaimedCards = room.currentClaimedCards.some(card => 
      card.value === room.currentClaimedValue
    );

    // Determine pile recipient based on bluff success
    if (hasClaimedCards) {
      // Bluff call was incorrect - caller picks up the pile
      caller.hand.push(...room.currentPile);
      
      logger.info('Bluff Call Failed', {
        roomCode: room.code,
        caller: caller.username,
        result: 'Caller picks up pile'
      });
    } else {
      // Bluff was successful - last player picks up the pile
      lastPlayer.hand.push(...room.currentPile);
      
      logger.info('Bluff Call Successful', {
        roomCode: room.code,
        caller: caller.username,
        result: 'Last player picks up pile'
      });
    }

    // Reset pile and claimed value
    room.currentPile = [];
    room.currentClaimedValue = null;
    room.currentClaimedCards = [];

    return room;
  }
}

module.exports = new GameLogic();