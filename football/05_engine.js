let canvas = document.getElementById("pitch");
let ctx = canvas.getContext("2d");

let blueTeam = [];
let redTeam = [];
let ball;

let blueScore = 0;
let redScore = 0;

// ======================= BALL STATE =======================
let ballVx = 0;
let ballVy = 0;
let ballInTransit = false;
let passTarget = null;

// ======================= TEAM INTENT STATES =======================
const STATE = {
  ATTACK: "attack",
  DEFEND: "defend",
  BALANCE: "balance"
};

let blueState = STATE.BALANCE;
let redState = STATE.BALANCE;

// ======================= INIT =======================
function init() {
  blueTeam = [
    new Player(200, 250, "blue", "mid"),
    new Player(200, 200, "blue", "def"),
    new Player(200, 300, "blue", "str")
  ];

  redTeam = [
    new Player(700, 250, "red", "mid"),
    new Player(700, 200, "red", "def"),
    new Player(700, 300, "red", "str")
  ];

  ball = new Ball();
  ball.owner = blueTeam[0];
}

// ======================= DIST =======================
function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// ======================= GAME STATE DETECTION =======================
function updateTeamStates() {
  if (ball.x < 300) {
    blueState = STATE.ATTACK;
    redState = STATE.DEFEND;
  } else if (ball.x > 600) {
    blueState = STATE.DEFEND;
    redState = STATE.ATTACK;
  } else {
    blueState = STATE.BALANCE;
    redState = STATE.BALANCE;
  }
}

// ======================= PRESSURE =======================
function pressure(player, opponents) {
  let p = 0;
  opponents.forEach(o => {
    let d = distance(player, o);
    if (d < 90) p += (90 - d);
  });
  return p;
}

// ======================= PASS AI =======================
function choosePass(team, opponents) {
  let carrier = ball.owner;
  if (!carrier) return null;

  let best = null;
  let bestScore = -999;

  team.forEach(p => {
    if (p === carrier) return;

    let d = distance(carrier, p);
    let pr = pressure(p, opponents);

    let score = (150 - d) - pr * 0.7;

    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  });

  return best;
}

// ======================= PASS =======================
function passBall(from, to) {
  let dx = to.x - from.x;
  let dy = to.y - from.y;
  let mag = Math.hypot(dx, dy);

  ballVx = (dx / mag) * 7.5;
  ballVy = (dy / mag) * 7.5;

  ball.owner = null;
  ballInTransit = true;
  passTarget = to;
}

// ======================= STRATEGIC FORMATIONS =======================
function applyStrategy(team, state, side) {

  let baseX = side === "blue" ? 200 : 700;

  team.forEach(p => {

    // DEFENSIVE SHIFT
    if (state === STATE.DEFEND) {
      if (p.role === "def") p.move(baseX, 150);
      if (p.role === "mid") p.move(baseX + (side === "blue" ? 50 : -50), 250);
      if (p.role === "str") p.move(baseX + (side === "blue" ? 100 : -100), 350);
    }

    // ATTACK SHIFT
    if (state === STATE.ATTACK) {
      if (p.role === "def") p.move(baseX + (side === "blue" ? 50 : -50), 200);
      if (p.role === "mid") p.move(baseX + (side === "blue" ? 150 : -150), 250);
      if (p.role === "str") p.move(baseX + (side === "blue" ? 250 : -250), 300);
    }

    // BALANCED SHAPE
    if (state === STATE.BALANCE) {
      if (p.role === "def") p.move(baseX, 180);
      if (p.role === "mid") p.move(baseX, 250);
      if (p.role === "str") p.move(baseX, 320);
    }
  });
}

// ======================= INTERCEPTION PREDICTION =======================
function predictBall() {
  if (!ballInTransit) return;

  let futureX = ball.x + ballVx * 10;
  let futureY = ball.y + ballVy * 10;

  return { x: futureX, y: futureY };
}

// ======================= UPDATE =======================
function update() {

  updateTeamStates();

  applyStrategy(blueTeam, blueState, "blue");
  applyStrategy(redTeam, redState, "red");

  let opponents = ball.owner?.team === "blue" ? redTeam : blueTeam;

  // PASS LOGIC
  if (ball.owner && !ballInTransit) {
    let team = ball.owner.team === "blue" ? blueTeam : redTeam;
    let target = choosePass(team, opponents);

    if (target) passBall(ball.owner, target);
  }

  // BALL PHYSICS
  if (ballInTransit) {
    ball.x += ballVx;
    ball.y += ballVy;

    ballVx *= 0.97;
    ballVy *= 0.97;

    if (passTarget && distance(ball, passTarget) < 10) {
      ball.owner = passTarget;
      ballInTransit = false;
      passTarget = null;
    }
  }

  // POSSESSION
  [...blueTeam, ...redTeam].forEach(p => {
    if (distance(p, ball) < 12 && !ballInTransit) {
      ball.owner = p;
    }
  });

  // GOALS
  if (ball.x > 880) goal("blue");
  if (ball.x < 20) goal("red");
}

// ======================= DRAW =======================
function draw() {
  ctx.clearRect(0, 0, 900, 500);

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, 5, 0, Math.PI * 2);
  ctx.fill();

  drawTeam(blueTeam, "blue");
  drawTeam(redTeam, "red");
}

// ======================= GOAL =======================
function goal(team) {
  if (team === "blue") blueScore++;
  if (team === "red") redScore++;

  init();
}

// ======================= LOOP =======================
function startMatch() {
  init();
  loop();
}

function resetMatch() {
  blueScore = 0;
  redScore = 0;
  init();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
