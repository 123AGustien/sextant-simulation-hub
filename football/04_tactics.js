function findClosestTeammate(player, players) {
  let best = null;
  let bestDist = Infinity;

  for (let p of players) {
    if (p.team !== player.team || p === player) continue;

    let d = Math.hypot(p.x - player.x, p.y - player.y);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }

  return best;
}

function findClosestOpponent(player, players) {
  let best = null;
  let bestDist = Infinity;

  for (let p of players) {
    if (p.team === player.team) continue;

    let d = Math.hypot(p.x - player.x, p.y - player.y);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }

  return best;
}

// ===============================
// MAIN TACTICAL DECISION ENGINE
// ===============================
function applyTactics(players, ball) {
  const goalBlue = { x: 900, y: 250 };
  const goalRed = { x: 0, y: 250 };

  for (let p of players) {
    let isBlue = p.team === "blue";
    let goal = isBlue ? goalBlue : goalRed;

    let distToBall = Math.hypot(ball.x - p.x, ball.y - p.y);

    let teammate = findClosestTeammate(p, players);
    let opponent = findClosestOpponent(p, players);

    // =========================
    // IF PLAYER HAS BALL
    // =========================
    if (ball.owner === p) {

      // ATTACK LOGIC
      if (distToBall < 1) {

        // STRIKER behaviour (direct shoot)
        if (Math.random() < 0.35) {
          let vx = (goal.x - p.x) * 0.04;
          let vy = (goal.y - p.y) * 0.02;
          ball.kick(vx, vy);
          continue;
        }

        // PASSING logic
        if (teammate && Math.random() < 0.6) {
          let vx = (teammate.x - p.x) * 0.12;
          let vy = (teammate.y - p.y) * 0.12;
          ball.kick(vx, vy);
          continue;
        }

        // default push forward
        p.seek(goal.x, goal.y);
      }
    }

    // =========================
    // NO BALL - OFF BALL AI
    // =========================
    else {

      // PRESSURE if close to ball
      if (distToBall < 140) {
        p.seek(ball.x, ball.y);
      }

      // SUPPORT POSITIONING
      else {
        let offsetX = isBlue ? -60 : 60;
        let offsetY = (p.y < 250 ? -30 : 30);

        p.seek(p.x + offsetX, p.y + offsetY);
      }

      // INTERCEPT BALL
      if (distToBall < 12 && !ball.owner) {
        ball.attach(p);
      }

      // MARK OPPONENT (basic pressure system)
      if (opponent && Math.random() < 0.05) {
        p.seek(opponent.x, opponent.y);
      }
    }
  }
}
