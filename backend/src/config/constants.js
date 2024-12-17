module.exports = {
    PORT: process.env.PORT || 3001,
    ROOM_CODES: {
      MAX_PLAYERS: 2,
      MAX_INACTIVE_TIME: 24 * 60 * 60 * 1000, // 24 hours
    },
    SUITS: ['♥', '♦', '♣', '♠'],
    VALUES: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
  };