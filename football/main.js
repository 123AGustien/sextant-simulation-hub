const canvas = document.getElementById("pitch");
const ctx = canvas.getContext("2d");

const Game = {
  blueScore: 0,
  redScore: 0,
  running: false,

  start() {
    Engine.init();
    this.running = true;
  },

  reset() {
    this.blueScore = 0;
    this.redScore = 0;
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

const Engine = {
  init() {
    World.init433();
    loop();
  },

  update() {
    Tactics.update();
    Physics.update();
  },

  draw() {
    ctx.fillStyle = "#1e7f1e";
    ctx.fillRect(0, 0, 900, 500);

    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(450, 0);
    ctx.lineTo(450, 500);
    ctx.stroke();

    World.players.forEach(p => {
      ctx.fillStyle = p.team;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(World.ball.x, World.ball.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
};

function loop() {
  if (!Game.running) return;

  Engine.update();
  Engine.draw();

  requestAnimationFrame(loop);
}

window.onload = () => Engine.init();
