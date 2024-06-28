const gameContainer = document.getElementById('gameContainer');
const player = document.getElementById('player');
const startGameButton = document.getElementById('startGameButton');
const restartGameButton = document.getElementById('restartGameButton');
const scoreDisplay = document.getElementById('score');
const openingSlideshow = document.getElementById('openingSlideshow');
const endingVideo = document.getElementById('endingVideo');
const loadingMessage = document.getElementById('loadingMessage');
const backgroundMusic = document.getElementById('backgroundMusic');
const endMessage = document.getElementById('endMessage');
let bullets = [];
let aliens = [];
let score = 0;
let gameRunning = false;
let slideshowTimer;

startGameButton.addEventListener('click', () => {
    startGameButton.style.display = 'none';
    loadingMessage.style.display = 'block';
    playOpeningSlideshow();
});

restartGameButton.addEventListener('click', () => {
    restartGame();
});

function restartGame() {
    gameRunning = true;
    restartGameButton.style.display = 'none';
    endMessage.style.display = 'none';
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    while (bullets.length > 0) {
        bullets.pop().remove();
    }
    while (aliens.length > 0) {
        aliens.pop().remove();
    }
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
}

function playOpeningSlideshow() {
    openingSlideshow.style.display = 'block';
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
    const images = openingSlideshow.getElementsByTagName('img');
    let index = 0;
    slideshowTimer = setInterval(() => {
        images[index].style.display = 'none';
        index = (index + 1) % images.length;
        images[index].style.display = 'block';
    }, 10000 / images.length);
    setTimeout(() => {
        clearInterval(slideshowTimer);
        openingSlideshow.style.display = 'none';
        loadingMessage.style.display = 'none';
        if (!gameRunning) {
            startGame();
        }
    }, 8000);
}

function startGame() {
    gameRunning = true;
    backgroundMusic.play();
    spawnAliens();
    handlePlayerMovement();

    // Start ending video after 8 seconds if game is not restarted
    setTimeout(() => {
        if (!gameRunning) {
            playEndingVideo();
        }
    }, 8000);
}

function endGame() {
    gameRunning = false;
    backgroundMusic.pause();
    endMessage.style.display = 'block';
    restartGameButton.style.display = 'block';
    scoreDisplay.style.fontSize = '36px';
    scoreDisplay.style.backgroundColor = 'orange';

    // Show ending video and restart button after 8 seconds
    setTimeout(() => {
        if (!gameRunning) {
            playEndingVideo();
            restartGameButton.style.display = 'block';
        }
    }, 8000);
}

function playEndingVideo() {
    gameRunning = false;
    endingVideo.style.display = 'block';
    endingVideo.play();
    endingVideo.addEventListener('ended', () => {
        endingVideo.style.display = 'none';
        restartGameButton.style.display = 'block';
    });
}

function spawnAliens() {
    setInterval(() => {
        if (gameRunning) {
            const alien = document.createElement('div');
            alien.className = 'alien';
            alien.style.top = '0px';
            const randomLeft = Math.random() * (window.innerWidth - 150); // Random left position
            alien.style.left = randomLeft + 'px';
            gameContainer.appendChild(alien);
            aliens.push(alien);

            const moveAlien = setInterval(() => {
                alien.style.top = (parseInt(alien.style.top) + 2) + 'px';
                if (parseInt(alien.style.top) > window.innerHeight) {
                    clearInterval(moveAlien);
                    alien.remove();
                    aliens = aliens.filter(a => a !== alien);
                }
                if (isColliding(player, alien)) {
                    handleCollision();
                }
            }, 10);
        }
    }, 1000);
}

function handlePlayerMovement() {
    document.addEventListener('mousemove', movePlayer);
    document.addEventListener('touchmove', movePlayer);

    function movePlayer(event) {
        let x = event.clientX || event.touches[0].clientX;
        if (gameRunning) {
            player.style.left = `${x - player.offsetWidth / 2}px`;
        }
    }
}

document.addEventListener('click', shoot);
document.addEventListener('touchstart', shoot);

function shoot(event) {
    if (gameRunning) {
        const bullet = document.createElement('div');
        bullet.className = 'bullet';
        bullet.style.left = (player.offsetLeft + player.offsetWidth / 2 - 15) + 'px'; // Adjusted for leftward shooting
        bullet.style.top = (player.offsetTop + player.offsetHeight - 20) + 'px'; // Adjusted for bottom shooting
        gameContainer.appendChild(bullet);
        bullets.push(bullet);

        const moveBullet = setInterval(() => {
            bullet.style.top = (parseInt(bullet.style.top) - 5) + 'px'; // Adjusted for upward movement
            if (parseInt(bullet.style.top) < 0) {
                clearInterval(moveBullet);
                bullet.remove();
                bullets = bullets.filter(b => b !== bullet);
            }
            aliens.forEach(alien => {
                if (isColliding(bullet, alien)) {
                    createExplosion(alien);
                    clearInterval(moveBullet);
                    bullet.remove();
                    bullets = bullets.filter(b => b !== bullet);
                    alien.remove();
                    aliens = aliens.filter(a => a !== alien);
                    increaseScore();
                }
            });
        }, 10);
    }
}

function createExplosion(alien) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.position = 'absolute';
    explosion.style.width = '150px';
    explosion.style.height = '150px';
    explosion.style.backgroundImage = "url('explosion.gif')";
    explosion.style.backgroundSize = 'cover';
    explosion.style.left = (parseInt(alien.style.left) + alien.offsetWidth / 2 - 75) + 'px'; // Adjusted for center explosion
    explosion.style.top = (parseInt(alien.style.top) + alien.offsetHeight / 2 - 75) + 'px'; // Adjusted for center explosion
    gameContainer.appendChild(explosion);

    setTimeout(() => {
        explosion.remove();
    }, 1000);
}

function isColliding(a, b) {
    const rect1 = a.getBoundingClientRect();
    const rect2 = b.getBoundingClientRect();
    return !(rect1.right < rect2.left ||
             rect1.left > rect2.right ||
             rect1.bottom < rect2.top ||
             rect1.top > rect2.bottom);
}

function increaseScore() {
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
    if (score % 10 === 0) {
        scoreDisplay.style.fontSize = '24px';
        scoreDisplay.style.backgroundColor = 'green';
    } else {
        scoreDisplay.style.fontSize = '18px';
        scoreDisplay.style.backgroundColor = 'orange';
    }
}

function handleCollision() {
    gameRunning = false;
    endGame();
}
