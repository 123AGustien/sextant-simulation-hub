const Physics = {

  update() {

    const ball = World.ball;

    // =====================
    // BALL UPDATE
    // =====================
    ball.update();

    // =====================
    // POSSESSION LOGIC
    // =====================
    World.players.forEach(p => {

      const dx = p.x - ball.x;
      const dy = p.y - ball.y;
      const dist = Math.hypot(dx, dy);

      // Only allow pickup if ball is free
      if (dist < 14 && !ball.owner) {
        ball.attach(p);
      }
    });

    // =====================
    // GOAL CHECK (SAFE)
    // =====================
    if (ball.x > 880 && !Physics.goalLocked) {
      Physics.goalLocked = true;
      Game.goal("blue");
      Physics.resetLock();
    }

    if (ball.x < 20 && !Physics.goalLocked) {
      Physics.goalLocked = true;
      Game.goal("red");
      Physics.resetLock();
    }
  },

  resetLock() {
    setTimeout(() => {
      Physics.goalLocked = false;
    }, 300);
  },

  goalLocked: false
};
