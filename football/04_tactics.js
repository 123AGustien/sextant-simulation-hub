const Tactics = {
  update() {
    World.players.forEach(p => {

      if (p.team === "red") {
        // pressure AI
        p.move(World.ball.x, World.ball.y);
      }

      if (p.team === "blue") {
        // structured formation movement
        let targetX = p.x;
        let targetY = p.y;

        if (World.ball.owner === p) {
          targetX = 850;
          targetY = 250;
        } else {
          targetX = World.ball.x;
          targetY = World.ball.y;
        }

        p.move(targetX, targetY);
      }
    });
  }
};
