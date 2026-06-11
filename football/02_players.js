// =====================
// FOOTBALL PHYSICS ENGINE
// =====================

// ---------- PLAYER ----------
class Player {
  constructor(x, y, team) {
    this.x = x;
    this.y = y;
    this.team = team;

    // physics
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;

    this.maxSpeed = 3;
  }

  seek(tx, ty) {
    let dx = tx - this.x;
    let dy = ty - this.y;

    let dist = Math.hypot(dx, dy);
    if (dist === 0) return;

    dx /= dist;
    dy /= dist;

    let desiredVx = dx * this.maxSpeed;
    let desiredVy = dy * this.maxSpeed;

    // steering force (smooth AI)
    this.ax += (desiredVx - this.vx) * 0.12;
    this.ay += (desiredVy - this.vy) * 0.12;
  }

  update() {
    // apply acceleration
    this.vx += this.ax;
    this.vy += this.ay;

    // grass friction
    this.vx *= 0.90;
    this.vy *= 0.90;

    // speed cap
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > this.maxSpeed) {
      this.vx = (this.vx / speed) * this.maxSpeed;
      this.vy = (this.vy / speed) * this.maxSpeed;
    }

    // move
    this.x += this.vx;
    this.y += this.vy;

    // reset acceleration
    this.ax = 0;
    this.ay = 0;
  }
}

// ---------- BALL ----------
class Ball {
  constructor(x = 450, y = 250) {
    this.x = x;
    this.y = y;

    this.vx = 0;
    this.vy = 0;

    this.owner = null;
  }

  attach(player) {
    this.owner = player;
  }

  detach() {
    this.owner = null;
  }

  kick(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    this.owner = null;
  }

  update() {
    // follow player if in possession
    if (this.owner) {
      this.x = this.owner.x;
      this.y = this.owner.y;
      return;
    }

    // free ball physics
    this.x += this.vx;
    this.y += this.vy;

    // friction (ball slows naturally)
    this.vx *= 0.98;
    this.vy *= 0.98;
  }
}

// =====================
// SIMPLE GAME SETUP
// =====================

// players
const playerA = new Player(100, 200, "blue");
const playerB = new Player(700, 300, "red");

// ball
const ball = new Ball();

// simple AI target
let targetX = 800;
let targetY = 300;

// click to move target
document.addEventListener("click", (e) => {
  targetX = e.clientX;
  targetY = e.clientY;
});

// possession check
function checkPossession() {
  const dA = Math.hypot(ball.x - playerA.x, ball.y - playerA.y);
  const dB = Math.hypot(ball.x - playerB.x, ball.y - playerB.y);

  if (dA < 20) ball.attach(playerA);
  else if (dB < 20) ball.attach(playerB);
}

// kick ball randomly for demo
setInterval(() => {
  if (ball.owner) {
    const vx = (Math.random() - 0.5) * 6;
    const vy = (Math.random() - 0.5) * 6;
    ball.kick(vx, vy);
  }
}, 2000);

// =====================
// GAME LOOP
// =====================
function gameLoop() {
  requestAnimationFrame(gameLoop);

  // AI movement
  playerA.seek(targetX, targetY);
  playerB.seek(ball.x, ball.y);

  // update physics
  playerA.update();
  playerB.update();

  ball.update();
  checkPossession();

  // OPTIONAL: log (remove later)
  console.log(
    "A:", playerA.x.toFixed(1), playerA.y.toFixed(1),
    "| B:", playerB.x.toFixed(1), playerB.y.toFixed(1),
    "| Ball:", ball.x.toFixed(1), ball.y.toFixed(1)
  );
}

// start
gameLoop();
