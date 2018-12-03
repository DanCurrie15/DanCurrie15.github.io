// start game
document.querySelector('.start-btn').addEventListener('click', function() {
  startGame();
  hideStartButton();
  showEndButton();
});

document.querySelector('.retry-btn').addEventListener('click', function() {
  endGame();
  hideRetryButton();
  startGame();
});

document.querySelector('.end-btn').addEventListener('click', function() {
  endGame();
  if (document.querySelector('.retry-btn').hidden = true) {
    hideRetryButton();
  }
  showStartButton();
  hideEndButton();
});

function startGame() {
  player = new createPlayer();
  gameArea.start();
  document.addEventListener("mousemove", player.rotatePlayer, false);
  document.addEventListener("touchmove", player.rotatePlayer, false);
  document.addEventListener("touchstart", player.rotatePlayer, false);
  document.addEventListener("touchstart", fireBullet, false);
  document.addEventListener("mousedown", fireBullet, false);
}

function endGame() {
  document.removeEventListener("mousemove", player.rotatePlayer, false);
  document.removeEventListener("touchmove", player.rotatePlayer, false);
  document.removeEventListener("touchstart", player.rotatePlayer, false);
  document.removeEventListener("touchstart", fireBullet, false);
  document.removeEventListener("mousedown", fireBullet, false);
  gameArea.stop();
  gameArea.clear();
  gameArea.end();
  player = null;
  allBullets = [];
  allMissles = [];
  allExplosions = [];
  score = 0;

}

// game objects
let player;
let allBullets = [];
let allMissles = [];
let allExplosions = [];
let score = 0;

var gameArea = {
  start: function() {
    this.canvas = document.getElementById("canvas");
    canvas.style.visibility = "visible";
    this.context = this.canvas.getContext("2d");
    resize(this.context.canvas);
    this.interval = setInterval(updateGameArea, 20);
    this.missileInterval = setInterval(fireMissile, 1500);
  },
  stop: function() {
    clearInterval(this.interval);
    clearInterval(this.missileInterval);
    showRetryButton();
  },
  clear: function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
  score: function() {
    this.context.font = "20px Arial";
    this.context.fillStyle = "white";
    this.context.fillText("Score: " + score, 20,60);
  },
  end: function () {
    canvas.style.visibility = "hidden";
  }
}

// https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
function resize(canvas) {
  // Lookup the size the browser is displaying the canvas in CSS pixels
  // and compute a size needed to make our drawingbuffer match it in
  // device pixels.
  let displayWidth  = getDisplayWidth(canvas);
  let displayHeight = getDisplayHeight(canvas);
  // Check if the canvas is not the same size.
  if (canvas.width  !== displayWidth ||
      canvas.height !== displayHeight) {
    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
}

function getDisplayWidth(canvas) {
  let realToCSSPixels = window.devicePixelRatio;
  let displayWidth  = Math.floor(canvas.clientWidth  * realToCSSPixels);
  return displayWidth;
}

function getDisplayHeight(canvas) {
  let realToCSSPixels = window.devicePixelRatio;
  let displayHeight = Math.floor(canvas.clientHeight * realToCSSPixels);
  return displayHeight;
}

function updateGameArea() {
  gameArea.clear();
  player.render();
  gameArea.score();
  for (let m = 0; m < allMissles.length; m++) {
    allMissles[m].newPos();
    allMissles[m].update();
  }
  for (let b = 0; b < allBullets.length; b++) {
    allBullets[b].newPos();
    allBullets[b].update();
    for (let i = 0; i < allMissles.length; i++) {
      if (allBullets[b].collision(allMissles[i])) {
        // add explosion
        explode(allBullets[b].x, allBullets[b].y);
        // remove bullet and missile
        allMissles.splice(i,1);
        allBullets.splice(b,1);
        // add 1 to Score
        score++;
      }
    }
  }
  for (let x = 0; x < allExplosions.length; x++) {
    allExplosions[x].update();
    allExplosions[x].index++;
    if (allExplosions[x].index > 1) {
      allExplosions[x].active = false;
    }
  }
  allExplosions = allExplosions.filter(function(explosion) {
    return explosion.active;
  });
}

// add player

function createPlayer() {
  let canvas = document.getElementById('canvas');
  let ctx = document.getElementById('canvas').getContext('2d');
  playerImage = new Image();
  playerImage.src = 'img/game/towerDefense_tile249.png';
  this.width = 75;
  this.height = 75;
  this.angle = 0;
  this.render = function() {
    ctx.save();
    this.x = canvas.width * 0.5;
    this.y = canvas.height - this.height/2;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(playerImage, -(this.width/2), -(this.height/2), this.width, this.height);
    ctx.restore();
  }
  this.rotatePlayer = function(e) {
    let pointerEvent = e;
    //let rect = canvas.getBoundingClientRect();
    if (e.targetTouches && e.targetTouches[0]) {
      e.preventDefault();
      pointerEvent = e.targetTouches[0];
      mouseX = pointerEvent.pageX;// - rect.left;
      mouseY = pointerEvent.pageY;// - rect.top;
    } else {
      mouseX = e.clientX;// - rect.left;
      mouseY = e.clientY;// - rect.top;
    }
    let imageX = canvas.width * 0.5;
    let imageY = canvas.height - 37.5;
    player.angle = (Math.atan2(mouseY - imageY, mouseX - imageX)) + Math.PI/2;
  }
}

// fire bullet

function fireBullet() {
  allBullets.push(new bullet());
}

function bullet() {
  let canvas = document.getElementById('canvas');
  let ctx = document.getElementById('canvas').getContext('2d');
  bulletImage = new Image();
  bulletImage.src = 'img/game/towerDefense_tile272.png';
  this.speed = 15;
  this.lifespan = 2000;
  this.angle = player.angle;
  this.width = 75;
  this.height = 75;
  this.collisionWidth = 13;
  this.collisionHeight = 13;
  this.x = canvas.width * 0.5;
  this.y = canvas.height - this.height/2;
  this.update = function() {
    ctx = gameArea.context;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(bulletImage, -(this.width/2), -(this.height/2), this.width, this.height);
    ctx.restore();
  }
  this.newPos = function() {
    this.x += this.speed * Math.sin(this.angle);
    this.y -= this.speed * Math.cos(this.angle);
  }
  this.collision = function(otherobj) {
    let myleft = this.x;
    let myright = this.x + (this.collisionWidth);
    let mytop = this.y;
    let mybottom = this.y + (this.collisionHeight);
    let otherleft = otherobj.x;
    let otherright = otherobj.x + (otherobj.collisionWidth);
    let othertop = otherobj.y;
    let otherbottom = otherobj.y + (otherobj.collisionHeight);
    let crash = true;
    if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
        crash = false;
    }
    return crash;
  }
}

