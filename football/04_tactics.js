const Tactics = {

  update() {

    const players = World.players;
    const ball = World.ball;

    players.forEach((p, index) => {

      const isBlue = p.team === "blue";

      // =========================
      // RED TEAM (FIXED PRESSING AI)
      // =========================
      if (!isBlue) {

        const dx = ball.x - p.x;
        const dy = ball.y - p.y;

        const dist = Math.hypot(dx, dy);

        // spacing system (prevents collapse into ball)
        const offsetX = (index % 3) * 15;
        const offsetY = (index % 4) * 10;

        // pressure with separation
        const targetX = ball.x + offsetX - dx * 0.2;
        const targetY = ball.y + offsetY - dy * 0.2;

        p.move(targetX, targetY);
        return;
      }

      // =========================
      // BLUE TEAM (4-3-3 STRUCTURE)
      // =========================

      let targetX = p.x;
      let targetY = p.y;

      // DEFENDERS (0–3)
      if (index < 4) {
        targetX = 200;
        targetY = 120 + index * 80;
      }

      // MIDFIELDERS (4–6)
      else if (index < 7) {
        targetX = 400;
        targetY = 150 + (index - 4) * 100;
      }

      // ATTACKERS (7–9)
      else if (index < 10) {
        targetX = 650;
        targetY = 150 + (index - 7) * 100;
      }

      // BALL OVERRIDE
      if (ball.owner === p) {
        targetX = 850;
        targetY = 250;
      } else if (!ball.owner) {
        const dx2 = ball.x - p.x;
        const dy2 = ball.y - p.y;

        targetX += dx2 * 0.15;
        targetY += dy2 * 0.15;
      }

      p.move(targetX, targetY);
    });
  }
};
