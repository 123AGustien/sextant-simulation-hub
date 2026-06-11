class Player {
  constructor(x, y, team) {
    this.x = x;
    this.y = y;
    this.team = team;

    // physics state
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;

    // tuning
    this.maxSpeed = 3.2;
    this.maxForce = 0.22;
    this.friction = 0.90;

    // tactical state
    this.targetX = x;
    this.targetY = y;
    this.hasBall = false;
  }

  // AI steering (smooth movement)
  seek(tx, ty) {
    this.targetX = tx;
    this.targetY = ty;

    let dx = tx - this.x;
    let dy = ty - this.y;

    let dist = Math.hypot(dx, dy);
    if (dist < 0.001) return;

    dx /= dist;
    dy /= dist;

    let desiredVx = dx * this.maxSpeed;
    let desiredVy = dy * this.maxSpeed;

    // steering force (soft correction)
    this.ax += (desiredVx - this.vx) * this.maxForce;
    this.ay += (desiredVy - this.vy) * this.maxForce;
  }

  // physics integration
  update() {
    // apply acceleration
    this.vx += this.ax;
    this.vy += this.ay;

    // friction (grass resistance)
    this.vx *= this.friction;
    this.vy *= this.friction;

    // speed cap
    let speed = Math.hypot(this.vx, this.vy);
    if (speed > this.maxSpeed) {
      this.vx = (this.vx / speed) * this.maxSpeed;
      this.vy = (this.vy / speed) * this.maxSpeed;
    }

    // position update
    this.x += this.vx;
    this.y += this.vy;

    // reset acceleration each frame
    this.ax = 0;
    this.ay = 0;
  }

  // simple ball interaction radius
  distanceTo(ball) {
    return Math.hypot(ball.x - this.x, ball.y - this.y);
  }

  tryTakeBall(ball) {
    if (this.distanceTo(ball) < 12 && !ball.owner) {
      ball.attach(this);
      this.hasBall = true;
    }
  }
}

class Ball {
  constructor() {
    this.x = 450;
    this.y = 250;

    this.vx = 0;
    this.vy = 0;

    this.owner = null;

    this.friction = 0.97;
  }

  attach(player) {
    this.owner = player;
    player.hasBall = true;
  }

  detach() {
    if (this.owner) {
      this.owner.hasBall = false;
    }
    this.owner = null;
  }

  kick(vx, vy) {
    this.detach();
    this.vx = vx;
    this.vy = vy;
  }

  update() {
    // possession system
    if (this.owner) {
      // ball sticks slightly in front of player (not perfect overlap)
      this.x = this.owner.x + this.owner.vx * 2;
      this.y = this.owner.y + this.owner.vy * 2;
      return;
    }

    // free ball physics
    this.x += this.vx;
    this.y += this.vy;

    // friction
    this.vx *= this.friction;
    this.vy *= this.friction;

    // stop micro sliding
    if (Math.abs(this.vx) < 0.01) this.vx = 0;
    if (Math.abs(this.vy) < 0.01) this.vy = 0;
  }
}

/* =========================
   MATCH ENGINE HELPERS
   ========================= */

function updateMatch(players, ball, tactics = {}) {
  // simple AI loop
  for (let p of players) {
    if (!ball.owner) {
      p.seek(ball.x, ball.y);
      p.tryTakeBall(ball);
    } else if (ball.owner === p) {
      // basic forward push direction
      let goalX = p.team === "blue" ? 900 : 0;
      let goalY = 250;
      p.seek(goalX, goalY);
    } else {
      // default formation hold
      let home = tactics[p.team]?.home || { x: p.x, y: p.y };
      p.seek(home.x, home.y);
    }

    p.update();
  }

  ball.update();

  resolveCollisions(players);
}

function resolveCollisions(players) {
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      let a = players[i];
      let b = players[j];

      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = Math.hypot(dx, dy);

      let minDist = 14;

      if (dist > 0 && dist < minDist) {
        let overlap = (minDist - dist) / 2;

        dx /= dist;
        dy /= dist;

        a.x -= dx * overlap;
        a.y -= dy * overlap;

        b.x += dx * overlap;
        b.y += dy * overlap;
      }
    }
  }
}
