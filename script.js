 let currentPlayer = '✖️';
        let gameBoard = ["", "", "", "", "", "", "", "", ""];
        let gameActive = true;
        let gameMode = 'friend';
        let scores = { X: 0, O: 0 };

        const boardElement = document.getElementById("board");
        const messageElement = document.getElementById("message");
        const canvas = document.getElementById("winLineCanvas");
        const ctx = canvas.getContext("2d");
        const playerTurnElement = document.getElementById("playerTurn");
        const entryPage = document.getElementById("entryPage");
        const gameContainer = document.getElementById("gameContainer");
        const winMessage = document.getElementById("winMessage");
        const winMessageText = document.getElementById("winMessageText");

        function startGame(mode) {
            gameMode = mode;
            entryPage.style.display = 'none';
            gameContainer.style.display = 'block';
            resetGame();
        }

        function returnToMenu() {
            winMessage.style.display = 'none';
            gameContainer.style.display = 'none';
            entryPage.style.display = 'block';
        }

        function closeWinMessage() {
            winMessage.style.display = 'none';
            resetGame();
        }

        function createBoard() {
            boardElement.innerHTML = "";
            gameBoard.forEach((cell, index) => {
                const cellElement = document.createElement("div");
                cellElement.classList.add("cell");
                cellElement.dataset.index = index;
                cellElement.textContent = cell;
                cellElement.addEventListener("click", handleMove);
                boardElement.appendChild(cellElement);
            });
            updatePlayerTurn();
        }

        function updatePlayerTurn() {
            playerTurnElement.textContent = `CURRENT TURN: ${currentPlayer}`;
        }

        function handleMove(event) {
            if (!gameActive) return;

            const index = event.target.dataset.index;
            if (gameBoard[index] !== "") return;

            makeMove(index);

            if (gameMode === 'bot' && gameActive && currentPlayer === '⭕') {
                setTimeout(makeBotMove, 500);
            }
        }

        function makeMove(index) {
            gameBoard[index] = currentPlayer;
            boardElement.children[index].textContent = currentPlayer;
            boardElement.children[index].classList.add("taken");

            const winningCombination = checkWin();
            if (winningCombination) {
                gameActive = false;
                drawWinningLine(winningCombination);
                updateScore(currentPlayer);
                showWinMessage(`PLAYER ${currentPlayer} WINS!`);
                return;
            }

            if (gameBoard.every(cell => cell !== "")) {
                gameActive = false;
                showWinMessage("IT'S A DRAW!");
                return;
            }

            currentPlayer = currentPlayer === "✖️" ? "⭕" : "✖️";
            updatePlayerTurn();
        }

        function showWinMessage(message) {
            winMessageText.textContent = message;
            winMessage.style.display = 'block';
        }

        function makeBotMove() {
            if (!gameActive) return;
            let move = findBestMove();
            if (move !== -1) {
                makeMove(move);
            }
        }

        function findBestMove() {
            // Try to find a winning move
            for (let i = 0; i < 9; i++) {
                if (gameBoard[i] === "") {
                    gameBoard[i] = "⭕";
                    if (checkWin()) {
                        gameBoard[i] = "";
                        return i;
                    }
                    gameBoard[i] = "";
                }
            }

            // Try to block player's winning move
            for (let i = 0; i < 9; i++) {
                if (gameBoard[i] === "") {
                    gameBoard[i] = "✖️";
                    if (checkWin()) {
                        gameBoard[i] = "";
                        return i;
                    }
                    gameBoard[i] = "";
                }
            }

            // Take center if available
            if (gameBoard[4] === "") return 4;

            // Take a random available move
            const availableMoves = gameBoard
                .map((cell, index) => cell === "" ? index : -1)
                .filter(index => index !== -1);
            
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        function updateScore(winner) {
            if (winner === "✖️") {
                scores.X++;
                document.getElementById("scoreX").textContent = scores.X;
            } else {
                scores.O++;
                document.getElementById("scoreO").textContent = scores.O;
            }
        }

        function checkWin() {
            const winningCombinations = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
                [0, 4, 8], [2, 4, 6] // Diagonals
            ];

            for (const combination of winningCombinations) {
                const [a, b, c] = combination;
                if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
                    return combination;
                }
            }
            return null;
        }

        function drawWinningLine(winningCombination) {
            const [a, b, c] = winningCombination;
            const cell1 = boardElement.children[a].getBoundingClientRect();
            const cell2 = boardElement.children[c].getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();

            canvas.width = canvasRect.width;
            canvas.height = canvasRect.height;

            const x1 = cell1.left - canvasRect.left + cell1.width / 2;
            const y1 = cell1.top - canvasRect.top + cell1.height / 2;
            const x2 = cell2.left - canvasRect.left + cell2.width / 2;
            const y2 = cell2.top - canvasRect.top + cell2.height / 2;

            let progress = 0;
            const duration = 1000;

            function animate() {
                progress += 10;
                const t = Math.min(progress / duration, 1);

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 8;
                ctx.lineCap = 'round';
                ctx.shadowColor = 'rgba(0, 149, 255, 0.8)';
                ctx.shadowBlur = 15;
                ctx.stroke();

                if (t < 1) {
                    requestAnimationFrame(animate);
                }
            }

            animate();
        }

        function resetGame() {
            gameBoard = ["", "", "", "", "", "", "", "", ""];
            gameActive = true;
            currentPlayer = "✖️";
            messageElement.textContent = "";
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            createBoard();
        }