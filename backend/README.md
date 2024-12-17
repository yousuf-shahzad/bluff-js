# Backend Documentation

## Overview
This document provides an overview of the backend architecture for a real-time multiplayer card game built using Node.js, Express.js, and Socket.IO.

---

## Project Structure
```
📁 project-root
├── server.js                # Main server entry point
├── config
│   └── constants.js        # Game and server constants
├── services
│   ├── gameLogic.js        # Game logic implementation
│   └── validation.js       # Validation for game actions
├── utils
│   ├── deck.js             # Card deck utilities
│   ├── logger.js           # Winston-based logging
│   └── roomManager.js      # Room management logic
└── .env                    # Environment variables
```

---

## Installation and Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd project-root
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and configure the following:
   ```env
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```
4. Start the server:
   ```bash
   npm start
   ```

---

## Key Features
- **Room Management:** Create, join, and manage game rooms.
- **Real-time Gameplay:** Manage game state updates and player actions using Socket.IO.
- **Validation Services:** Ensure game integrity with comprehensive validation.
- **Logging:** Log key events and errors using Winston.

---

## Detailed Modules

### server.js
- Initializes Express and Socket.IO servers.
- Configures middleware and routes.
- Defines socket event handlers:
  - `createRoom`: Creates a new game room.
  - `joinRoom`: Allows players to join existing rooms.
  - `checkRoom`: Checks if a room exists.
  - `playCards`: Handles card-playing logic.
  - `callBluff`: Resolves bluff calls.
- Uses `updateGameState()` to broadcast game updates.

### utils/roomManager.js
- **generateRoomCode()**: Generates unique 6-character room codes.
- **createRoom()**: Initializes a new game room.
- **joinRoom()**: Adds players to rooms.
- **cleanupInactiveRooms()**: Removes inactive rooms.

### services/gameLogic.js
- **startGame()**: Initializes the game state and deals cards.
- **getNextPlayer()**: Determines the next player.
- **checkGameOver()**: Checks if the game is over.
- **playCards()**: Validates and processes played cards.
- **resolveBluffCall()**: Handles bluff resolution.

### services/validation.js
- **validateJoinRoom()**: Validates if a player can join a room.
- **validateCardPlay()**: Ensures players play only valid cards.

### utils/deck.js
- **createDeck()**: Generates a standard 52-card deck.
- **shuffleDeck()**: Shuffles the deck using Fisher-Yates algorithm.

### utils/logger.js
- Configured with Winston for file and console logging.

---

## Deployment
1. Ensure correct environment configuration.
2. Deploy using a cloud service such as Heroku, AWS, or Azure.

---

## Troubleshooting
- **Server Not Starting**: Check `.env` file and server logs.
- **Connection Issues**: Verify CORS configuration in `server.js`.
- **Game Logic Errors**: Review validation and game state management logic.

---

## Future Improvements
- Enhanced game logic and features.
- Persistent game storage.
- Improved logging and monitoring.

---

For more detailed information, refer to the in-code documentation and comments.

