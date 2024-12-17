import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BrowserRouter as Router, 
  Route, 
  Routes, 
  useParams, 
  Navigate 
} from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import './App.css';
import HomePage from './HomePage.tsx';
import GameRoom from './GameRoom.tsx';
import NotFound from './NotFound.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:roomCode" element={<GameRoom />} />
        <Route path='*' element={<NotFound />} /> {/* 404 Handling */}
      </Routes>
    </Router>
  );
}

export default App;