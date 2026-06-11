// ===============================
// SIMPLE FOOTBALL PHYSICS ENGINE (TACTICAL VERSION)
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

    // friction (grass)
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
    this.radius = 6;
    this.reset();
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

    // bounce walls
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

for (let i = 0; i < 5; i++) {
  players.push(new Player(200, 100 + i * 60, "blue"));
  players.push(new Player(700, 100 + i * 60, "red"));
}

let scoreBlue = 0;
let scoreRed = 0;

// ===============================
// TACTICS SYSTEM (NEW)
// ===============================
function applyTactics(players, ball) {
  const goalBlue = { x: canvas.width, y: canvas.height / 2 };
  const goalRed = { x: 0, y: canvas.height / 2 };

  for (let p of players) {

    let isBlue = p.team === "blue";
    let goal = isBlue ? goalBlue : goalRed;

    let dxBall = ball.x - p.x;
    let dyBall = ball.y - p.y;
    let distBall = Math.hypot(dxBall, dyBall);

    // ======================
    // POSSESSION
    // ======================
    if (ball.owner === p) {

      // occasional shot
      if (Math.random() < 0.02) {
        let vx = (goal.x - p.x) * 0.03;
        let vy = (goal.y - p.y) * 0.03;
        ball.kick(vx, vy);
        continue;
      }

      p.seek(goal.x, goal.y);
    }

    // ======================
    // OFF BALL
    // ======================
    else {

      if (distBall < 160) {
        p.seek(ball.x, ball.y);
      } else {
        let baseX = p.team === "blue" ? 250 : 650;
        let baseY = 100 + (p.x % 200);

        p.seek(baseX, baseY);
      }

      // pickup ball
      if (distBall < 14 && !ball.owner) {
        ball.attach(p);
      }
    }
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
// FIELD DRAW
// ===============================
function drawField() {
  ctx.fillStyle = "#0b6623";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#fff";
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
// MAIN LOOP (IMPORTANT ORDER)
// ===============================
function update() {
  drawField();

  ball.update();

  applyTactics(players, ball);

  for (let p of players) {
    p.update();
    p.draw();
  }

  ball.draw();

  checkGoal();

  requestAnimationFrame(update);
}

update();
