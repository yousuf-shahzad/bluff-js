# Bluff Card Game 🃏

## Overview
Bluff is a multiplayer card game where players try to deceive each other by playing cards and claiming specific card values. The goal is to get rid of all your cards while catching other players' bluffs.

## Features
- Real-time multiplayer gameplay
- Room creation and joining
- Socket.io based communication
- Card playing and bluffing mechanics
- Game state tracking
- Error handling and logging

## Tech Stack
### Backend
- Node.js
- Express
- Socket.IO
- Winston (logging)

### Frontend
- React
- TypeScript
- Socket.IO Client
- React Router

## Prerequisites
- Node.js (v14+)
- npm or yarn

## Installation

### Backend Setup
1. Clone the repository
2. Navigate to backend directory
```bash
cd backend
npm install
```

3. Create a `.env` file with:
```
PORT=3001
FRONTEND_URL=http://localhost:3000
```

4. Start the server
```bash
npm start
```

### Frontend Setup
1. Navigate to frontend directory
```bash
cd frontend
npm install
```

2. Create a `.env` file with:
```
REACT_APP_BACKEND_URL=http://localhost:3001
```

3. Start the React app
```bash
npm start
```

## Game Rules
- 2-4 players per game
- Each player starts with 13 cards
- Players take turns playing cards and claiming a card value
- You can bluff about the cards you play
- If someone calls your bluff and you're lying, you pick up the pile
- If the bluff call is incorrect, the caller picks up the pile
- First player to get rid of all cards wins

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License
MIT License

## Contact
Yousuf Shahzad
