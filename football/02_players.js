const World = {
  players: [],
  ball: null,

  init433() {
    this.players = [];

    // 4 defenders
    for (let i = 0; i < 4; i++) {
      this.players.push(new Player(200, 120 + i * 80, "blue"));
    }

    // 3 midfielders
    for (let i = 0; i < 3; i++) {
      this.players.push(new Player(400, 150 + i * 100, "blue"));
    }

    // 3 attackers
    for (let i = 0; i < 3; i++) {
      this.players.push(new Player(650, 150 + i * 100, "blue"));
    }

    // red mirror team
    for (let i = 0; i < 10; i++) {
      this.players.push(new Player(700, 100 + i * 35, "red"));
    }

    this.ball = new Ball();
    this.ball.attach(this.players[0]);
  }
};

class Player {
  constructor(x, y, team) {
    this.x = x;
    this.y = y;
    this.team = team;
  }

  move(tx, ty) {
    this.x += (tx - this.x) * 0.05;
    this.y += (ty - this.y) * 0.05;
  }
}

class Ball {
  constructor() {
    this.x = 450;
    this.y = 250;
    this.owner = null;
  }

  attach(p) {
    this.owner = p;
  }

  update() {
    if (this.owner) {
      this.x = this.owner.x;
      this.y = this.owner.y;
    }
  }
}
