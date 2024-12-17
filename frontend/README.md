# Bluff Card Game Frontend 🎨

## Overview

The frontend of Bluff is built with React and TypeScript, providing an interactive and dynamic user interface for a real-time multiplayer card game. It connects to the backend using Socket.IO for real-time communication.

## Features

- **Real-Time Multiplayer:** Live gameplay experience with automatic updates.
- **Room Management:** Create or join game rooms.
- **Interactive UI:** Play cards, call bluffs, and track game progress.
- **Error Handling:** User-friendly error messages.

## Tech Stack

- **React** (for UI)
- **TypeScript** (for type safety)
- **Socket.IO Client** (for real-time communication)
- **React Router** (for navigation)

## Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Create a `.env` file:**
   ```env
   REACT_APP_BACKEND_URL=http://localhost:3001
   ```
4. **Run the app:**
   ```bash
   npm start
   ```

## Folder Structure

```
frontend/
│-- src/
│   │-- components/
│   │   ├── HomePage.tsx   # Lobby and Room Creation
│   │   ├── GameRoom.tsx   # Main Game Interface
│   │   └── NotFound.tsx   # 404 Handling
│   ├── App.tsx            # Entry Point
│   └── App.css            # Styles
└── public/
```

## Key Components

### `HomePage.tsx`

- **Features:**
  - Username input
  - Room creation and joining
  - Error messages for invalid inputs

### `GameRoom.tsx`

- **Features:**
  - Real-time game state display
  - Card selection and play mechanics
  - Bluff calling and game updates

### `App.tsx`

- **Features:**
  - Routes and navigation setup using React Router

## Development Notes

- **Socket.IO Integration:** Persistent socket connections are established upon room joining.
- **Game State Management:** State is managed using React’s `useState` and `useEffect`.
- **Type Safety:** TypeScript interfaces ensure better type safety.

## Contributing

1. **Fork the repository.**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/new-feature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m "Add new feature"
   ```
4. **Push the branch:**
   ```bash
   git push origin feature/new-feature
   ```
5. **Create a pull request.**

## License

MIT License

## Contact

Yousuf Shahzad

