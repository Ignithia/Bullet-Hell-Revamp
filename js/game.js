import { Player } from "./player.js";
import {
  Enemy,
  NormalEnemy,
  FastEnemy,
  Bomber,
  LaserDrone,
  TankShieldedEnemy,
} from "./enemy.js";
import { Boss, BlackHole } from "./boss.js";
import { Bullet } from "./bullet.js";
import { PowerUp } from "./powerup.js";
import { drawBackground, drawText } from "./utils.js";
import { PlayerProgress } from "./PlayerProgress.js";
import { HighscoreSystem } from "./HighscoreSystem.js";
import { MovementAbilities } from "./MovementAbilities.js";
import { ShopShip } from "./ShopShip.js";
import { upgradeTree } from "./upgradeTree.js";
import {
  PowerUpTypes,
  PowerUpRarities,
  getRandomPowerUp,
} from "./PowerUpTypes.js";
import {
  BossUpgrades,
  getBossUpgradeChoices,
  applyBossUpgrade,
} from "./BossUpgrades.js";
import { spawnWave } from "./enemyWaveSpawner.js";

const upgrades = [
  "Speed Up",
  "Extra Health",
  "Faster Fire Rate",
  "Smaller Size",
  "Bigger Bullets",
  "Damage Up",
];

let lastKillTime = 0;
let killStreak = 0;
let scoreMultiplier = 1;

export class Game {
  constructor(assets) {
    this.state = "start";
    this.assets = assets;
    this.playerSpeed = 300;
    this.playerFireRate = 300;
    this.playerHealth = 10;
    this.maxPlayerHealth = 10;
    this.player = new Player(assets, this.playerSpeed);
    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.powerUps = [];
    this.score = 0;
    this.level = 0;
    this.bossActive = false;
    this.lastShotTime = 0;
    this.lastEnemySpawnTime = 0;
    this.lastPowerUpSpawnTime = 0;
    this.enemySpawnInterval = 1200;
    this.powerUpSpawnInterval = 10000;
    this.deltaTime = 16.67;
    this.backgroundY1 = 600;
    this.backgroundY2 = -600;
    this.version = "2.3.0";
    this.tripleShotTimeout = null;
    this.invincibilityTimeout = null;
    this.shieldTimeout = null;
    this.speedBoostTimeout = null;
    this.player.shielded = false;
    this.player.speedBoost = false;
    this.playerProgress = new PlayerProgress();
    this.highscoreSystem = new HighscoreSystem();
    this.movementAbilities = new MovementAbilities();
    this.shopShip = null;
    this.upgradePath = { stats: {}, weapons: {} };
    this.wave = 0;
    this.waveInProgress = false;
    this.waveBannerTimer = 0;
    this.bossWaveInterval = 5;

    this.keys = {};

    this.lastFrameTime = 0;
    this.targetFrameTime = 1000 / 60;

    this.bulletPool = [];
    this.enemyBulletPool = [];
    this.maxPoolSize = 100;
    this.initializeBulletPools();
    this.waveClearedTime = null;
    this.bossesDefeated = 0;
    this.bossUpgrades = [];
    this.bossUpgradeChoices = [];
    this.awaitingBossUpgrade = false;
  }

  initializeBulletPools() {
    for (let i = 0; i < this.maxPoolSize; i++) {
      this.bulletPool.push(this.createBullet(0, 0, 0, 0, 5, null, false));
      this.enemyBulletPool.push(this.createBullet(0, 0, 0, 0, 5, null, true));
    }
  }

  createBullet(x, y, damage, speed, size, angle, isEnemy) {
    return new Bullet(x, y, damage, speed, size, angle, this.assets, isEnemy);
  }

  getBulletFromPool(isEnemy = false) {
    const pool = isEnemy ? this.enemyBulletPool : this.bulletPool;
    if (pool.length > 0) {
      return pool.pop();
    }
    return this.createBullet(0, 0, 0, 0, 5, null, isEnemy);
  }

  returnBulletToPool(bullet) {
    const pool = bullet.isEnemy ? this.enemyBulletPool : this.bulletPool;
    if (pool.length < this.maxPoolSize) {
      pool.push(bullet);
    }
  }

  setup() {
    this.player = new Player(this.assets, this.playerSpeed);
    this.playerProgress = new PlayerProgress();
    this.highscoreSystem = new HighscoreSystem();
    this.movementAbilities = new MovementAbilities();
    this.upgradePath = { stats: {}, weapons: {} };
    this.wave = 0;
    this.waveInProgress = false;
    this.waveBannerTimer = 0;
    this.level = 0;
  }

