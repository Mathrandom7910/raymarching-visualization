var canvas = document.getElementById("gameCanvas"),
  ctx = canvas.getContext("2d");

const lineWidth = 2;

var deltaTime = 0,
  renTime = Date.now();

var keysPressed = {};

const speed = 2;

const gameObjCount = 20;

function render() {
  deltaTime = (Date.now() - renTime) / 10;
  renTime = Date.now();

  if (keysPressed.w) {
    game.player.y -= speed * deltaTime;
  }
  if (keysPressed.a) {
    game.player.x -= speed * deltaTime;
  }
  if (keysPressed.s) {
    game.player.y += speed * deltaTime;
  }
  if (keysPressed.d) {
    game.player.x += speed * deltaTime;
  }
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";

  ctx.strokeStyle = "rgb(255,0,0)";
  for (let i of game.objects) {
    i.draw();
  }
  ctx.strokeStyle = "rgb(150,150,201)";

  const mDir = getDir(game.player, mouse),
    pos = calcVec(game.player, mDir, getDist(game.player, mouse));

  /*ctx.beginPath();
  ctx.moveTo(game.player.x, game.player.y);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  */

  var nearestDist = game.getNearestDist(game.player),
    calcTo = calcVec(game.player, mDir, nearestDist);

  ctx.beginPath();
  game.circle(game.player, nearestDist);
  ctx.stroke();

  while (
    nearestDist > 0.1 &&
    calcTo.y > 0 &&
    calcTo.y < window.innerHeight &&
    calcTo.x > 0 &&
    calcTo.x < window.innerWidth
  ) {
    nearestDist = game.getNearestDist(calcTo);
    game.circle(calcTo, nearestDist);

    ctx.strokeStyle = "rgb(255,255,255)";
    game.circle(calcTo, Math.min(nearestDist - 3, 5));
    ctx.strokeStyle = "rgb(150,150,201)";
    calcTo = calcVec(calcTo, mDir, nearestDist);
  }

  window.requestAnimationFrame(render);
}

(window.onresize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
})();

class Pos {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  offset(pos) {
    return new Pos(pos.x + this.x, pos.y + this.y);
  }

  offsetx(amt) {
    return this.offset(new Pos(amt, 0));
  }
}

var mouse = new Pos(0, 0);

canvas.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

document.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keysPressed[e.key] = false;
});

class Sphere extends Pos {
  constructor(x, y, radius) {
    super(x, y);
    this.radius = radius;
  }

  draw() {
    game.circle(this);
  }
}

class Game {
  constructor() {
    this.player = new Pos(100, 100);
    this.objects = [];

    for (let i = 0; i < gameObjCount; i++) {
      this.objects.push(
        new Sphere(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight,
          Math.random() * 100
        )
      );
    }
  }

  getNearestDist(pos) {
    var tmp = [];

    for (let i of this.objects) {
      tmp.push(getDist(pos, i) - i.radius);
    }
    return Math.min(...tmp) - lineWidth;
  }

  circle(pos, rad) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, Math.max(pos.radius || rad, 0), 0, 2 * Math.PI);
    ctx.stroke();
  }
}

var game = new Game();

function getDist(pos1, pos2) {
  return Math.hypot(pos1.x - pos2.x, pos1.y - pos2.y);
}

function getDir(pos1, pos2) {
  return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
}

function calcVec(pos, d, s) {
  let ex = Math.cos(d) * s + pos.x;
  let ey = Math.sin(d) * s + pos.y;
  return new Pos(ex, ey);
}

window.requestAnimationFrame(render);
