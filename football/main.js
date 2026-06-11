// ===============================
// FOOTBALL MAIN ENGINE (CLEAN VERSION)
// ===============================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

// ===============================
// GLOBAL STATE
// ===============================
const ball = new Ball();
const players = [];

let scoreBlue = 0;
let scoreRed = 0;

// ===============================
// INIT PLAYERS
// ===============================
for (let i = 0; i < 5; i++) {
  players.push(new Player(200, 100 + i * 60, "blue"));
  players.push(new Player(700, 100 + i * 60, "red"));
}

// ===============================
// FIELD RENDER
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
// MAIN LOOP
// ===============================
function update() {
  drawField();

  // ball physics
  ball.update(canvas.width, canvas.height);

  // pickup logic
  ball.checkPickup(players);

  // tactical AI system (ONLY brain system)
  applyTactics(players, ball, canvas.width, canvas.height);

  // player physics
  players.forEach(p => {
    p.update(canvas.width, canvas.height);
    p.draw();
  });

  // render ball
  ball.draw();

  // goals
  checkGoal();

  requestAnimationFrame(update);
}

update();
