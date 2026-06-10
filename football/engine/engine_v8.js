// =======================
// ENGINE V8 - FAILSAFE ORCHESTRATOR
// =======================

// --- SAFETY FLAGS ---
let engineHealthy = true;

// ======================= STATE VALIDATION =======================
function validateState() {
  if (!ball || typeof ball.x !== "number" || typeof ball.y !== "number") {
    console.warn("Ball corrupted → reset");
    init();
    return;
  }

  ballVx = isNaN(ballVx) ? 0 : ballVx;
  ballVy = isNaN(ballVy) ? 0 : ballVy;
}

// ======================= TEAM VALIDATION =======================
function validateTeams() {
  const allPlayers = [...blueTeam, ...redTeam];

  allPlayers.forEach(p => {
    if (!p || typeof p.x !== "number" || typeof p.y !== "number") {
      console.warn("Player corruption detected → reset");
      init();
    }
  });
}

// ======================= FIELD BOUNDS ENFORCER =======================
function clampBall() {
  if (!ball) return;

  ball.x = Math.max(10, Math.min(890, ball.x));
  ball.y = Math.max(10, Math.min(490, ball.y));
}

// ======================= VELOCITY SAFETY =======================
function clampVelocity() {
  const maxSpeed = 12;

  ballVx = Math.max(-maxSpeed, Math.min(maxSpeed, ballVx));
  ballVy = Math.max(-maxSpeed, Math.min(maxSpeed, ballVy));
}

// ======================= AUTO RECOVERY =======================
function recoverSystem() {
  console.warn("System recovery triggered");
  init();
  ballVx = 0;
  ballVy = 0;
  ballInTransit = false;
  passTarget = null;
}

// ======================= CORE SAFE UPDATE =======================
function safeUpdate() {
  try {
    validateState();
    validateTeams();

    updateTeamStates();
    applyStrategy(blueTeam, blueState, "blue");
    applyStrategy(redTeam, redState, "red");

    let opponents =
      ball.owner?.team === "blue" ? redTeam : blueTeam;

    // PASS LOGIC SAFETY
    if (ball.owner && !ballInTransit) {
      let team =
        ball.owner.team === "blue" ? blueTeam : redTeam;

      let target = choosePass(team, opponents);

      if (target) passBall(ball.owner, target);
    }

    // BALL MOVEMENT SAFETY
    if (ballInTransit) {
      ball.x += ballVx;
      ball.y += ballVy;

      ballVx *= 0.97;
      ballVy *= 0.97;

      clampVelocity();

      if (passTarget && distance(ball, passTarget) < 10) {
        ball.owner = passTarget;
        ballInTransit = false;
        passTarget = null;
      }
    }

    // POSSESSION SAFETY
    [...blueTeam, ...redTeam].forEach(p => {
      if (distance(p, ball) < 12 && !ballInTransit) {
        ball.owner = p;
      }
    });

    // GOALS SAFETY
    if (ball.x > 880) goal("blue");
    if (ball.x < 20) goal("red");

    clampBall();

  } catch (err) {
    console.error("Engine V8 crash caught:", err);
    recoverSystem();
  }
}

// ======================= PUBLIC ENGINE LOOP =======================
function engineV8Tick() {
  safeUpdate();
  draw();
}
