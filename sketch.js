let player;
let monster; 
let playerImgs = [];
let monsterImgs = [];
let gameState = "MENU";
let coins = 0;

function preload() {
  for (let i = 0; i <= 9; i++) {
    playerImgs[i] = loadImage('player.png');
  }
  for (let i = 0; i <= 1; i++) {
    monsterImgs[i] = loadImage('monster.png');
  }
}

function setup() {
  createCanvas(1000, 800);
  player = new Player();
  monster = new Monster();
}

function draw() {
  background(135, 206, 235);
  fill(245, 222, 179);
  rect(0, height * 0.8, width, height * 0.2); // Ground

  if (gameState === "MENU") {
    fill(255);
    textSize(40);
    textAlign(CENTER);
    text("beat the starfish", width / 2, height / 2 - 40);
    textSize(20);
    text("Press ENTER to Start", width / 2, height / 2 + 20);
  } else if (gameState === "PLAYING") {
    player.update();
    monster.update();
    player.display();
    monster.display();
    checkFight();
    displayHUD();

    if (player.HP <= 0) {
      gameState = "DEAD";
    }
    if (monster.HP <= 0) {
      coins += 10;
      monster = new Monster();
    }

  } else if (gameState === "DEAD") {
    fill(255, 0, 0);
    textSize(40);
    textAlign(CENTER);
    text("You Died!", width / 2, height / 2 - 40);
    textSize(20);
    text("Press R to Restart", width / 2, height / 2 + 20);
  } else if (gameState === "UPGRADE") {
    showUpgradeMenu();
  }
}

function displayHUD() {
  fill(255);
  textSize(16);
  text(`HP: ${player.HP}/${player.MAX_HP}`, 10, 25);
  text(`Coins: ${coins}`, width - 100, 25);
  text(`Press U to Upgrade`, width - 140, 50);
}

function keyPressed() {
  if (gameState === "MENU" && keyCode === ENTER) {
    gameState = "PLAYING";
  } else if (gameState === "DEAD" && key === 'R') {
    restartGame();
  } else if (gameState === "UPGRADE") {
    if (key === '1' && coins >= 20) {
      player.MAX_HP += 20;
      player.HP = player.MAX_HP;
      coins -= 20;
    } else if (key === '2' && coins >= 15) {
      player.attackPower += 5;
      coins -= 15;
    } else if (key === 'B') {
      gameState = "PLAYING";
    }
  } else if (gameState === "PLAYING") {
    if (key === 'A') player.moveLeft = true;
    if (key === 'D') player.moveRight = true;
    if (key === ' ') player.jump();
    if (key === 'F') player.attack();
    if (key === 'U') gameState = "UPGRADE";
  }
}

function keyReleased() {
  if (key === 'A') player.moveLeft = false;
  if (key === 'D') player.moveRight = false;
}

function restartGame() {
  player = new Player();
  monster = new Monster();
  gameState = "PLAYING";
}

function showUpgradeMenu() {
  fill(255);
  textSize(32);
  textAlign(CENTER);
  text("UPGRADE MENU", width / 2, 100);
  textSize(24);
  text("1 - Increase Max HP (+20) [Cost: 20 Coins]", width / 2, 180);
  text("2 - Increase Attack (+5) [Cost: 15 Coins]", width / 2, 230);
  text("Coins: " + coins, width / 2, 300);
  text("Press B to go back", width / 2, 350);
}

// ==== Classes ====

class Player {
  constructor() {
    this.x = 30;
    this.y = 550;
    this.w = 50;
    this.h = 80;
    this.ySpeed = 0;
    this.onGround = true;
    this.picIndex = 0;
    this.left = false;
    this.HP = this.MAX_HP = 100;
    this.attackPower = 10;
    this.moveLeft = false;
    this.moveRight = false;
    this.attacking = false;
  }

  update() {
    if (this.moveLeft) {
      this.x -= 5;
      this.left = true;
      this.picIndex = 4;
    } else if (this.moveRight) {
      this.x += 5;
      this.left = false;
      this.picIndex = 2;
    } else {
      this.picIndex = this.left ? 1 : 0;
    }

    this.y += this.ySpeed;
    this.ySpeed += 1;
    if (this.y >= 550) {
      this.y = 550;
      this.ySpeed = 0;
      this.onGround = true;
    }
  }

  jump() {
    if (this.onGround) {
      this.ySpeed = -18;
      this.onGround = false;
    }
  }

  attack() {
    this.attacking = true;
    this.picIndex = this.left ? 7 : 6;
    setTimeout(() => this.attacking = false, 300);
  }

  display() {
    image(playerImgs[this.picIndex], this.x, this.y, this.w, this.h);
    fill(255, 0, 0);
    rect(10, 10, 100, 10);
    fill(0, 255, 0);
    rect(10, 10, 100 * (this.HP / this.MAX_HP), 10);
  }
}

class Monster {
  constructor() {
    this.x = 700;
    this.y = 550;
    this.w = 50;
    this.h = 80;
    this.HP = this.MAX_HP = 30;
    this.attackPower = 5;
    this.picIndex = 1;
    this.dir = -1;
  }

  update() {
    this.x += this.dir * 2;
    if (this.x < 0 || this.x > width - this.w) this.dir *= -1;

    if (dist(this.x, this.y, player.x, player.y) < 60 && frameCount % 60 === 0) {
      player.HP -= this.attackPower;
    }
  }

  display() {
    image(monsterImgs[this.picIndex], this.x, this.y, this.w, this.h);
    fill(255, 0, 0);
    rect(this.x, this.y - 10, this.w, 5);
    fill(0, 255, 0);
    rect(this.x, this.y - 10, this.w * (this.HP / this.MAX_HP), 5);
  }

  receiveAttack(damage) {
    this.HP -= damage;
    if (this.HP < 0) this.HP = 0;
  }
}

function checkFight() {
  if (player.attacking) {
    let distX = abs(player.x - monster.x);
    if (distX < 100) {
      monster.receiveAttack(player.attackPower);
    }
  }
}