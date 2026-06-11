// ===============================
// FULL FOOTBALL SIMULATION ENGINE
// ===============================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

// ===============================
// MATCH STATE
// ===============================
const match = {
  width: canvas.width,
  height: canvas.height,
  scoreBlue: 0,
  scoreRed: 0,
};

// ===============================
// PLAYER CLASS
// ===============================
class Player {
  constructor(x, y, team, role = "mid") {
    this.x = x;
    this.y = y;
    this.team = team;
    this.role = role;

    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;

    this.maxSpeed = 3;
    this.radius = 10;
  }

  seek(tx, ty) {
    let dx = tx - this.x;
    let dy = ty - this.y;

    let dist = Math.hypot(dx, dy);
    if (dist < 0.001) return;

    dx /= dist;
    dy /= dist;

    let desiredVx = dx * this.maxSpeed;
    let desiredVy = dy * this.maxSpeed;

    this.ax += (desiredVx - this.vx) * 0.10;
    this.ay += (desiredVy - this.vy) * 0.10;
  }

  update(width, height) {
    this.vx += this.ax;
    this.vy += this.ay;

    this.vx *= 0.90;
    this.vy *= 0.90;

    let speed = Math.hypot(this.vx, this.vy);
    if (speed > this.maxSpeed) {
      this.vx = (this.vx / speed) * this.maxSpeed;
      this.vy = (this.vy / speed) * this.maxSpeed;
    }

    this.x += this.vx;
    this.y += this.vy;

    // boundaries
    this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));

    this.ax = 0;
    this.ay = 0;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.team === "blue" ? "#4da3ff" : "#ff4d4d";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===============================
// BALL CLASS
// ===============================
class Ball {
  constructor() {
    this.reset();
    this.radius = 6;
  }

  reset() {
    this.x = match.width / 2;
    this.y = match.height / 2;
    this.vx = 0;
    this.vy = 0;
    this.owner = null;
  }

  attach(player) {
    this.owner = player;
    this.vx = 0;
    this.vy = 0;
  }

  kick(vx, vy) {
    this.owner = null;
    this.vx = vx;
    this.vy = vy;
  }

  update() {
    if (this.owner) {
      this.x = this.owner.x;
      this.y = this.owner.y;
      return;
    }

    this.x += this.vx;
    this.y += this.vy;

    this.vx *= 0.985;
    this.vy *= 0.985;

    // wall bounce
    if (this.x < this.radius || this.x > match.width - this.radius) {
      this.vx *= -0.7;
    }

    if (this.y < this.radius || this.y > match.height - this.radius) {
      this.vy *= -0.7;
    }

    this.x = Math.max(this.radius, Math.min(match.width - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(match.height - this.radius, this.y));
  }

  checkPickup(players) {
    if (this.owner) return;

    for (let p of players) {
      let dist = Math.hypot(p.x - this.x, p.y - this.y);
      if (dist < p.radius + this.radius) {
        this.attach(p);
        break;
      }
    }
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===============================
// INIT GAME
// ===============================
const ball = new Ball();
const players = [];

// Blue team
for (let i = 0; i < 5; i++) {
  players.push(new Player(200, 100 + i * 60, "blue"));
}

// Red team
for (let i = 0; i < 5; i++) {
  players.push(new Player(700, 100 + i * 60, "red"));
}

// ===============================
// TACTICS ENGINE
// ===============================
function applyTactics(players, ball) {
  for (let p of players) {

    // POSSESSION
    if (ball.owner === p) {
      let goalX = p.team === "blue" ? match.width : 0;
      let goalY = match.height / 2;

      p.seek(goalX, goalY);

      // shoot chance
      if (Math.random() < 0.02) {
        ball.kick(
          (goalX - p.x) * 0.03,
          (goalY - p.y) * 0.03
        );
      }
    }

    // NO POSSESSION
    else {
      let homeX = p.team === "blue" ? 250 : 650;
      let homeY = 100 + (p.x % 200);

      let distBall = Math.hypot(ball.x - p.x, ball.y - p.y);

      if (distBall < 140) {
        p.seek(ball.x, ball.y);
      } else {
        p.seek(homeX, homeY);
      }

      if (distBall < 14 && !ball.owner) {
        ball.attach(p);
      }
    }
  }
}

// ===============================
// GOALS
// ===============================
function checkGoal() {
  if (ball.x < 10 && ball.y > 200 && ball.y < 300) {
    match.scoreRed++;
    ball.reset();
  }

  if (ball.x > match.width - 10 && ball.y > 200 && ball.y < 300) {
    match.scoreBlue++;
    ball.reset();
  }
}

// ===============================
// DRAW FIELD
// ===============================
function drawField() {
  ctx.fillStyle = "#0b6623";
  ctx.fillRect(0, 0, match.width, match.height);

  ctx.strokeStyle = "#fff";
  ctx.strokeRect(10, 10, match.width - 20, match.height - 20);

  ctx.beginPath();
  ctx.moveTo(match.width / 2, 0);
  ctx.lineTo(match.width / 2, match.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(match.width / 2, match.height / 2, 60, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(
    `Blue ${match.scoreBlue} - ${match.scoreRed} Red`,
    360,
    30
  );
}

// ===============================
// MAIN LOOP
// ===============================
function update() {
  drawField();

  applyTactics(players, ball);

  ball.update();
  ball.checkPickup(players);

  for (let p of players) {
    p.update(match.width, match.height);
    p.draw();
  }

  ball.draw();

  checkGoal();

  requestAnimationFrame(update);
}

update();
