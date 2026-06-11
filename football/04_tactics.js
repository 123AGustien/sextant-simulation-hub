const Tactics = {

  update() {

    const players = World.players;

    players.forEach((p, index) => {

      const isBlue = p.team === "blue";
      const ball = World.ball;

      // =========================
      // RED TEAM (PRESSING AI)
      // =========================
      if (!isBlue) {

        // closest pressure behavior (simple swarm but not chaotic)
        const dx = ball.x - p.x;
        const dy = ball.y - p.y;

        p.move(ball.x + dx * 0.1, ball.y + dy * 0.1);

        return;
      }

      // =========================
      // BLUE TEAM (4-3-3 STRUCTURE)
      // =========================

      let targetX = p.x;
      let targetY = p.y;

      // -------------------------
      // DEFENDERS (0–3)
      // -------------------------
      if (index < 4) {
        targetX = 200;
        targetY = 120 + index * 80;
      }

      // -------------------------
      // MIDFIELDERS (4–6)
      // -------------------------
      else if (index < 7) {
        targetX = 400;
        targetY = 150 + (index - 4) * 100;
      }

      // -------------------------
      // ATTACKERS (7–9)
      // -------------------------
      else if (index < 10) {
        targetX = 650;
        targetY = 150 + (index - 7) * 100;
      }

      // =========================
      // BALL OVERRIDE LOGIC
      // =========================
      if (ball.owner === p) {
        targetX = 850;
        targetY = 250;
      } else if (!ball.owner) {
        // support play (not collapse formation)
        const dx = ball.x - p.x;
        const dy = ball.y - p.y;

        targetX += dx * 0.15;
        targetY += dy * 0.15;
      }

      p.move(targetX, targetY);
    });
  }
};