  draw() {
    const currentTime = millis();
    if (currentTime - this.lastFrameTime < this.targetFrameTime) {
      return;
    }
    this.lastFrameTime = currentTime;

    this.deltaTime = 1000 / frameRate();
    switch (this.state) {
      case "start":
        this.drawStartScreen();
        break;
      case "play":
        this.playGame();
        break;
      case "upgrade":
        this.offerUpgrade();
        break;
      case "gameOver":
        this.drawGameOverScreen();
        break;
      case "pause":
        this.drawPauseScreen();
        break;
      case "bossUpgrade":
        this.drawBossUpgradeScreen();
        break;
    }
    if (
      this.state === "play" ||
      this.state === "upgrade" ||
      this.state === "pause"
    ) {
      this.displayHUD();
    }
    if (this.shopShip && !this.shopShip.closed) {
      this.shopShip.showShopUI();
    }
    if (this.waveBannerTimer > 0) {
      this.drawWaveBanner();
    }
    if (this.bossUpgrades && this.bossUpgrades.length > 0) {
      this.drawBossUpgradesHUD();
    }
  }

  drawWaveBanner() {
    push();
    textAlign(CENTER, CENTER);
    textSize(64);
    fill(255, 220, 0, 220);
    text(`Wave ${this.wave}`, width / 2, height / 2 - 200);
    pop();
    this.waveBannerTimer -= this.deltaTime;
    if (this.waveBannerTimer < 0) this.waveBannerTimer = 0;
  }

  drawStartScreen() {
    imageMode(CORNER);
    image(this.assets.startScreenBackground, 0, 0, width, height);
    drawText(
      "Bullet Hell Game",
      width / 2,
      height / 2 - 90,
      54,
      CENTER,
      CENTER
    );
    drawText(
      "Press ENTER to Start",
      width / 2,
      height / 2 - 30,
      32,
      CENTER,
      CENTER
    );
    drawText("Controls:", width / 2, height / 2 + 30, 26, CENTER, CENTER);
    drawText(
      "Arrow Keys: Move",
      width / 2,
      height / 2 + 60,
      22,
      CENTER,
      CENTER
    );
    drawText("Space: Shoot", width / 2, height / 2 + 90, 22, CENTER, CENTER);
    drawText(
      `Version: ${this.version}`,
      width / 2,
      height - 40,
      18,
      CENTER,
      CENTER
    );
    drawText(
      `Personal Best: ${this.highscoreSystem.localBest}`,
      width / 2,
      height / 2 + 130,
      28,
      CENTER,
      CENTER
    );
    imageMode(CENTER);
  }

  drawGameOverScreen() {
    imageMode(CORNER);
    image(this.assets.gameOverBackground, 0, 0, width, height);
    drawText(
      "Game Over",
      width / 2,
      height / 2 - 80,
      54,
      CENTER,
      CENTER,
      [255, 0, 0]
    );
    drawText(
      `Score: ${this.score}`,
      width / 2,
      height / 2 - 20,
      32,
      CENTER,
      CENTER
    );
    drawText(
      "Press R to Restart",
      width / 2,
      height / 2 + 40,
      28,
      CENTER,
      CENTER
    );
    drawText(
      `Personal Best: ${this.highscoreSystem.localBest}`,
      width / 2,
      height / 2 + 90,
      28,
      CENTER,
      CENTER
    );
    imageMode(CENTER);
  }

  handlePlayerMovement() {
    const maxSpeed = this.player.speed;
    let moveX = 0;
    let moveY = 0;

    if (this.keys["ArrowLeft"] || this.keys["KeyA"]) moveX -= 1;
    if (this.keys["ArrowRight"] || this.keys["KeyD"]) moveX += 1;
    if (this.keys["ArrowUp"] || this.keys["KeyW"]) moveY -= 1;
    if (this.keys["ArrowDown"] || this.keys["KeyS"]) moveY += 1;

    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.707;
      moveY *= 0.707;
    }

    this.player.x += (moveX * maxSpeed * this.deltaTime) / 1000;
    this.player.y += (moveY * maxSpeed * this.deltaTime) / 1000;

