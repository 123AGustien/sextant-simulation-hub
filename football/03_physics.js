const Physics = {

  update() {

    const ball = World.ball;

    // =====================
    // BALL UPDATE
    // =====================
    ball.update();

    // =====================
    // POSSESSION LOGIC (STABLE)
    // =====================
    World.players.forEach(p => {

      const dx = p.x - ball.x;
      const dy = p.y - ball.y;
      const dist = Math.hypot(dx, dy);

      // PICKUP
      if (dist < 14 && !ball.owner) {
        ball.attach(p);
        ball.owner = p;
      }

      // RELEASE (IMPORTANT FIX)
      if (ball.owner === p && dist > 20) {
        ball.owner = null;
      }
    });

    // =====================
    // GOAL CHECK (SAFE)
    // =====================
    if (ball.x > 880 && !Physics.goalLocked) {
      Physics.triggerGoal("blue");
    }

    if (ball.x < 20 && !Physics.goalLocked) {
      Physics.triggerGoal("red");
    }
  },

  triggerGoal(team) {
    Physics.goalLocked = true;
    Game.goal(team);

    setTimeout(() => {
      Physics.goalLocked = false;
    }, 300);
  },

  goalLocked: false
};
