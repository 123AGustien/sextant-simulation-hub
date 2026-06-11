export const TacticalEngine = {

  getZone(ball){

    if(ball.x < 300) return "defense";
    if(ball.x < 600) return "midfield";
    return "attack";
  },

  getTeamState(team, ball){

    if(team === "blue"){

      if(ball.x < 300) return "DEFEND";
      if(ball.x < 600) return "BUILDUP";
      return "ATTACK";
    }

    if(team === "red"){

      if(ball.x > 600) return "DEFEND";
      if(ball.x > 300) return "BUILDUP";
      return "ATTACK";
    }
  }
};
