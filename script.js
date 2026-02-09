// Game state
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameMode = 'pvp'; // 'pvp' or 'ai'
let gameActive = true;
let aiPlayer = 'O';
let scores = { X: 0, O: 0 };

// DOM elements
const statusElement = document.getElementById('status');
const statusText = statusElement.querySelector('.status-text');
const statusIcon = statusElement.querySelector('.status-icon');
const cells = document.querySelectorAll('.cell');
const pvpBtn = document.getElementById('pvp-btn');
const aiBtn = document.getElementById('ai-btn');
const scoreXElement = document.getElementById('score-x');
const scoreOElement = document.getElementById('score-o');

// Winning combinations
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Initialize game
function initGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    updateDisplay();
    statusElement.classList.remove('win', 'draw');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'disabled', 'winning-cell');
    });
}

// Handle cell click
function handleCellClick(index) {
    if (board[index] !== '' || !gameActive) {
        return;
    }

    // Make player move
    makeMove(index, currentPlayer);

    // Check for win or draw
    if (checkWinner()) {
        gameActive = false;
        scores[currentPlayer]++;
        updateScores();
        statusText.textContent = `Player ${currentPlayer} Wins! 🎉`;
        statusIcon.textContent = '🎉';
        statusElement.classList.add('win');
        highlightWinningCells();
        return;
    }

    if (checkDraw()) {
        gameActive = false;
        statusText.textContent = "It's a Draw! 🤝";
        statusIcon.textContent = '🤝';
        statusElement.classList.add('draw');
        return;
    }

    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateDisplay();

    // AI move if in AI mode and it's AI's turn
    if (gameMode === 'ai' && currentPlayer === aiPlayer && gameActive) {
        setTimeout(() => {
            makeAIMove();
        }, 500); // Small delay for better UX
    }
}

// Make a move
function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());
    cells[index].classList.add('disabled');
}

// Check for winner
function checkWinner() {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return true;
        }
    }
    return false;
}

// Check for draw
function checkDraw() {
    return board.every(cell => cell !== '');
}

// Highlight winning cells
function highlightWinningCells() {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            cells[a].classList.add('winning-cell');
            cells[b].classList.add('winning-cell');
            cells[c].classList.add('winning-cell');
            break;
        }
    }
}

// Update status display
function updateDisplay() {
    if (gameActive) {
        if (gameMode === 'ai' && currentPlayer === aiPlayer) {
            statusText.textContent = `AI is thinking...`;
            statusIcon.textContent = '🤖';
        } else {
            statusText.textContent = `Player ${currentPlayer}'s Turn`;
            statusIcon.textContent = currentPlayer === 'X' ? '❌' : '⭕';
        }
        statusElement.classList.remove('win', 'draw');
    }
}

// Update scores display
function updateScores() {
    scoreXElement.textContent = scores.X;
    scoreOElement.textContent = scores.O;
    
    // Animate score update
    scoreXElement.style.transform = 'scale(1.3)';
    scoreOElement.style.transform = 'scale(1.3)';
    setTimeout(() => {
        scoreXElement.style.transform = 'scale(1)';
        scoreOElement.style.transform = 'scale(1)';
    }, 300);
}

// Reset scores
function resetScores() {
    scores = { X: 0, O: 0 };
    updateScores();
    resetGame();
}

// AI move logic (minimax algorithm)
function makeAIMove() {
    if (!gameActive) return;

    let bestMove = -1;
    let bestScore = -Infinity;

    // Try all possible moves
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = aiPlayer;
            let score = minimax(board, 0, false);
            board[i] = '';

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    // Make the best move
    if (bestMove !== -1) {
        makeMove(bestMove, aiPlayer);

        // Check for win or draw after AI move
        if (checkWinner()) {
            gameActive = false;
            scores[aiPlayer]++;
            updateScores();
            statusText.textContent = `AI Wins! 🤖`;
            statusIcon.textContent = '🤖';
            statusElement.classList.add('win');
            highlightWinningCells();
            return;
        }

        if (checkDraw()) {
            gameActive = false;
            statusText.textContent = "It's a Draw! 🤝";
            statusIcon.textContent = '🤝';
            statusElement.classList.add('draw');
            return;
        }

        // Switch back to human player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateDisplay();
    }
}

// Minimax algorithm for AI
function minimax(board, depth, isMaximizing) {
    // Check for terminal states
    if (checkWinner()) {
        if (isMaximizing) {
            return -10 + depth; // AI wins
        } else {
            return 10 - depth; // Human wins
        }
    }

    if (checkDraw()) {
        return 0; // Draw
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = aiPlayer;
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = currentPlayer === 'X' ? 'X' : 'O';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Set game mode
function setGameMode(mode) {
    if (mode === gameMode) return;

    gameMode = mode;
    
    // Update button styles
    if (mode === 'pvp') {
        pvpBtn.classList.add('active');
        aiBtn.classList.remove('active');
    } else {
        aiBtn.classList.add('active');
        pvpBtn.classList.remove('active');
    }

    // Reset game when switching modes
    resetGame();
}

// Reset game
function resetGame() {
    initGame();
}

// Initialize game on page load
initGame();
