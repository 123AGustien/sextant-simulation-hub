const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

// GLOBAL STATE
const ball = new Ball();
const players = [];

let scoreBlue = 0;
let scoreRed = 0;

// INIT PLAYERS
for (let i = 0; i < 5; i++) {
  players.push(new Player(200, 100 + i * 60, "blue"));
}
for (let i = 0; i < 5; i++) {
  players.push(new Player(700, 100 + i * 60, "red"));
}

// LOOP
function update() {
  drawField();

  ball.update();

  applyTactics(players, ball);

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