    this.player.x = constrain(this.player.x, 0, width);
    this.player.y = constrain(this.player.y, 0, height);
  }

  playGame() {
    drawBackground(30, this.assets, this.backgroundY1, this.backgroundY2);
    this.handlePlayerMovement();
    this.player.show();
    this.handleBullets();
    this.handleEnemyBullets();
    this.handleEnemies();
    this.handlePowerUps();
    this.spawnPowerUps();
    this.displayHUD();
    this.handleScoreGain();
    this.handleLevelProgression();
    this.handleShooting();
    this.checkGameOver();
    this.handleWaveLogic();
  }

  drawPauseScreen() {
    drawBackground(30, this.assets, this.backgroundY1, this.backgroundY2);
    drawText("Paused", width / 2, height / 2, 54, CENTER, CENTER);
    drawText(
      "Press 'P' to Resume",
      width / 2,
      height / 2 + 60,
      32,
      CENTER,
      CENTER
    );
  }

  handleWaveLogic() {
    if (!this.bossActive && this.enemies.length === 0 && !this.shopShip) {
      if (this.waveClearedTime === null) {
        this.waveClearedTime = millis();
      } else if (
        millis() - this.waveClearedTime > 2000 &&
        !this.waveInProgress
      ) {
        this.wave++;
        this.waveInProgress = true;
        this.waveBannerTimer = 1800;
        if (this.wave % this.bossWaveInterval === 0) {
          this.spawnBoss(this.getBossTypeForWave(this.wave));
        } else {
          spawnWave(this, this.wave);
        }
        this.waveClearedTime = null;
      }
    } else if (
      (this.enemies.length > 0 || this.bossActive) &&
      this.waveInProgress
    ) {
      this.waveInProgress = false;
      this.waveClearedTime = null;
    }
  }

  getBossTypeForWave(wave) {
    const bossWaveNumber = Math.floor(wave / this.bossWaveInterval);
    let bossTypes;
    if (bossWaveNumber <= 2) {
      bossTypes = [
        "ancient",
        "crimsonwing",
        "azure",
        "CelestialGuardian",
        "VoidWeaver",
      ];
    } else {
      bossTypes = [
        "ancient",
        "crimsonwing",
        "azure",
        "CelestialGuardian",
        "VoidWeaver",
        "CosmicSerpent",
      ];
    }
    return bossTypes[Math.floor((bossWaveNumber - 1) % bossTypes.length)];
  }

  spawnBoss(bossType) {
    if (this.bossActive) return;
    this.bossActive = true;
    let x;
    if (bossType === "azure" || bossType === "VoidWeaver") {
      x = random(80, width - 80);
    } else {
      x = random([width / 2, 20, width - 20]);
    }
    const y = -40;
    this.enemies.push(
      new Boss(x, y, bossType, this.bossesDefeated, this.assets)
    );
  }

  spawnShopShip() {
    if (this.playerProgress.level % 3 === 0) {
      this.shopShip = new ShopShip(
        this.playerProgress.level,
        this.playerProgress,
        (upgradeObj) => this.applyShopUpgrade(upgradeObj)
      );
    }
  }

  applyShopUpgrade(upg) {
    if (upg.type === "stats") {
      if (upg.upgrade === "Speed Up") {
        this.playerSpeed += 30;
        this.player.speed = this.playerSpeed;
      } else if (upg.upgrade === "Extra Health") {
        this.playerHealth += 1;
        this.player.health = Math.min(
          this.player.health + 1,
          this.playerHealth
        );
        this.maxPlayerHealth = this.playerHealth;
      } else if (upg.upgrade === "Regeneration") {
        if (!this.player.regenInterval) {
          this.player.regenInterval = setInterval(() => {
            if (this.player.health < this.maxPlayerHealth) {
              this.player.health++;
            }
          }, 4000);
        }
      } else if (upg.upgrade === "Temporary Shield") {
        this.player.shielded = true;
        setTimeout(() => {
          this.player.shielded = false;
        }, 10000);
      }
    } else if (upg.type === "weapons") {
      if (upg.upgrade === "Bigger Bullets") {
        Bullet.setSize((Bullet.defaultSize || 5) + 3);
      } else if (upg.upgrade === "Piercing Bullets") {
        this.player.piercing = true;
      } else if (upg.upgrade === "Explosive Bullets") {
        this.player.explosive = true;
      }
    }
  }

  handlePowerUps() {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.update();
      powerUp.show();
      if (
        dist(powerUp.x, powerUp.y, this.player.x, this.player.y) <
        this.player.size / 2
      ) {
        this.applyPowerUp(powerUp.type);
        this.powerUps.splice(i, 1);
      }
    }
  }

  applyPowerUp(type) {
    switch (type) {
      case "Triple Shot":
        if (this.tripleShotTimeout) clearTimeout(this.tripleShotTimeout);
        this.player.tripleShot = true;
        this.tripleShotTimeout = setTimeout(() => {
          this.player.tripleShot = false;
          this.tripleShotTimeout = null;
        }, 5000);
        break;
      case "Invincibility":
        if (this.invincibilityTimeout) clearTimeout(this.invincibilityTimeout);
        this.player.invincible = true;
        this.invincibilityTimeout = setTimeout(() => {
          this.player.invincible = false;
          this.invincibilityTimeout = null;
        }, 5000);
        break;
      case "Recovery":
        this.player.health = Math.min(
          this.player.health + 2,
          this.maxPlayerHealth
        );
        break;
      case "Speed Boost":
        if (this.speedBoostTimeout) clearTimeout(this.speedBoostTimeout);
        this.player.speedBoost = true;
        this.player.speed = this.playerSpeed * 2;
        this.speedBoostTimeout = setTimeout(() => {
          this.player.speedBoost = false;
          this.player.speed = this.playerSpeed;
          this.speedBoostTimeout = null;
        }, 5000);
        break;
      case "Smart Bomb":
        this.enemies.forEach((enemy) => {
          this.score += enemy.scoreValue;
        });
        this.enemyBullets = this.enemyBullets.filter(
          (b) =>
            !(
              b.isExpanding &&
              b.ownerBossId &&
              b.ownerBossId.bossType === "CelestialGuardian"
            )
        );
        this.enemies = [];
        this.bossActive = false;
        this.handleLevelProgression();
        break;
      case "Slow Time":
        this.enemies.forEach((e) => (e.speed *= 0.5));
        setTimeout(() => {
          this.enemies.forEach((e) => (e.speed *= 2));
        }, 5000);
        break;
    }
  }

  spawnPowerUps() {
    if (millis() - this.lastPowerUpSpawnTime > this.powerUpSpawnInterval) {
      const x = random(20, width - 20);
      const y = -20;
      const type = getRandomPowerUp(this.level);
      this.powerUps.push(new PowerUp(x, y, type, this.assets));
      this.lastPowerUpSpawnTime = millis();
      this.powerUpSpawnInterval = min(20000, 10000 + this.level * 500);
    }
  }

  afterBossDefeat() {
    const choices = getBossUpgradeChoices(this.playerProgress.level);
  }

  checkBulletCollision(bullet, bulletIndex) {
    for (let j = this.enemies.length - 1; j >= 0; j--) {
      const enemy = this.enemies[j];

      const dx = bullet.x - enemy.x;
      const dy = bullet.y - enemy.y;
      const distanceSquared = dx * dx + dy * dy;
      const minDistanceSquared = (enemy.size / 2) * (enemy.size / 2);

      if (enemy instanceof Boss && enemy.bossType === "CosmicSerpent") {
        const hit = enemy.isSegmentHit(bullet.x, bullet.y);
        if (hit) {
          this.returnBulletToPool(this.bullets[bulletIndex]);
          this.bullets.splice(bulletIndex, 1);
          if (hit.part === "head") {
            enemy.health -= bullet.damage;
          } else if (hit.part === "segment") {
            enemy.segments[hit.idx].health -= bullet.damage;
            if (enemy.segments[hit.idx].health <= 0) {
              this.score += Math.floor(enemy.scoreValue * 0.15);
              if (random() < 0.25) {
                const seg = enemy.segments[hit.idx];
                const type = getRandomPowerUp(this.level);
                this.powerUps.push(
                  new PowerUp(seg.x, seg.y, type, this.assets)
                );
              }
              enemy.segments.splice(hit.idx, 1);
            }
          } else if (hit.part === "tail") {
            enemy.tail.health -= bullet.damage;
            if (enemy.tail.health <= 0) {
              this.score += Math.floor(enemy.scoreValue * 0.2);
              const type = getRandomPowerUp(this.level);
              this.powerUps.push(
                new PowerUp(enemy.tail.x, enemy.tail.y, type, this.assets)
              );
              enemy.tail.health = -9999;
            }
          }
          if (enemy.health <= 0) {
            this.score += enemy.scoreValue;
            if (random() < 0.5) {
              const type = getRandomPowerUp(this.level);
              this.powerUps.push(
                new PowerUp(enemy.x, enemy.y, type, this.assets)
              );
            }
            this.playerProgress.addCurrency(enemy.scoreValue);
            this.playerProgress.addExp(enemy.scoreValue);
            this.enemies.splice(j, 1);
            this.bossActive = false;
            this.bossesDefeated++;
            this.triggerBossUpgrade();
          }
          break;
        }
      } else {
        if (dist(bullet.x, bullet.y, enemy.x, enemy.y) < enemy.size / 2) {
          this.returnBulletToPool(this.bullets[bulletIndex]);
          this.bullets.splice(bulletIndex, 1);

          if (typeof enemy.takeDamage === "function") {
            enemy.takeDamage(bullet.damage);
          } else {
            enemy.health -= bullet.damage;
          }

          if (enemy.health <= 0) {
            this.score += enemy.scoreValue;
            if (
              enemy instanceof Boss &&
              enemy.bossType === "CelestialGuardian"
            ) {
              this.enemyBullets = this.enemyBullets.filter(
                (b) => !(b.isExpanding && b.ownerBossId === enemy)
              );
            }
            this.playerProgress.addCurrency(enemy.scoreValue);
            this.playerProgress.addExp(enemy.scoreValue);
            this.enemies.splice(j, 1);
            if (enemy instanceof Boss) {
              this.bossActive = false;
              this.bossesDefeated++;
              this.triggerBossUpgrade();
            }
          }
          break;
        }
      }
    }
  }

  triggerBossUpgrade() {
    this.bossUpgradeChoices = getBossUpgradeChoices(this.playerProgress.level);
    this.awaitingBossUpgrade = true;
    this.state = "bossUpgrade";
  }

  handleBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update();
      bullet.show();
      if (bullet.y < 0) {
        this.bullets.splice(i, 1);
        continue;
      }
      this.checkBulletCollision(bullet, i);
    }
  }

  handleEnemyBullets() {
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      let bullet = this.enemyBullets[i];
      if (!bullet) continue;

      if (bullet instanceof BlackHole) {
        bullet.update(this.player);
        bullet.show();
        if (bullet.expired) {
          this.enemyBullets.splice(i, 1);
        }
        continue;
      }

      bullet.update();
      bullet.show();

      if (bullet.y > height || bullet.x < 0 || bullet.x > width) {
        this.returnBulletToPool(bullet);
        this.enemyBullets.splice(i, 1);
        continue;
      }

      const dx = bullet.x - this.player.x;
      const dy = bullet.y - this.player.y;
      const distanceSquared = dx * dx + dy * dy;
      const minDistanceSquared =
        (this.player.size / 2) * (this.player.size / 2);

      if (distanceSquared < minDistanceSquared && !this.player.invincible) {
        this.player.health -= bullet.damage;
        this.returnBulletToPool(bullet);
        this.enemyBullets.splice(i, 1);
        break;
      }
    }
  }

  handleEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy instanceof Bomber) {
        enemy.update(this.enemyBullets);
      } else if (enemy instanceof LaserDrone) {
        enemy.update(this.enemyBullets, this.player);
      } else if (enemy instanceof Boss) {
        enemy.update(this.enemyBullets, this.player, this.enemies);
      } else {
        enemy.update();
      }
      enemy.show();
      if (enemy.y > height) {
        enemy.y = -enemy.size;
        enemy.x = random(enemy.size / 2, width - enemy.size / 2);
        continue;
      }
      if (
        dist(enemy.x, enemy.y, this.player.x, this.player.y) <
          this.player.size / 2 &&
        !this.player.invincible
      ) {
        this.player.health -= enemy.damage;
        this.enemies.splice(i, 1);
      }
    }
  }

  handleShooting() {
    if (
      this.keys["Space"] &&
      millis() - this.lastShotTime > this.playerFireRate
    ) {
      if (this.player.tripleShot) {
        const bullet1 = this.getBulletFromPool(false);
        const bullet2 = this.getBulletFromPool(false);
        const bullet3 = this.getBulletFromPool(false);

        Object.assign(bullet1, {
          x: this.player.x - 10,
          y: this.player.y,
          damage: this.player.damage,
          xspeed: 0,
          yspeed: -400,
          size: Bullet.defaultSize,
        });

        Object.assign(bullet2, {
          x: this.player.x,
          y: this.player.y,
          damage: this.player.damage,
          xspeed: 0,
          yspeed: -400,
          size: Bullet.defaultSize,
        });

        Object.assign(bullet3, {
          x: this.player.x + 10,
          y: this.player.y,
          damage: this.player.damage,
          xspeed: 0,
          yspeed: -400,
          size: Bullet.defaultSize,
        });

        this.bullets.push(bullet1, bullet2, bullet3);
      } else {
        const bullet = this.getBulletFromPool(false);
        Object.assign(bullet, {
          x: this.player.x,
          y: this.player.y,
          damage: this.player.damage,
          xspeed: 0,
          yspeed: -400,
          size: Bullet.defaultSize,
        });
        this.bullets.push(bullet);
      }
      this.lastShotTime = millis();
    }
  }

  displayHUD() {
    textAlign(LEFT, CENTER);
    let y = 30;
    const line = 28;
    drawText(`Score: ${this.score}`, 30, y, 22, LEFT, CENTER);
    y += line;
    drawText(`Wave: ${this.wave}`, 30, y, 22, LEFT, CENTER);
    y += line;
    drawText(`Damage: ${this.player.damage}`, 30, y, 22, LEFT, CENTER);
    y += line;
    let activePowerUps = [];
    if (this.player.tripleShot) activePowerUps.push("Triple Shot");
    if (this.player.invincible) activePowerUps.push("Invincibility");
    if (this.player.speedBoost) activePowerUps.push("Speed Boost");
    let powerUpText =
      activePowerUps.length > 0 ? activePowerUps.join(", ") : "None";
    drawText(`Power-Up: ${powerUpText}`, 30, y, 22, LEFT, CENTER);
    y += line;
    drawText(`Fire Rate: ${this.playerFireRate} ms`, 30, y, 22, LEFT, CENTER);
    y += line;
    drawText(`Speed: ${this.playerSpeed} px/s`, 30, y, 22, LEFT, CENTER);
    y += line;
    drawText(
      `Currency: $${this.playerProgress.currency}`,
      30,
      y,
      22,
      LEFT,
      CENTER
    );
    y += line;
    drawText(
      `EXP: ${this.playerProgress.exp} / ${this.playerProgress.expToNext}`,
      30,
      y,
      22,
      LEFT,
      CENTER
    );
    y += line;
    drawText(
      `Player Level: ${this.playerProgress.level}`,
      30,
      y,
      22,
      LEFT,
      CENTER
    );

    y += 18;
    fill(60);
    rect(30, y, 180, 18, 6);
    fill(0, 220, 0);
    rect(30, y, (this.player.health / this.maxPlayerHealth) * 180, 18, 6);
    stroke(255);
    noFill();
    rect(30, y, 180, 18, 6);
    noStroke();
    y += 28;
  }

  handleScoreGain() {
    if (this.wave < 50) {
      NormalEnemy.scoreValue = 30;
      TankShieldedEnemy.scoreValue = 60;
      FastEnemy.scoreValue = 15;
    } else if (this.wave < 100) {
      NormalEnemy.scoreValue = 60;
      TankShieldedEnemy.scoreValue = 120;
      FastEnemy.scoreValue = 30;
    } else if (this.wave < 150) {
      NormalEnemy.scoreValue = 120;
      TankShieldedEnemy.scoreValue = 240;
      FastEnemy.scoreValue = 60;
    } else {
      NormalEnemy.scoreValue = 240;
      TankShieldedEnemy.scoreValue = 480;
      FastEnemy.scoreValue = 120;
    }
  }

  handleLevelProgression() {
    if (this.playerProgress.leveledUp) {
      this.playerProgress.leveledUp = false;
      this.spawnShopShip();
      this.state = "upgrade";
    }
  }

  checkGameOver() {
    if (this.player.health <= 0) {
      this.highscoreSystem.setLocalBest(this.score);
      this.highscoreSystem.localBest = this.highscoreSystem.getLocalBest();
      this.state = "gameOver";
    }
  }

  offerUpgrade() {
    drawBackground(50, this.assets, this.backgroundY1, this.backgroundY2);
    drawText(
      "Choose an Upgrade:",
      width / 2,
      height / 2 - 90,
      38,
      CENTER,
      CENTER
    );
    const available = upgrades.map((upgrade, index) => {
      if (upgrade === "Speed Up" && this.playerSpeed >= 500) return false;
      if (upgrade === "Faster Fire Rate" && this.playerFireRate <= 100)
        return false;
      if (upgrade === "Smaller Size" && this.player.size <= 20) return false;
      if (upgrade === "Bigger Bullets" && Bullet.defaultSize >= 20)
        return false;
      if (upgrade === "Damage Up") {
        let damageCap = this.calculateDamageCap();
        if (this.player.damage >= damageCap) return false;
      }
      return true;
    });

    let anyAvailable = available.some(Boolean);

    upgrades.forEach((upgrade, index) => {
      let upgradeText = `${index + 1}: ${upgrade}`;
      if (!available[index]) {
        upgradeText += " (Maxed Out)";
      }
      drawText(
        upgradeText,
        width / 2,
        height / 2 - 30 + index * 40,
        32,
        CENTER,
        CENTER
      );
    });

    if (!anyAvailable) {
      drawText(
        "All upgrades maxed! Press any key to continue.",
        width / 2,
        height / 2 + 240,
        24,
        CENTER,
        CENTER
      );
    } else {
      drawText(
        "Press 1-6 to select an upgrade and continue",
        width / 2,
        height / 2 + 240,
        24,
        CENTER,
        CENTER
      );
    }
  }

  drawBossUpgradeScreen() {
    drawBackground(60, this.assets, this.backgroundY1, this.backgroundY2);
    drawText(
      "Boss Defeated! Choose a Boss Upgrade:",
      width / 2,
      height / 2 - 120,
      38,
      CENTER,
      CENTER
    );
    this.bossUpgradeChoices.forEach((upg, i) => {
      let y = height / 2 - 30 + i * 70;
      let txt = `${i + 1}: ${upg.name} [${upg.rarity.toUpperCase()}]\n${
        upg.effect
      } | Drawback: ${upg.drawback}`;
      drawText(txt, width / 2, y, 26, CENTER, CENTER);
    });
    drawText(
      "Press 1, 2, or 3 to select",
      width / 2,
      height / 2 + 180,
      24,
      CENTER,
      CENTER
    );
  }

  drawBossUpgradesHUD() {
    let y = height - 60;
    textAlign(LEFT, CENTER);
    textSize(18);
    fill(255, 220, 80, 180);
    let upgradesText = this.bossUpgrades.map((u) => u.name).join(", ");
    text("Boss Upgrades: " + upgradesText, 30, y);
  }

  keyPressed(event) {
    if (event.repeat) return;
    this.keys[event.code] = true;

    if (this.shopShip && !this.shopShip.closed) {
      if (this.shopShip.handleInput(event)) {
        if (this.shopShip.closed) {
          this.shopShip = null;
          this.state = "play";
        }
        return;
      }
    }

    if (this.state === "bossUpgrade") {
      if (["1", "2", "3"].includes(event.key)) {
        const idx = Number(event.key) - 1;
        if (this.bossUpgradeChoices[idx]) {
          applyBossUpgrade(this.bossUpgradeChoices[idx]);
          this.bossUpgrades.push(this.bossUpgradeChoices[idx]);
          this.bossUpgradeChoices = [];
          this.awaitingBossUpgrade = false;
          this.state = "play";
        }
      }
      return;
    }

    const keyCode = event.keyCode;
    if (this.state === "start" && keyCode === ENTER) {
      this.state = "play";
    }
    if (this.state === "gameOver" && keyCode === 82) {
      this.resetGame();
    }
    if (this.state === "upgrade") {
      const idx = keyCode - 49;
      const isNumberKey = idx >= 0 && idx < upgrades.length;
      const available = upgrades.map((upgrade, index) => {
        if (upgrade === "Speed Up" && this.playerSpeed >= 500) return false;
        if (upgrade === "Faster Fire Rate" && this.playerFireRate <= 100)
          return false;
        if (upgrade === "Smaller Size" && this.player.size <= 20) return false;
        if (upgrade === "Bigger Bullets" && Bullet.defaultSize >= 20)
          return false;
        if (upgrade === "Damage Up") {
          let damageCap = this.calculateDamageCap();
          if (this.player.damage >= damageCap) return false;
        }
        return true;
      });
      const anyAvailable = available.some(Boolean);

      if (anyAvailable && isNumberKey && available[idx]) {
        this.applyUpgrade(idx);
        if (this.invincibilityTimeout) clearTimeout(this.invincibilityTimeout);
        this.player.invincible = true;
        this.invincibilityTimeout = setTimeout(() => {
          this.player.invincible = false;
          this.invincibilityTimeout = null;
        }, 1000);
        this.state = "play";
      } else if (!anyAvailable) {
        this.state = "play";
      }
    }
    if (this.state === "play" && keyCode === 80) {
      this.state = "pause";
    } else if (this.state === "pause" && keyCode === 80) {
      this.state = "play";
    }
  }

  keyReleased(event) {
    this.keys[event.code] = false;
  }

  resetGame() {
    Bullet.defaultSize = 5;
    this.state = "start";
    this.score = 0;
    this.level = 0;
    this.player.health = 10;
    this.bullets = [];
    this.enemies = [];
    this.enemyBullets = [];
    this.powerUps = [];
    this.bossActive = false;
    this.lastShotTime = 0;
    this.lastEnemySpawnTime = 0;
    this.lastPowerUpSpawnTime = 0;
    this.player = new Player(this.assets, this.playerSpeed);
    this.wave = 1;
    this.waveInProgress = false;
    this.waveBannerTimer = 0;
    this.bossesDefeated = 0;
    this.bossUpgrades = [];
    this.bossUpgradeChoices = [];
    this.awaitingBossUpgrade = false;
  }

  calculateDamageCap() {
    const mindamagecap = 50;
    const maxdamagecap = 10000;
    let damageCap;
    if (this.wave < 10) {
      damageCap = mindamagecap;
    } else if (this.wave < 50) {
      damageCap = 2500;
    } else if (this.wave < 100) {
      damageCap = 5000;
    } else if (this.wave < 150) {
      damageCap = 7500;
    } else {
      damageCap = maxdamagecap;
    }
    return damageCap;
  }

  applyUpgrade(index) {
    const upgrade = upgrades[index];
    switch (upgrade) {
      case "Speed Up":
        if (this.playerSpeed < 500) {
          this.playerSpeed += 50;
          if (this.playerSpeed > 500) {
            this.playerSpeed = 500;
          }
        } else {
          if (this.playerHealth <= this.maxPlayerHealth) this.playerHealth++;
          else this.score += 10;
        }
        break;
      case "Extra Health":
        if (this.playerHealth <= this.maxPlayerHealth) this.playerHealth++;
        else this.score += 10;
        if (this.playerProgress.level === 1) {
          this.player.damage += 5;
        }
        break;
      case "Faster Fire Rate":
        if (this.playerFireRate > 100) {
          this.playerFireRate -= 50;
          if (this.playerProgress.level === 1) {
            this.player.damage += 5;
          }
          if (this.playerFireRate < 100) {
            this.playerFireRate = 100;
          }
        } else {
          if (this.playerHealth <= this.maxPlayerHealth) this.playerHealth++;
          else this.score += 10;
        }
        break;
      case "Smaller Size":
        if (this.player.size > 20) {
          this.player.size -= 10;
          if (this.playerProgress.level === 1) {
            this.player.damage += 5;
          }
          if (this.player.size < 20) {
            this.player.size = 20;
          }
        } else {
          if (this.playerHealth <= this.maxPlayerHealth) this.playerHealth++;
          else this.score += 10;
        }
        break;
      case "Bigger Bullets":
        if (Bullet.defaultSize < 20) {
          Bullet.setSize((Bullet.defaultSize || 5) + 5);
          if (this.playerProgress.level === 1) {
            this.player.damage += 5;
          }
          if (Bullet.defaultSize > 20) {
            Bullet.setSize(20);
          }
        } else {
          if (this.playerHealth <= this.maxPlayerHealth) this.playerHealth++;
          else this.score += 10;
        }
        break;
      case "Damage Up":
        let damageCap = this.calculateDamageCap();
        if (this.player.damage < damageCap) {
          this.player.damage += 5;
        } else {
          if (this.playerHealth <= this.maxPlayerHealth) this.playerHealth++;
          else this.score += 10;
        }
        break;
      default:
        console.log("Invalid Upgrade");
        break;
    }
    this.displayHUD();
  }

  calculateDamageCap() {
    const mindamagecap = 50;
    const maxdamagecap = 10000;
    let damageCap;
    if (this.level < 10) {
      damageCap = mindamagecap;
    } else if (this.level < 50) {
      damageCap = 2500;
    } else if (this.level < 100) {
      damageCap = 5000;
    } else if (this.level < 150) {
      damageCap = 7500;
    } else {
      damageCap = maxdamagecap;
    }
    return damageCap;
  }
}
