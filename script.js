const canvas = document.getElementById("game");

const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const speedEl = document.getElementById("speed");


let best =
  Number(
    localStorage.getItem("motinhaBest") || 0
  );

bestEl.textContent = best;


const keys = {};

let running = false;

let paused = false;

let gameOver = false;

let score = 0;

let roadOffset = 0;

let spawnTimer = 0;

let starTimer = 0;

let last = 0;

let speed = 5;


let player = {

  x: 350,

  y: 365,

  w: 48,

  h: 76,

  vx: 0

};


let obstacles = [];

let stars = [];

let particles = [];



/* TECLADO */

document.addEventListener("keydown", e => {

  keys[e.key.toLowerCase()] = true;


  if (
    [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      " "
    ].includes(e.key)
  ) {

    e.preventDefault();

  }


  if (e.key === " " && !running) {

    startGame();

  }

});


document.addEventListener("keyup", e => {

  keys[e.key.toLowerCase()] = false;

});



/* BOTÕES MOBILE */

document
  .querySelectorAll(".mobile-controls button")
  .forEach(btn => {

    const key = btn.dataset.key;


    btn.addEventListener(
      "pointerdown",
      () => keys[key] = true
    );


    btn.addEventListener(
      "pointerup",
      () => keys[key] = false
    );


    btn.addEventListener(
      "pointerleave",
      () => keys[key] = false
    );

  });



/* BOTÕES */

document
  .getElementById("startBtn")
  .onclick = startGame;


document
  .getElementById("restartBtn")
  .onclick = startGame;


document
  .getElementById("pauseBtn")
  .onclick = () => {

    if (running) {

      paused = !paused;

      document
        .getElementById("pauseBtn")
        .textContent =
        paused
          ? "▶ CONTINUAR"
          : "Ⅱ PAUSAR";

    }

  };



/* INICIAR */

function startGame() {

  score = 0;

  speed = 5;

  roadOffset = 0;

  spawnTimer = 0;

  starTimer = 0;


  obstacles = [];

  stars = [];

  particles = [];


  gameOver = false;

  paused = false;

  running = true;


  player = {

    x: 356,

    y: 365,

    w: 48,

    h: 76,

    vx: 0

  };


  scoreEl.textContent = 0;

  speedEl.textContent = "1.0x";


  document
    .getElementById("pauseBtn")
    .textContent = "Ⅱ PAUSAR";

}



/* RESPONSIVIDADE DO CANVAS */

function resize() {

  const ratio = 760 / 460;

  canvas.height =
    Math.round(
      canvas.clientWidth / ratio
    );

}


window.addEventListener(
  "resize",
  resize
);

resize();



function rand(a, b) {

  return Math.random() *
    (b - a) + a;

}



function rectHit(a, b) {

  return (

    a.x + 8 < b.x + b.w - 7 &&

    a.x + a.w - 8 >
      b.x + 7 &&

    a.y + 9 <
      b.y + b.h - 6 &&

    a.y + a.h - 7 >
      b.y + 6

  );

}



/* CRIAR OBSTÁCULO */

function spawnObstacle() {

  const lanes = [
    240,
    335,
    430,
    525
  ];


  const lane =
    lanes[
      Math.floor(
        Math.random() *
        lanes.length
      )
    ];


  const type =
    Math.random() < .5
      ? "car"
      : "cone";


  obstacles.push({

    x: lane,

    y: -90,

    w:
      type === "car"
        ? 52
        : 38,

    h:
      type === "car"
        ? 82
        : 54,

    type

  });

}



/* CRIAR ESTRELA */

function spawnStar() {

  const lanes = [
    250,
    345,
    440,
    535
  ];


  stars.push({

    x:
      lanes[
        Math.floor(
          Math.random() *
          lanes.length
        )
      ],

    y: -30,

    r: 9,

    spin: 0

  });

}



/* ATUALIZAR JOGO */

