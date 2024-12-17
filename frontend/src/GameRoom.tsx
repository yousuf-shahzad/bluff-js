import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    BrowserRouter as Router,
    Route,
    Routes,
    useParams,
    Navigate
} from 'react-router-dom';
import io, { Socket } from 'socket.io-client';

// Types for better type safety
interface Card {
    id: string;
    suit: string;
    value: string;
}

interface GameState {
    players: { id: string; username: string; cardCount: number }[];
    currentPlayer: string | null;
    currentPile: Card[];
    currentClaimedValue: string | null;
    gameStarted: boolean;
    maxPlayers: number;
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
const CARD_VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function GameRoom() {
    const { roomCode } = useParams<{ roomCode: string }>();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [gameState, setGameState] = useState<GameState>({
        players: [],
        currentPlayer: null,
        currentPile: [],
        currentClaimedValue: null,
        gameStarted: false,
        maxPlayers: 4
    });
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [username, setUsername] = useState('');
    const [selectedCards, setSelectedCards] = useState<Card[]>([]);
    const [claimedValue, setClaimedValue] = useState('');
    const [gameError, setGameError] = useState('');

    // Persistent username check with early render
    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId');
    console.log('Stored username:', storedUsername);
    console.log('Stored userId:', storedUserId);

    // Improved socket connection with robust error handling
    useEffect(() => {
        // Only proceed if roomCode is valid and username is set
        if (!roomCode || !storedUsername || !storedUserId) {
            return;
        }

        const newSocket = io(BACKEND_URL, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            query: { roomCode } // Pass room code to server
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to game server');
            console.log('Socket ID:', newSocket.id);
            // Automatically attempt to join room when connected
            newSocket.emit('joinRoom', {
                username: storedUsername,
                roomCode: roomCode,
                userId: storedUserId,
                socketId: newSocket.id
            });
        });

        newSocket.on('playerJoined', (data) => {
            console.log('Player joined:', data);
            // You can update UI or game state here if needed
        });

        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setGameError('Could not connect to game server');
        });

        newSocket.on('gameState', (state) => {
            try {
                setGameState(prevState => ({
                    ...state,
                    maxPlayers: state.maxPlayers || prevState.maxPlayers
                }));
            } catch (err) {
                setGameError('Error processing game state');
                console.error('Game state error:', err);
            }
        });

        newSocket.on('dealCards', (cards) => {
            console.log('Received cards:', cards); // Add this line
            try {
                setPlayerHand(cards);
            } catch (err) {
                setGameError('Error processing player hand');
                console.error('Deal cards error:', err);
            }
        });

        newSocket.on('error', (errorMessage) => {
            // Ensure error is always converted to a string
            const error = errorMessage instanceof Error
                ? errorMessage.message
                : String(errorMessage.message || 'An unknown error occurred');
            console.log(error)
            setGameError(error);
        });

        newSocket.on('gameOver', (data) => {
            if (data && data.winner && data.winner.username) {
                alert(`Game Over! Winner: ${data.winner.username}`);
            } else {
                alert('Game Over! Winner could not be determined.');
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [roomCode, storedUsername, storedUserId]);

    // Advanced card selection logic
    const selectCard = useCallback((card: Card) => {
        setSelectedCards(prev =>
            prev.some(c => c.id === card.id)
                ? prev.filter(c => c.id !== card.id)
                : [...prev, card]
        );
    }, []);

    // Play cards with enhanced validation
    const playCards = useCallback(() => {
        if (!claimedValue) {
            setGameError('Please claim a card value');
            return;
        }
        if (selectedCards.length === 0) {
            setGameError('Please select cards to play');
            return;
        }

        socket?.emit('playCards', {
            roomCode: roomCode!.trim(),
            cards: selectedCards,
            claimedValue
        });

        // Reset selection after playing
        setSelectedCards([]);
        setClaimedValue('');
        setGameError('');
    }, [socket, selectedCards, claimedValue, roomCode]);

    const callBluff = useCallback(() => {
        if (!roomCode?.trim()) {
            setGameError('Room code is required');
            return;
        }
        socket?.emit('callBluff', roomCode.trim());
    }, [socket, roomCode]);

    // Username input component
    const UsernameInput = () => (
        <div className="lobby">
            <h1>Enter Username for Room {roomCode}</h1>
            <input
                type="text"
                placeholder="Your Username"
                defaultValue={username}
                onChange={(e) => {
                    const newUsername = e.target.value;
                    setUsername(newUsername);
                }}
                maxLength={15}
            />
            <button
                onClick={() => {
                    if (username.trim()) {
                        localStorage.setItem('username', username.trim());
                        window.location.reload(); // Reload to trigger socket connection
                    }
                }}
            >
                Join Room
            </button>
        </div>
    );

    // Render lobby or game view
    const renderContent = () => {
        console.log('Current player hand:', playerHand);
        // If no username, show username input
        if (!storedUsername) {
            return <UsernameInput />;
        }

        // Game not started view
        if (!gameState.gameStarted) {
            return (
                <div className="lobby">
                    {gameError && <div className="error-message">{gameError}</div>}
                    <h2>Room Code: {roomCode}</h2>
                    <div className="player-list">
                        {gameState.players.map(player => (
                            <div key={player.id} className="player-item">
                                {player.username}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Game started view
        return (
            <div className="game-board">
                <div className="game-info">
                    <div className="current-pile">
                        Current Pile: {gameState.currentPile.map(card => `${card.value}${card.suit}`).join(', ') || 'Empty'}
                    </div>
                    <div className="current-player">
                        Current Turn: {gameState.players.find(p => p.id === gameState.currentPlayer)?.username || 'Unknown'}
                    </div>
                </div>

                <div className="player-list">
                    {gameState.players.map(player => (
                        <div
                            key={player.id}
                            className={`player-info ${player.id === gameState.currentPlayer ? 'current-turn' : ''}`}
                        >
                            {player.username} - {player.cardCount} cards
                        </div>
                    ))}
                </div>

                {gameError && <div className="error-message">{gameError}</div>}

                <div className="play-controls">
                    <select
                        value={claimedValue}
                        onChange={(e) => setClaimedValue(e.target.value)}
                    >
                        <option value="">Select Claimed Value</option>
                        {CARD_VALUES.map(value => (
                            <option key={value} value={value}>{value}</option>
                        ))}
                    </select>
                    <button
                        onClick={playCards}
                        disabled={gameState.currentPlayer !== storedUserId}
                    >
                        Play Selected Cards
                    </button>
                </div>

                <div className="player-hand">
                    {playerHand.map(card => (
                        <div
                            key={card.id}
                            className={`card ${selectedCards.some(c => c.id === card.id) ? 'selected' : ''}`}
                            onClick={() => selectCard(card)}
                        >
                            {card.value}{card.suit}
                        </div>
                    ))}
                </div>

                <div className="game-controls">
                    <button
                        onClick={callBluff}
                        disabled={gameState.currentPlayer !== storedUserId}
                    >
                        Call Bluff
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="App">
            {renderContent()}
        </div>
    );
}

// Rest of the code remains the same (HomePage and App components)
export default GameRoom;