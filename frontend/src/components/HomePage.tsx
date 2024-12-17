import React, { useState, useCallback, useEffect } from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';  // Install uuid package

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

function HomePage() {
    const [username, setUsername] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');
    // const [playersLeft, setPlayersLeft] = useState(null); // New state for players left to join

    const createRoom = useCallback(() => {
        const trimmedUsername = username.trim();
        if (!trimmedUsername) {
            setError('Please enter a username');
            return;
        }
    
        const userId = localStorage.getItem('userId') || uuidv4();
        localStorage.setItem('userId', userId);
        localStorage.setItem('username', trimmedUsername);
        const socket = io(BACKEND_URL, {
            query: { userId }
        });
    
        socket.emit('createRoom', {
            username: trimmedUsername,
            userId
        });

        socket.on('roomCreated', (room) => {
            const newRoomCode = room.roomCode;
            console.log('Room created:', newRoomCode);
            // setPlayersLeft(room.playersLeft ?? 0);
            window.location.href = `/game/${newRoomCode}`;
        });
    
        // Add a listener for players update
        // socket.on('playersUpdate', (data) => {
        //     setPlayersLeft(data.playersLeft);
        // });

    
        // Cleanup
        return () => {
            socket.disconnect();
        };
    }, [username]);
    
    const checkRoom = useCallback(() => {
        const trimmedUsername = username.trim();
        const trimmedRoomCode = roomCode.trim().toUpperCase();
    
        if (!trimmedUsername) {
            setError('Please enter a username');
            return;
        }
        if (!trimmedRoomCode) {
            setError('Please enter a room code');
            return;
        }
    
        localStorage.setItem('username', trimmedUsername);
    
        const userId = localStorage.getItem('userId') || uuidv4();
        localStorage.setItem('userId', userId);
    
        const socket = io(BACKEND_URL, {
            // Use the same userId for socket connection
            query: { 
                userId,
                roomCode: trimmedRoomCode 
            }
        });
    
        const timeoutId = setTimeout(() => {
            setError('Connection timeout. Please try again.');
            socket.disconnect();
        }, 5000);
    
        socket.emit('checkRoom', roomCode);
    
        socket.on('roomExists', (exists, room) => {
            clearTimeout(timeoutId);
            if (exists) {
                // setPlayersLeft(room.playersLeft);
                window.location.href = `/game/${trimmedRoomCode}`;
            } else {
                setError('Room does not exist. Please check the room code.');
                socket.disconnect();
            }
        });
    
        return () => {
            clearTimeout(timeoutId);
            socket.disconnect();
        };
    }, [username, roomCode]);

    return (
        <div className="lobby">
            <h1>Bluff Game</h1>
            {error && <div className="error-message">{error}</div>}
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                }}
                maxLength={15}
            />
            <button onClick={createRoom}>Create Room</button>
            <input
                type="text"
                placeholder="Room Code"
                value={roomCode}
                onChange={(e) => {
                    setRoomCode(e.target.value.toUpperCase());
                    setError('');
                }}
                maxLength={6}
            />
            <button onClick={checkRoom}>
                Join Room
            </button>

            {/* {playersLeft !== null && (
                <div className="players-status">
                    {playersLeft > 0 ? `${playersLeft} players left to join` : 'Room is full'}
                </div>
            )} */}
        </div>
    );
}

export default HomePage;