function update(dt) {

  if (!running || paused)
    return;


  const scale =
    dt / 16.67;


  speed =
    Math.min(
      11,
      5 + score / 120
    );


  roadOffset =
    (
      roadOffset +
      speed * scale
    ) % 80;


  spawnTimer += dt;

  starTimer += dt;


  if (
    spawnTimer >
    Math.max(
      430,
      900 - score * 2
    )
  ) {

    spawnObstacle();

    spawnTimer = 0;

  }


  if (starTimer > 900) {

    spawnStar();

    starTimer = 0;

  }



  /* MOVIMENTO */

  let move = 0;


  if (
    keys["arrowleft"] ||
    keys["a"]
  ) {

    move = -1;

  }


  if (
    keys["arrowright"] ||
    keys["d"]
  ) {

    move = 1;

  }


  player.vx +=
    (
      move * 1.5 -
      player.vx
    ) *
    .18 *
    scale;


  player.x +=
    player.vx *
    5 *
    scale;


  if (
    keys["arrowup"] ||
    keys["w"]
  ) {

    player.y -=
      2.8 * scale;

  }


  if (
    keys["arrowdown"] ||
    keys["s"]
  ) {

    player.y +=
      2.8 * scale;

  }


  player.x =
    Math.max(
      215,
      Math.min(
        545,
        player.x
      )
    );


  player.y =
    Math.max(
      285,
      Math.min(
        365,
        player.y
      )
    );



  /* OBSTÁCULOS */

  obstacles.forEach(o => {

    o.y +=
      speed * scale;

  });


  stars.forEach(s => {

    s.y +=
      speed * scale;

    s.spin +=
      .08 * scale;

  });


  obstacles =
    obstacles.filter(
      o => o.y < 500
    );


  stars =
    stars.filter(
      s => s.y < 500
    );



  /* COLISÃO */

  for (const o of obstacles) {

    if (
      rectHit(
        player,
        o
      )
    ) {

      endGame();

      return;

    }

  }



  /* ESTRELAS */

  for (
    let i = stars.length - 1;
    i >= 0;
    i--
  ) {

    const s = stars[i];


    const dx =
      player.x +
      player.w / 2 -
      s.x;


    const dy =
      player.y +
      player.h / 2 -
      s.y;


    if (
      Math.hypot(
        dx,
        dy
      ) < 28
    ) {

      score += 20;

      burst(
        s.x,
        s.y
      );


      stars.splice(
        i,
        1
      );

    }

  }



  score +=
    dt * .012;


  scoreEl.textContent =
    Math.floor(score);


  speedEl.textContent =
    (
      speed / 5
    ).toFixed(1) + "x";



  if (
    Math.floor(score) >
    best
  ) {

    best =
      Math.floor(score);


    bestEl.textContent =
      best;


    localStorage.setItem(
      "motinhaBest",
      best
    );

  }



  /* PARTÍCULAS */

  particles.forEach(p => {

    p.x +=
      p.vx * scale;

    p.y +=
      p.vy * scale;

    p.life -=
      .03 * scale;

  });


  particles =
    particles.filter(
      p => p.life > 0
    );

}



/* FINALIZAR */

function endGame() {

  running = false;

  gameOver = true;

  burst(
    player.x + 24,
    player.y + 35
  );

}



/* PARTÍCULAS */

function burst(x, y) {

  for (
    let i = 0;
    i < 14;
    i++
  ) {

    particles.push({

      x,

      y,

      vx: rand(-3, 3),

      vy: rand(-3, 3),

      life: 1

    });

  }

}



/* PISTA */

