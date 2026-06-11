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
    this.maxForce = 0.25;

    this.radius = 10;
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

    this.ax += (desiredVx - this.vx) * 0.12;
    this.ay += (desiredVy - this.vy) * 0.12;
  }

  update(width, height) {
    this.vx += this.ax;
    this.vy += this.ay;

    this.vx *= 0.90;
    this.vy *= 0.90;

    const speed = Math.hypot(this.vx, this.vy);
    if (speed > this.maxSpeed) {
      this.vx = (this.vx / speed) * this.maxSpeed;
      this.vy = (this.vy / speed) * this.maxSpeed;
    }

    this.x += this.vx;
    this.y += this.vy;

    // field boundaries
    this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));

    this.ax = 0;
    this.ay = 0;
  }
}

class Ball {
  constructor(x = 450, y = 250) {
    this.x = x;
    this.y = y;

    this.vx = 0;
    this.vy = 0;

    this.owner = null;

    this.radius = 6;
  }

  attach(player) {
    this.owner = player;
    this.vx = 0;
    this.vy = 0;
  }

  detach() {
    this.owner = null;
  }

  kick(vx, vy) {
    this.owner = null;
    this.vx = vx;
    this.vy = vy;
  }

  update(width, height) {
    if (this.owner) {
      // ball sticks to player (possession)
      this.x = this.owner.x;
      this.y = this.owner.y;
      return;
    }

    // movement
    this.x += this.vx;
    this.y += this.vy;

    // friction (grass + air resistance)
    this.vx *= 0.985;
    this.vy *= 0.985;

    // bounce walls
    if (this.x < this.radius || this.x > width - this.radius) {
      this.vx *= -0.7;
      this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
    }

    if (this.y < this.radius || this.y > height - this.radius) {
      this.vy *= -0.7;
      this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));
    }
  }

  checkPickup(players) {
    if (this.owner) return;

    for (let p of players) {
      let dx = p.x - this.x;
      let dy = p.y - this.y;
      let dist = Math.hypot(dx, dy);

      if (dist < p.radius + this.radius) {
        this.attach(p);
        break;
      }
    }
  }
}

// ---------------- MATCH ENGINE ----------------

class Match {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.players = [];
    this.ball = new Ball();
  }

  addPlayer(p) {
    this.players.push(p);
  }

  update() {
    // simple AI: players chase ball
    for (let p of this.players) {
      if (!this.ball.owner || this.ball.owner !== p) {
        p.seek(this.ball.x, this.ball.y);
      }

      p.update(this.width, this.height);
    }

    // ball logic
    this.ball.checkPickup(this.players);
    this.ball.update(this.width, this.height);

    // kick logic (auto demo)
    if (this.ball.owner) {
      let p = this.ball.owner;

      // random kick chance
      if (Math.random() < 0.01) {
        this.ball.kick(
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6
        );
      }
    }
  }
}

// ---------------- USAGE ----------------

// field size
const match = new Match(900, 500);

// players
for (let i = 0; i < 5; i++) {
  match.addPlayer(new Player(100 + i * 20, 100, "blue"));
  match.addPlayer(new Player(100 + i * 20, 400, "red"));
}

// game loop
function loop() {
  match.update();

  // call your renderer here:
  // drawPlayers(match.players)
  // drawBall(match.ball)

  requestAnimationFrame(loop);
}

loop();
