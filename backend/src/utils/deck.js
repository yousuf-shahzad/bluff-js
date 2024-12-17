const { SUITS, VALUES } = require('../config/constants');

function createDeck() {
  return SUITS.flatMap(suit => 
    VALUES.map(value => ({ suit, value, id: `${value}${suit}` }))
  );
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

module.exports = { createDeck, shuffleDeck };