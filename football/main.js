const canvas = document.getElementById("pitch");
const ctx = canvas.getContext("2d");

// =====================
// GAME STATE
// =====================
const Game = {
  blueScore: 0,
  redScore: 0,
  running: false,
  animationId: null,

  start() {
    if (this.running) return;

    this.running = true;
    Engine.init();
  },

  reset() {
    this.blueScore = 0;
    this.redScore = 0;

    document.getElementById("blueScore").innerText = 0;
    document.getElementById("redScore").innerText = 0;

    this.running = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    Engine.init();
  },

  goal(team) {
    if (team === "blue") this.blueScore++;
    if (team === "red") this.redScore++;

    document.getElementById("blueScore").innerText = this.blueScore;
    document.getElementById("redScore").innerText = this.redScore;

    Engine.init();
  }
};

// =====================
// ENGINE
// =====================
const Engine = {

  init() {
    World.init433();

    if (!Game.running) {
      Game.running = true;
    }

    loop();
  },

  update() {
    Tactics.update();
    Physics.update();
  },

  draw() {
    ctx.fillStyle = "#1e7f1e";
    ctx.fillRect(0, 0, 900, 500);

    // center line
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(450, 0);
    ctx.lineTo(450, 500);
    ctx.stroke();

    // players
    World.players.forEach(p => {
      ctx.fillStyle = p.team;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
      ctx.fill();
    });

    // ball
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(World.ball.x, World.ball.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
};

// =====================
// MAIN LOOP (SAFE)
// =====================
function loop() {
  if (!Game.running) return;

  Engine.update();
  Engine.draw();

  Game.animationId = requestAnimationFrame(loop);
}

// =====================
// AUTO START (SAFE)
// =====================
window.onload = () => {
  Game.start();
};
