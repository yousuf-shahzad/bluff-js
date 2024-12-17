"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var socket_io_client_1 = require("socket.io-client");
require("./App.css");
var suits = ['♥', '♦', '♣', '♠'];
var values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
function createDeck() {
    return suits.flatMap(function (suit) {
        return values.map(function (value) { return ({
            suit: suit,
            value: value,
            id: "".concat(value).concat(suit)
        }); });
    });
}
function shuffleDeck(deck) {
    var _a;
    for (var i = deck.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [deck[j], deck[i]], deck[i] = _a[0], deck[j] = _a[1];
    }
    return deck;
}
function App() {
    var _a = (0, react_1.useState)(null), socket = _a[0], setSocket = _a[1];
    var _b = (0, react_1.useState)({
        players: [],
        currentPlayer: null,
        currentPile: [],
        currentClaimedValue: null,
        gameStarted: false
    }), gameState = _b[0], setGameState = _b[1];
    var _c = (0, react_1.useState)([]), playerHand = _c[0], setPlayerHand = _c[1];
    var _d = (0, react_1.useState)(''), username = _d[0], setUsername = _d[1];
    var _e = (0, react_1.useState)(''), roomCode = _e[0], setRoomCode = _e[1];
    var _f = (0, react_1.useState)([]), selectedCards = _f[0], setSelectedCards = _f[1];
    var _g = (0, react_1.useState)(''), claimedValue = _g[0], setClaimedValue = _g[1];
    // Improved socket connection with error handling
    (0, react_1.useEffect)(function () {
        var newSocket = (0, socket_io_client_1.default)('http://localhost:3001', {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
        setSocket(newSocket);
        newSocket.on('connect', function () {
            console.log('Connected to game server');
        });
        newSocket.on('connect_error', function (error) {
            console.error('Connection error:', error);
        });
        newSocket.on('gameState', function (state) {
            setGameState(state);
        });
        newSocket.on('dealCards', function (hand) {
            setPlayerHand(hand);
        });
        newSocket.on('error', function (errorMessage) {
            alert(errorMessage);
        });
        return function () {
            newSocket.disconnect();
        };
    }, []);
    // Memoized event handlers to prevent unnecessary re-renders
    var createRoom = (0, react_1.useCallback)(function () {
        if (username.trim()) {
            socket === null || socket === void 0 ? void 0 : socket.emit('createRoom', { username: username });
        }
        else {
            alert('Please enter a username');
        }
    }, [socket, username]);
    var joinRoom = (0, react_1.useCallback)(function () {
        if (username.trim() && roomCode.trim()) {
            socket === null || socket === void 0 ? void 0 : socket.emit('joinRoom', { username: username, roomCode: roomCode });
        }
        else {
            alert('Please enter username and room code');
        }
    }, [socket, username, roomCode]);
    // Advanced card selection logic
    var selectCard = (0, react_1.useCallback)(function (card) {
        setSelectedCards(function (prev) {
            return prev.includes(card)
                ? prev.filter(function (c) { return c.id !== card.id; })
                : __spreadArray(__spreadArray([], prev, true), [card], false);
        });
    }, []);
    // Play cards with validation
    var playCards = (0, react_1.useCallback)(function () {
        if (!claimedValue) {
            alert('Please claim a card value');
            return;
        }
        if (selectedCards.length === 0) {
            alert('Please select cards to play');
            return;
        }
        socket === null || socket === void 0 ? void 0 : socket.emit('playCards', {
            cards: selectedCards,
            claimedValue: claimedValue
        });
        // Reset selection after playing
        setSelectedCards([]);
        setClaimedValue('');
    }, [socket, selectedCards, claimedValue]);
    var callBluff = (0, react_1.useCallback)(function () {
        socket === null || socket === void 0 ? void 0 : socket.emit('callBluff');
    }, [socket]);
    // Render player's hand with selection state
    var renderPlayerHand = function () {
        return playerHand.map(function (card) { return key = { card: card, : .id }; }, className = {}(templateObject_1 || (templateObject_1 = __makeTemplateObject(["card ", ""], ["card ", ""])), selectedCards.includes(card) ? 'selected' : ''));
    };
    onClick = {}();
    selectCard(card);
}
    >
        { card: card, : .value };
{
    card.suit;
}
/div>;
;
;
return className = "App" >
    {};
gameState.gameStarted ? className = "lobby" >
    placeholder : ;
"Username";
value = { username: username };
onChange = {}(e);
setUsername(e.target.value);
maxLength = { 15:  }
    /  >
    placeholder;
"Room Code";
value = { roomCode: roomCode };
onChange = {}(e);
setRoomCode(e.target.value.toUpperCase());
maxLength = { 6:  }
    /  >
    onClick;
{
    createRoom;
}
 > Create;
Room < /button>
    < button;
onClick = { joinRoom: joinRoom } > Join;
Room < /button>
    < /div>;
className = "game-board" >
    className;
"game-info" >
    className;
"current-pile" >
    Current;
Pile: {
    gameState.currentPile.map(function (card) { return "".concat(card.value).concat(card.suit); }).join(', ');
}
/div>
    < div;
className = "current-player" >
    Current;
Turn: {
    gameState.currentPlayer;
}
/div>
    < /div>
    < div;
className = "play-controls" >
    value;
{
    claimedValue;
}
onChange = {}(e);
setClaimedValue(e.target.value);
    >
        value;
"" > Select;
Claimed;
Value < /option>;
{
    values.map(function (value) { return key = { value: value }; }, value = { value: value } >
        { value: value }
        < /option>);
}
/select>
    < button;
onClick = { playCards: playCards };
disabled = { gameState: gameState, : .currentPlayer !== (socket === null || socket === void 0 ? void 0 : socket.id) }
    >
        Play;
Selected;
Cards
    < /button>
    < /div>
    < div;
className = "player-hand" >
    {}
    < /div>
    < div;
className = "game-controls" >
    onClick;
{
    callBluff;
}
disabled = { gameState: gameState, : .currentPlayer !== (socket === null || socket === void 0 ? void 0 : socket.id) }
    >
        Call;
Bluff
    < /button>
    < /div>
    < /div>;
/div>;
;
exports.default = App;
var templateObject_1;
