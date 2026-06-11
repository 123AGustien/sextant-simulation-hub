// ===============================
// SIMPLE FOOTBALL PHYSICS ENGINE
// ===============================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

// ===============================
// PLAYER CLASS (STEERING PHYSICS)
// ===============================
class Player {
  constructor(x, y, team) {
    this.x = x;
    this.y = y;
    this.team = team;

    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;

    this.maxSpeed = 2.8;
    this.maxForce = 0.2;
    this.radius = 10;
  }

  seek(tx, ty) {
    let dx = tx - this.x;
    let dy = ty - this.y;

    let dist = Math.hypot(dx, dy);
    if (dist < 0.01) return;

    dx /= dist;
    dy /= dist;

    let desiredVx = dx * this.maxSpeed;
    let desiredVy = dy * this.maxSpeed;

    this.ax += (desiredVx - this.vx) * 0.08;
    this.ay += (desiredVy - this.vy) * 0.08;
  }

  update() {
    this.vx += this.ax;
    this.vy += this.ay;

    // friction (grass resistance)
    this.vx *= 0.92;
    this.vy *= 0.92;

    // clamp speed
    let speed = Math.hypot(this.vx, this.vy);
    if (speed > this.maxSpeed) {
      this.vx = (this.vx / speed) * this.maxSpeed;
      this.vy = (this.vy / speed) * this.maxSpeed;
    }

    this.x += this.vx;
    this.y += this.vy;

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
// BALL PHYSICS
// ===============================
class Ball {
  constructor() {
    this.reset();
    this.radius = 6;
  }

  reset() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.vx = 0;
    this.vy = 0;
    this.owner = null;
  }

  attach(player) {
    this.owner = player;
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

    // friction
    this.vx *= 0.985;
    this.vy *= 0.985;

    // wall bounce
    if (this.x < 0 || this.x > canvas.width) this.vx *= -0.8;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -0.8;

    this.x = Math.max(0, Math.min(canvas.width, this.x));
    this.y = Math.max(0, Math.min(canvas.height, this.y));
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===============================
// GAME STATE
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

let scoreBlue = 0;
let scoreRed = 0;

// ===============================
// SIMPLE AI
// ===============================
function ai(player) {
  if (ball.owner && ball.owner.team === player.team) {
    // support teammate
    player.seek(canvas.width / 2, canvas.height / 2);
  } else {
    // chase ball
    player.seek(ball.x, ball.y);
  }

  // collision with ball (possession)
  let dx = ball.x - player.x;
  let dy = ball.y - player.y;
  let dist = Math.hypot(dx, dy);

  if (dist < 14 && !ball.owner) {
    ball.attach(player);
  }

  // shoot logic
  if (ball.owner === player && Math.random() < 0.01) {
    let goalX = player.team === "blue" ? canvas.width : 0;
    let goalY = canvas.height / 2;

    let vx = (goalX - player.x) * 0.02;
    let vy = (goalY - player.y) * 0.02;

    ball.kick(vx, vy);
  }
}

// ===============================
// GOAL CHECK
// ===============================
function checkGoal() {
  if (ball.x < 10 && ball.y > 200 && ball.y < 300) {
    scoreRed++;
    ball.reset();
  }

  if (ball.x > canvas.width - 10 && ball.y > 200 && ball.y < 300) {
    scoreBlue++;
    ball.reset();
  }
}

// ===============================
// RENDER FIELD
// ===============================
function drawField() {
  ctx.fillStyle = "#0b6623";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#ffffff";
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Blue ${scoreBlue} - ${scoreRed} Red`, 380, 30);
}

// ===============================
// MAIN LOOP
// ===============================
function update() {
  drawField();

  ball.update();

  players.forEach(p => {
    ai(p);
    p.update();
    p.draw();
  });

  ball.draw();

  checkGoal();

  requestAnimationFrame(update);
}

update();
