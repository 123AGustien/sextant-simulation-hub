const Physics = {
  update() {
    World.ball.update();

    World.players.forEach(p => {
      if (Math.hypot(p.x - World.ball.x, p.y - World.ball.y) < 14) {
        World.ball.attach(p);
      }
    });

    if (World.ball.x > 880) Game.goal("blue");
    if (World.ball.x < 20) Game.goal("red");
  }
};
