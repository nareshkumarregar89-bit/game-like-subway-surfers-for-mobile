const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Set canvas size responsively
function resizeCanvas() {
    const container = document.getElementById('game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight * 0.6; // 60% of container height
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let player = { x: 50, y: canvas.height - 100, width: 30, height: 50, dy: 0, isJumping: false, isSliding: false };
let obstacles = [];
let coins = [];
let score = 0;
let gameSpeed = 3;
let gravity = 0.5;
let jumpPower = -12;
let slideDuration = 20; // Frames for sliding
let slideTimer = 0;

function drawPlayer() {
    ctx.fillStyle = 'blue';
    if (player.isSliding) {
        ctx.fillRect(player.x, player.y + 20, player.width, player.height - 20); // Shorter for sliding
    } else {
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}

function drawObstacle(obstacle) {
    ctx.fillStyle = 'red';
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

function drawCoin(coin) {
    ctx.fillStyle = 'gold';
    ctx.beginPath();
    ctx.arc(coin.x + 10, coin.y + 10, 10, 0, Math.PI * 2);
    ctx.fill();
}

function updatePlayer() {
    if (player.isJumping) {
        player.dy += gravity;
        player.y += player.dy;
        if (player.y >= canvas.height - 100) { // Ground level
            player.y = canvas.height - 100;
            player.dy = 0;
            player.isJumping = false;
        }
    }
    if (player.isSliding && slideTimer > 0) {
        slideTimer--;
    } else {
        player.isSliding = false;
    }
}

function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= gameSpeed;
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
        }
        // Collision detection
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            resetGame();
        }
    });
    // Add new obstacles
    if (Math.random() < 0.01) {
        obstacles.push({ x: canvas.width, y: canvas.height - 100, width: 50, height: 50 });
    }
}

function updateCoins() {
    coins.forEach((coin, index) => {
        coin.x -= gameSpeed;
        if (coin.x + 20 < 0) {
            coins.splice(index, 1);
        }
        // Collection detection
        if (player.x < coin.x + 20 &&
            player.x + player.width > coin.x &&
            player.y < coin.y + 20 &&
            player.y + player.height > coin.y) {
            score += 10;
            coins.splice(index, 1);
        }
    });
    // Add new coins
    if (Math.random() < 0.02) {
        coins.push({ x: canvas.width, y: Math.random() * 200 + canvas.height - 300 });
    }
}

function resetGame() {
    player.y = canvas.height - 100;
    player.dy = 0;
    player.isJumping = false;
    player.isSliding = false;
    obstacles = [];
    coins = [];
    score = 0;
    gameSpeed = 3;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    updatePlayer();
    updateObstacles();
    updateCoins();
    obstacles.forEach(drawObstacle);
    coins.forEach(drawCoin);
    scoreElement.textContent = `Score: ${score}`;
    gameSpeed += 0.001; // Gradually increase speed
    requestAnimationFrame(gameLoop);
}

// Touch controls
let touchStartY = 0;
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartY = e.touches[0].clientY;
    // Jump on tap
    if (!player.isJumping) {
        player.dy = jumpPower;
        player.isJumping = true;
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touchY = e.touches[0].clientY;
    if (touchY > touchStartY + 50 && !player.isSliding) { // Swipe down
        player.isSliding = true;
        slideTimer = slideDuration;
    }
});

gameLoop();