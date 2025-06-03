class CatchTheBallGame {
  constructor(container) {
    this.container = container;
    this.scoreboard = container.querySelector('#scoreboard');
    this.livesDisplay = container.querySelector('#lives');
    this.gameOverScreen = container.querySelector('#game-over-screen');
    this.finalScoreText = container.querySelector('#final-score');
    this.restartBtn = container.querySelector('#restart-btn');
    this.catcher = container.querySelector('#catcher');

    this.width = container.clientWidth;
    this.height = container.clientHeight;
    this.catcherWidth = this.catcher.clientWidth;

    this.score = 0;
    this.lives = 5;
    this.gameOver = false;
    this.balls = [];
    this.spawnInterval = 1500;
    this.lastSpawn = 0;

    this.catcherX = this.width / 2 - this.catcherWidth / 2;
    this.catcherSpeed = 8;

    this.keys = {};

    this.bindEvents();
    this.restartBtn.addEventListener('click', () => this.restart());

    this.start();
  }

  bindEvents() {
    window.addEventListener('keydown', e => {
      this.keys[e.key] = true;
    });
    window.addEventListener('keyup', e => {
      this.keys[e.key] = false;
    });

    this.container.addEventListener('mousemove', e => {
      if (!this.gameOver) {
        const rect = this.container.getBoundingClientRect();
        let x = e.clientX - rect.left - this.catcherWidth / 2;
        x = Math.max(0, Math.min(x, this.width - this.catcherWidth));
        this.catcherX = x;
        this.updateCatcher();
      }
    });
  }

  start() {
    this.score = 0;
    this.lives = 5;
    this.gameOver = false;
    this.balls.forEach(ball => ball.el.remove());
    this.balls = [];
    this.updateScore();
    this.updateLives();
    this.gameOverScreen.style.display = 'none';
    this.catcherX = this.width / 2 - this.catcherWidth / 2;
    this.updateCatcher();

    requestAnimationFrame(this.loop.bind(this));
  }

  restart() {
    this.start();
  }

  updateScore() {
    this.scoreboard.textContent = `Score: ${this.score}`;
  }

  updateLives() {
    this.livesDisplay.textContent = `Lives: ${this.lives}`;
  }

  spawnBall() {
    if (this.gameOver) return;

    const ball = document.createElement('div');
    ball.classList.add('ball');
    const x = Math.random() * (this.width - 30);
    ball.style.left = `${x}px`;
    ball.style.top = `-30px`;
    this.container.appendChild(ball);

    this.balls.push({
      el: ball,
      x,
      y: -30,
      speed: 3 + Math.random() * 2,
    });
  }

  updateCatcher() {
    this.catcher.style.left = `${this.catcherX}px`;
  }

  loop(timestamp) {
    if (this.gameOver) return;

    if (!this.lastSpawn) this.lastSpawn = timestamp;
    if (timestamp - this.lastSpawn > this.spawnInterval) {
      this.spawnBall();
      this.lastSpawn = timestamp;

      this.spawnInterval = Math.max(500, this.spawnInterval - 10);
    }

    // Move catcher with keys
    if (this.keys['ArrowLeft'] || this.keys['a']) {
      this.catcherX -= this.catcherSpeed;
      if (this.catcherX < 0) this.catcherX = 0;
    }
    if (this.keys['ArrowRight'] || this.keys['d']) {
      this.catcherX += this.catcherSpeed;
      if (this.catcherX > this.width - this.catcherWidth) this.catcherX = this.width - this.catcherWidth;
    }
    this.updateCatcher();

    // Update balls
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      ball.y += ball.speed;
      ball.el.style.top = `${ball.y}px`;

      if (
        ball.y + 30 >= this.height - 40 &&
        ball.x + 30 > this.catcherX &&
        ball.x < this.catcherX + this.catcherWidth
      ) {
        this.score++;
        this.updateScore();
        ball.el.remove();
        this.balls.splice(i, 1);
        continue;
      }

      if (ball.y > this.height) {
        this.lives--;
        this.updateLives();
        ball.el.remove();
        this.balls.splice(i, 1);
        if (this.lives <= 0) {
          this.gameOver = true;
          this.finalScoreText.textContent = `Game Over! Final Score: ${this.score}`;
          this.gameOverScreen.style.display = 'flex';
        }
      }
    }

    if (!this.gameOver) {
      requestAnimationFrame(this.loop.bind(this));
    }
  }
}

window.onload = () => {
  const gameContainer = document.getElementById('game-container');
  new CatchTheBallGame(gameContainer);
};
