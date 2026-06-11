const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

// =====================
// FORMATION (4-3-3)
// =====================
const World = {

  players: [
    // BLUE TEAM (defending left → attacking right)
    {x:120,y:150,team:"blue"},
    {x:120,y:250,team:"blue"},
    {x:120,y:350,team:"blue"},

    // MIDFIELD
    {x:250,y:200,team:"blue"},
    {x:250,y:300,team:"blue"},

    // STRIKER
    {x:350,y:250,team:"blue"},

    // RED TEAM (mirror)
    {x:780,y:150,team:"red"},
    {x:780,y:250,team:"red"},
    {x:780,y:350,team:"red"},

    {x:650,y:200,team:"red"},
    {x:650,y:300,team:"red"},
    {x:550,y:250,team:"red"},
  ],

  ball: {
    x:450,
    y:250,
    vx:0,
    vy:0,
    owner:null,

    update() {

      // if owned → follow player
      if (this.owner) {
        this.x = this.owner.x;
        this.y = this.owner.y;
        return;
      }

      // free ball physics
      this.x += this.vx;
      this.y += this.vy;

      this.vx *= 0.96;
      this.vy *= 0.96;
    }
  }
};

// =====================
// GAME STATE
// =====================
const Game = {
  blue:0,
  red:0,

  goal(team){
    if(team==="blue") Game.blue++;
    if(team==="red") Game.red++;

    document.getElementById("blue").innerText = Game.blue;
    document.getElementById("red").innerText = Game.red;

    World.ball.x = 450;
    World.ball.y = 250;
    World.ball.vx = 0;
    World.ball.vy = 0;
    World.ball.owner = null;
  }
};

// =====================
// AI + PHYSICS
// =====================
const Physics = {

  goalLocked:false,

  update(){

    const ball = World.ball;
    ball.update();

    World.players.forEach(p => {

      const dx = ball.x - p.x;
      const dy = ball.y - p.y;
      const dist = Math.hypot(dx,dy);

      // possession capture
      if(dist < 16 && !ball.owner){
        ball.owner = p;
      }

      // TEAM BEHAVIOUR (simple positioning)

      if(p.team === "blue"){
        if(!ball.owner){
          p.x += (150 - p.x) * 0.01;
        } else {
          p.x += (ball.x - 50 - p.x) * 0.02;
        }
      }

      if(p.team === "red"){
        if(!ball.owner){
          p.x += (750 - p.x) * 0.01;
        } else {
          p.x += (ball.x + 50 - p.x) * 0.02;
        }
      }

      // PASS LOGIC (auto kick if in possession)
      if(ball.owner === p){

        if(Math.random() < 0.02){

          const target = World.players.find(t =>
            t.team === p.team && t !== p
          );

          if(target){
            ball.owner = null;

            const dx = target.x - ball.x;
            const dy = target.y - ball.y;

            ball.vx = dx * 0.08;
            ball.vy = dy * 0.08;
          }
        }
      }
    });

    // GOALS
    if(!Physics.goalLocked){

      if(ball.x > 880){
        Physics.goalLocked = true;
        Game.goal("blue");
        setTimeout(()=>Physics.goalLocked=false,400);
      }

      if(ball.x < 20){
        Physics.goalLocked = true;
        Game.goal("red");
        setTimeout(()=>Physics.goalLocked=false,400);
      }
    }
  }
};

// =====================
// RENDER
// =====================
function draw(){

  ctx.clearRect(0,0,900,500);

  // players
  World.players.forEach(p=>{
    ctx.fillStyle = p.team === "blue" ? "cyan" : "red";
    ctx.beginPath();
    ctx.arc(p.x,p.y,8,0,Math.PI*2);
    ctx.fill();
  });

  // ball
  ctx.fillStyle="white";
  ctx.beginPath();
  ctx.arc(World.ball.x,World.ball.y,6,0,Math.PI*2);
  ctx.fill();
}

// =====================
// LOOP
// =====================
let running = false;

function loop(){
  if(!running) return;

  Physics.update();
  draw();

  requestAnimationFrame(loop);
}

// =====================
// CONTROLS
// =====================
function startGame(){
  if(running) return;
  running = true;
  loop();
}

function resetGame(){
  Game.blue=0;
  Game.red=0;

  document.getElementById("blue").innerText=0;
  document.getElementById("red").innerText=0;

  World.ball.x=450;
  World.ball.y=250;
  World.ball.vx=0;
  World.ball.vy=0;
  World.ball.owner=null;
}
