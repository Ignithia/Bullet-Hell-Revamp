import { Game } from "./js/game.js";

let game;
let assets = {};

function preload() {
  // Load player sprite
  assets.playerSprite = loadImage("./assets/sprites/player/player.gif");

  // Load enemy sprites
  assets.defaultEnemySprite = loadImage("./assets/sprites/enemies/enemy.gif");
  assets.fastEnemySprite = loadImage("./assets/sprites/enemies/fast.gif");
  assets.tankEnemySprite = loadImage("./assets/sprites/enemies/tank.gif");
  assets.bomberEnemySprite = loadImage("./assets/sprites/enemies/bomber.png");
  assets.laserDroneEnemySprite = loadImage(
    "./assets/sprites/enemies/laserdrone.gif"
  );

  // Load projectile sprites
  assets.bulletSprite = loadImage("./assets/sprites/projectiles/bullet.png");
  assets.enemyBulletSprite = loadImage(
    "./assets/sprites/projectiles/enemybullet.png"
  );
  assets.bomberBulletSprite = loadImage(
    "./assets/sprites/projectiles/bomb.png"
  );

  // Load power-up sprites
  assets.tripleshotSprite = loadImage("./assets/sprites/powerups/triple.png");
  assets.invincibilitySprite = loadImage(
    "./assets/sprites/powerups/invincibility.png"
  );
  assets.smartBombSprite = loadImage("./assets/sprites/powerups/bomb.gif");
  assets.speedBoostSprite = loadImage(
    "./assets/sprites/powerups/speedboost.png"
  );
  assets.recoverySprite = loadImage(
    "./assets/sprites/powerups/Heal-Repair.png"
  );

  // Load boss sprites
  assets.ancientBossSprite = loadImage(
    "./assets/sprites/bosses/ancientboss.gif"
  );
  assets.crimsonwingSprite = loadImage(
    "./assets/sprites/bosses/crimsonwing.gif"
  );
  assets.azureSprite = loadImage("./assets/sprites/bosses/azure.gif");
  assets.celestialguardianSprite = loadImage(
    "./assets/sprites/bosses/celestialguardian.gif"
  );
  assets.voidweaverSprite = loadImage("./assets/sprites/bosses/voidweaver.gif");
  assets.cosmicserpentheadSprite = loadImage(
    "./assets/sprites/bosses/cosmicserpent/cosmicserpent-head.gif"
  );
  assets.cosmicserpentbodySprite = loadImage(
    "./assets/sprites/bosses/cosmicserpent/cosmicserpent-body.gif"
  );
  assets.cosmicserpenttailSprite = loadImage(
    "./assets/sprites/bosses/cosmicserpent/cosmicserpent-tail.gif"
  );
  // Load background images
  assets.backgroundLayer1 = loadImage(
    "./assets/background/Space-Background-1.png"
  );
  assets.backgroundLayer2 = loadImage(
    "./assets/background/Space-Background-1.png"
  );
  assets.startScreenBackground = loadImage(
    "./assets/background/Space-Background-3.png"
  );
  assets.gameOverBackground = loadImage(
    "./assets/background/Space-Background-4.png"
  );
}

function setup() {
  createCanvas(800, 600);
  frameRate(60);
  game = new Game(assets);
  game.setup();
}

function draw() {
  game.draw();
}

function keyPressed() {
  game.keyPressed(keyCode);
}

window.preload = preload;
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