// fire missiles

function fireMissile() {
  allMissles.push(new missile());
}

function missile() {
  let canvas = document.getElementById('canvas');
  let ctx = document.getElementById('canvas').getContext('2d');
  missleImage = new Image();
  missleImage.src = 'img/game/towerDefense_tile251.png';
  this.speed = 2;
  this.width = 75;
  this.height = 75;
  this.collisionWidth = 12;
  this.collisionHeight = 35;
  this.x = canvas.width * Math.random();
  this.y = 0;

  this.update = function() {
    ctx = gameArea.context;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.drawImage(missleImage, -(this.width/2), -(this.height/2), this.width, this.height);
    ctx.restore();
  }
  this.newPos = function() {
    this.y += this.speed;
    if (this.y > canvas.height) {
      explode(this.x, this.y);
      setTimeout(function() {
        gameArea.stop();
      }, 30);
    }
  }
}

// add explosion

function explode(x,y) {
  allExplosions.push(new explosion(x,y));
}

function explosion(x,y) {
  let canvas = document.getElementById('canvas');
  let ctx = document.getElementById('canvas').getContext('2d');
  explosionImage1 = new Image();
  explosionImage1.src = 'img/game/tank_explosion2.png';
  explosionImage2 = new Image();
  explosionImage2.src = 'img/game/tank_explosion3.png';
  explosionImage3 = new Image();
  explosionImage3.src = 'img/game/tank_explosion4.png';
  let explosionImages = [explosionImage1, explosionImage2, explosionImage3];
  this.index = 0;
  this.active = true;
  this.x = x;
  this.y = y;
  this.width = 75;
  this.height = 75;

  this.update = function() {
    ctx = gameArea.context;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.drawImage(explosionImages[this.index], -(this.width/2), -(this.height/2), this.width, this.height);
    ctx.restore();
  }
}

// move game start buttom in and out of view

function hideStartButton() {
  let elem = document.querySelector('.start-btn');
  let pos = 0;
  let id = setInterval(frame, 5);
  function frame() {
    if (pos == -50) {
      clearInterval(id);
      elem.hidden = true;
    } else {
      pos--;
      elem.style.bottom = pos + 'px';
    }
  }
}

function showStartButton() {
  let elem = document.querySelector('.start-btn');
  let pos = -50;
  let id = setInterval(frame, 5);
  elem.hidden = false;
  function frame() {
    if (pos == 0) {
      clearInterval(id);
    } else {
      pos++;
      elem.style.bottom = pos + 'px';
    }
  }
}

// move retry buttom in and out of view

function hideRetryButton() {
  let elem = document.querySelector('.retry-btn');
  let pos = 0;
  let id = setInterval(frame, 5);
  function frame() {
    if (pos == -50) {
      clearInterval(id);
      elem.hidden = true;
    } else {
      pos--;
      elem.style.bottom = pos + 'px';
    }
  }
}

function showRetryButton() {
  let elem = document.querySelector('.retry-btn');
  let pos = -50;
  let id = setInterval(frame, 5);
  elem.hidden = false;
  function frame() {
    if (pos == 0) {
      clearInterval(id);
    } else {
      pos++;
      elem.style.bottom = pos + 'px';
    }
  }
}

// move game end buttom in and out of view

function hideEndButton() {
  let elem = document.querySelector('.end-btn');
  let pos = 0;
  let id = setInterval(frame, 5);
  function frame() {
    if (pos == -50) {
      clearInterval(id);
      elem.hidden = true;
    } else {
      pos--;
      elem.style.top = pos + 'px';
    }
  }
}

function showEndButton() {
  let elem = document.querySelector('.end-btn');
  let pos = -50;
  let id = setInterval(frame, 5);
  elem.hidden = false;
  function frame() {
    if (pos == 0) {
      clearInterval(id);
    } else {
      pos++;
      elem.style.top = pos + 'px';
    }
  }
}