function drawRoad() {

  ctx.fillStyle =
    "#080b14";

  ctx.fillRect(
    0,
    0,
    760,
    460
  );


  /* CIDADE */

  for (
    let x = 0;
    x < 760;
    x += 55
  ) {

    ctx.fillStyle =
      x % 110
        ? "#0c1120"
        : "#10162a";


    ctx.fillRect(
      x,
      40 + (x % 4) * 8,
      42,
      130
    );

  }



  /* ASFALTO */

  ctx.fillStyle =
    "#171a24";

  ctx.fillRect(
    190,
    0,
    380,
    460
  );


  ctx.fillStyle =
    "#0f121b";

  ctx.fillRect(
    205,
    0,
    350,
    460
  );



  /* BORDAS */

  ctx.fillStyle =
    "#ff2d75";

  ctx.fillRect(
    190,
    0,
    4,
    460
  );

  ctx.fillRect(
    566,
    0,
    4,
    460
  );


  ctx.fillStyle =
    "#29e6ff";

  ctx.fillRect(
    200,
    0,
    2,
    460
  );

  ctx.fillRect(
    558,
    0,
    2,
    460
  );



  /* FAIXAS */

  ctx.fillStyle =
    "rgba(255,255,255,.65)";


  for (
    let x of [
      282,
      377,
      472
    ]
  ) {

    for (
      let y = -80;
      y < 460;
      y += 80
    ) {

      ctx.fillRect(
        x,
        y + roadOffset,
        3,
        42
      );

    }

  }



  /* LUZES */

  for (
    let y = -40;
    y < 460;
    y += 70
  ) {

    ctx.fillStyle =
      "#ff2d75";

    ctx.fillRect(
      180,
      y + roadOffset,
      4,
      18
    );


    ctx.fillStyle =
      "#29e6ff";

    ctx.fillRect(
      576,
      y + roadOffset,
      4,
      18
    );

  }

}



/* MOTINHA */

function drawBike() {

  const x = player.x;

  const y = player.y;


  ctx.save();


  ctx.translate(
    x + 24,
    y + 38
  );


  ctx.shadowBlur = 20;

  ctx.shadowColor =
    "#ff2d75";



  /* RODA */

  ctx.fillStyle =
    "#05060b";


  ctx.beginPath();

  ctx.ellipse(
    0,
    -25,
    9,
    22,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();



  ctx.beginPath();

  ctx.ellipse(
    0,
    25,
    10,
    22,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();



  /* AROS */

  ctx.strokeStyle =
    "#8790a8";

  ctx.lineWidth = 3;


  ctx.beginPath();

  ctx.ellipse(
    0,
    -25,
    5,
    17,
    0,
    0,
    Math.PI * 2
  );

  ctx.stroke();


  ctx.beginPath();

  ctx.ellipse(
    0,
    25,
    6,
    17,
    0,
    0,
    Math.PI * 2
  );

  ctx.stroke();



  /* CORPO */

  ctx.fillStyle =
    "#ff2d75";


  ctx.beginPath();

  ctx.roundRect(
    -13,
    -28,
    26,
    55,
    9
  );

  ctx.fill();



  /* VIDRO */

  ctx.fillStyle =
    "#29e6ff";


  ctx.beginPath();

  ctx.roundRect(
    -9,
    -17,
    18,
    18,
    6
  );

  ctx.fill();



  /* FAROL */

  ctx.fillStyle =
    "#f5f7ff";


  ctx.beginPath();

  ctx.roundRect(
    -5,
    -12,
    10,
    9,
    3
  );

  ctx.fill();



  /* GUIDÃO */

  ctx.strokeStyle =
    "#29e6ff";

  ctx.lineWidth = 3;


  ctx.beginPath();

  ctx.moveTo(
    -15,
    -25
  );

  ctx.lineTo(
    -22,
    -35
  );

  ctx.lineTo(
    -4,
    -36
  );

  ctx.stroke();


  ctx.restore();

}



/* OBSTÁCULOS */

function drawObstacle(o) {

  ctx.save();


  ctx.translate(
    o.x + o.w / 2,
    o.y + o.h / 2
  );


  ctx.shadowBlur = 12;

  ctx.shadowColor =
    "#ff305d";



  if (
    o.type === "car"
  ) {

    ctx.fillStyle =
      "#d92555";


    ctx.beginPath();

    ctx.roundRect(
      -26,
      -41,
      52,
      82,
      10
    );

    ctx.fill();



    ctx.fillStyle =
      "#29e6ff";


    ctx.fillRect(
      -17,
      -27,
      34,
      18
    );


    ctx.fillRect(
      -17,
      9,
      34,
      12
    );


    ctx.fillStyle =
      "#fff";


    ctx.fillRect(
      -20,
      -38,
      9,
      5
    );


    ctx.fillRect(
      11,
      -38,
      9,
      5
    );

  }

  else {

    /* CONE */

    ctx.fillStyle =
      "#ff9d2e";


    ctx.beginPath();

    ctx.moveTo(
      0,
      -27
    );

    ctx.lineTo(
      20,
      27
    );

    ctx.lineTo(
      -20,
      27
    );

    ctx.closePath();

    ctx.fill();


    ctx.fillStyle =
      "#fff";


    ctx.fillRect(
      -12,
      4,
      24,
      5
    );

  }


  ctx.restore();

}



/* ESTRELA */

function drawStar(s) {

  ctx.save();


  ctx.translate(
    s.x,
    s.y
  );


  ctx.rotate(
    s.spin
  );


  ctx.shadowBlur = 15;

  ctx.shadowColor =
    "#ffd84a";


  ctx.fillStyle =
    "#ffd84a";


  ctx.beginPath();


  for (
    let i = 0;
    i < 10;
    i++
  ) {

    let r =
      i % 2
        ? 4
        : 10;


    let a =
      -Math.PI / 2 +
      i * Math.PI / 5;


    ctx.lineTo(
      Math.cos(a) * r,
      Math.sin(a) * r
    );

  }


  ctx.closePath();

  ctx.fill();


  ctx.restore();

}



/* PARTÍCULAS */

function drawParticles() {

  particles.forEach(p => {

    ctx.globalAlpha =
      p.life;

    ctx.fillStyle =
      "#ff2d75";


    ctx.fillRect(
      p.x,
      p.y,
      4,
      4
    );

  });


  ctx.globalAlpha = 1;

}



/* DESENHAR */

function draw() {

  drawRoad();


  stars.forEach(
    drawStar
  );


  obstacles.forEach(
    drawObstacle
  );


  drawBike();


  drawParticles();



  /* TELA INICIAL */

  if (!running) {

    ctx.fillStyle =
      "rgba(5,7,14,.72)";


    ctx.fillRect(
      0,
      0,
      760,
      460
    );


    ctx.textAlign =
      "center";


    ctx.fillStyle =
      "#fff";


    ctx.font =
      "900 34px Orbitron";


    ctx.fillText(
      gameOver
        ? "FIM DE JOGO"
        : "MOTINHA RUSH",
      380,
      195
    );


    ctx.font =
      "500 13px Poppins";


    ctx.fillStyle =
      "#aeb3c8";


    ctx.fillText(

      gameOver

        ? `Pontuação: ${Math.floor(score)} • clique em REINICIAR`

        : "Clique em COMEÇAR para pilotar",

      380,
      225

    );

  }



  /* PAUSADO */

  else if (paused) {

    ctx.fillStyle =
      "rgba(5,7,14,.55)";


    ctx.fillRect(
      0,
      0,
      760,
      460
    );


    ctx.textAlign =
      "center";


    ctx.fillStyle =
      "#fff";


    ctx.font =
      "900 30px Orbitron";


    ctx.fillText(
      "PAUSADO",
      380,
      220
    );

  }

}



/* LOOP */

function loop(t) {

  let dt =
    Math.min(
      40,
      t - last || 16
    );


  last = t;


  update(dt);

  draw();


  requestAnimationFrame(
    loop
  );

}


requestAnimationFrame(
  loop
);