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
    this.playerSpeed = 200;
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
    this.version = "1.9.1";
    this.tripleShotTimeout = null;
    this.invincibilityTimeout = null;
    this.shieldTimeout = null;
    this.speedBoostTimeout = null;
    this.player.shielded = false;
    this.player.speedBoost = false;
  }

  setup() {
    this.player = new Player(this.assets, this.playerSpeed);
  }

  draw() {
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
    }
  }

  drawStartScreen() {
    imageMode(CORNER);
    image(this.assets.startScreenBackground, 0, 0, width, height);
    drawText(
      "Bullet Hell Game",
      width / 2,
      height / 2 - 50,
      32,
      CENTER,
      CENTER
    );
    drawText("Press ENTER to Start", width / 2, height / 2, 20, CENTER, CENTER);
    drawText("Controls:", width / 2, height / 2 + 50, 16, CENTER, CENTER);
    drawText(
      "Arrow Keys: Move",
      width / 2,
      height / 2 + 70,
      16,
      CENTER,
      CENTER
    );
    drawText("Space: Shoot", width / 2, height / 2 + 90, 16, CENTER, CENTER);
    drawText(
      `Version: ${this.version}`,
      width / 2,
      height - 30,
      16,
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
      height / 2 - 50,
      32,
      CENTER,
      CENTER,
      [255, 0, 0]
    );
    drawText(`Score: ${this.score}`, width / 2, height / 2, 20, CENTER, CENTER);
    drawText(
      "Press R to Restart",
      width / 2,
      height / 2 + 50,
      20,
      CENTER,
      CENTER
    );
    imageMode(CENTER);
  }

  playGame() {
    drawBackground(30, this.assets, this.backgroundY1, this.backgroundY2);
    this.player.update();
    this.player.show();
    this.handleBullets();
    this.handleEnemyBullets();
    this.handleEnemies();
    this.spawnEnemies();
    this.handlePowerUps();
    this.spawnPowerUps();
    this.displayHUD();
    this.handleScoreGain();
    this.handleLevelProgression();
    this.handleShooting();
    this.checkGameOver();
  }

  handleScoreGain() {
    if (this.level < 50) {
      NormalEnemy.scoreValue = 30;
      TankShieldedEnemy.scoreValue = 60;
      FastEnemy.scoreValue = 15;
    } else if (this.level < 100) {
      NormalEnemy.scoreValue = 60;
      TankShieldedEnemy.scoreValue = 120;
      FastEnemy.scoreValue = 30;
    } else if (this.level < 150) {
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
    const scoreRequired = this.levelProgression();
    if (this.score >= scoreRequired && !this.bossActive) {
      this.level++;
      if (this.level === 1) {
        return;
      }
      if (this.level % 5 === 0) {
        const bossTypes = [
          "CosmicSerpent",
          "CelestialGuardian",
          "VoidWeaver",
          "ancient",
          "crimsonwing",
          "azure",
        ];
        const bossType =
          bossTypes[Math.floor(Math.random() * bossTypes.length)];
        this.spawnBoss(bossType);
      } else {
        this.state = "upgrade";
      }
    }
  }

  levelProgression() {
    if (this.level <= 20) {
      this.enemySpawnInterval = Math.max(400, 1200 - this.level * 30);
      return 60 * this.level;
    } else if (this.level <= 50) {
      this.enemySpawnInterval = Math.max(300, 800 - (this.level - 20) * 10);
      return 1200 + 80 * (this.level - 20);
    } else if (this.level <= 100) {
      this.enemySpawnInterval = Math.max(200, 600 - (this.level - 50) * 5);
      return 4000 + 120 * (this.level - 50);
    } else {
      this.enemySpawnInterval = 150;
      return 10000 + 200 * (this.level - 100);
    }
  }

  spawnEnemies() {
    if (this.bossActive) return;
    if (millis() - this.lastEnemySpawnTime > this.enemySpawnInterval) {
      const x = random(20, width - 20);
      const y = -20;
      const enemyTypes = [
        NormalEnemy,
        TankShieldedEnemy,
        FastEnemy,
        Bomber,
        LaserDrone,
      ];
      const numToSpawn = this.level > 10 ? 2 : 1;
      for (let i = 0; i < numToSpawn; i++) {
        const enemyType = random(enemyTypes);
        const enemy = new enemyType(x, y, this.assets);
        enemy.health += Math.floor(this.level * 1.5);
        enemy.damage += Math.floor(this.level / 10);
        this.enemies.push(enemy);
      }
      this.lastEnemySpawnTime = millis();
      this.enemySpawnInterval = Math.max(
        120,
        this.enemySpawnInterval - this.level * 2
      );
    }
  }

  spawnBoss(bossType) {
    this.bossActive = true;
    let x;
    if (bossType === "azure" || bossType === "VoidWeaver") {
      x = random(80, width - 80);
    } else {
      x = random([width / 2, 20, width - 20]);
    }
    const y = -40;
    this.enemies.push(new Boss(x, y, bossType, this.level, this.assets));
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
    }
  }

  spawnPowerUps() {
    if (millis() - this.lastPowerUpSpawnTime > this.powerUpSpawnInterval) {
      const x = random(20, width - 20);
      const y = -20;
      const type = random([
        "Triple Shot",
        "Invincibility",
        "Smart Bomb",
        "Speed Boost",
        "Recovery",
      ]);
      this.powerUps.push(new PowerUp(x, y, type, this.assets));
      this.lastPowerUpSpawnTime = millis();
      this.powerUpSpawnInterval = min(20000, 10000 + this.level * 500);
    }
  }

  displayHUD() {
    textAlign(LEFT, CENTER);
    drawText(`Score: ${this.score}`, 20, 20, 16, LEFT, CENTER);
    drawText(`Level: ${this.level}`, 20, 40, 16, LEFT, CENTER);
    drawText(`Damage: ${this.player.damage}`, 20, 60, 16, LEFT, CENTER);

    let activePowerUps = [];
    if (this.player.tripleShot) activePowerUps.push("Triple Shot");
    if (this.player.invincible) activePowerUps.push("Invincibility");
    if (this.player.speedBoost) activePowerUps.push("Speed Boost");
    let powerUpText =
      activePowerUps.length > 0 ? activePowerUps.join(", ") : "None";
    drawText(`Power-Up: ${powerUpText}`, 20, 80, 16, LEFT, CENTER);

    drawText(`Fire Rate: ${this.playerFireRate} ms`, 20, 100, 16, LEFT, CENTER);
    drawText(`Speed: ${this.playerSpeed} px/s`, 20, 120, 16, LEFT, CENTER);

    fill(255, 0, 0);
    rect(40, 140, 100, 10);
    fill(0, 255, 0);
    rect(40, 140, (this.player.health / this.maxPlayerHealth) * 100, 10);
    textAlign(CENTER, CENTER);
  }

  checkBulletCollision(bullet, bulletIndex) {
    for (let j = this.enemies.length - 1; j >= 0; j--) {
      const enemy = this.enemies[j];
      if (enemy instanceof Boss && enemy.bossType === "CosmicSerpent") {
        const hit = enemy.isSegmentHit(bullet.x, bullet.y);
        if (hit) {
          this.bullets.splice(bulletIndex, 1);
          if (hit.part === "head") {
            enemy.health -= bullet.damage;
          } else if (hit.part === "segment") {
            enemy.segments[hit.idx].health -= bullet.damage;
            if (enemy.segments[hit.idx].health <= 0) {
              this.score += Math.floor(enemy.scoreValue * 0.15);
              if (random() < 0.25) {
                const seg = enemy.segments[hit.idx];
                const type = random([
                  "Triple Shot",
                  "Invincibility",
                  "Smart Bomb",
                  "Speed Boost",
                  "Recovery",
                ]);
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
              const type = random([
                "Triple Shot",
                "Invincibility",
                "Smart Bomb",
                "Speed Boost",
                "Recovery",
              ]);
              this.powerUps.push(
                new PowerUp(enemy.tail.x, enemy.tail.y, type, this.assets)
              );
              enemy.tail.health = -9999;
            }
          }
          if (enemy.health <= 0) {
            this.score += enemy.scoreValue;
            if (random() < 0.5) {
              const type = random([
                "Triple Shot",
                "Invincibility",
                "Smart Bomb",
                "Speed Boost",
                "Recovery",
              ]);
              this.powerUps.push(
                new PowerUp(enemy.x, enemy.y, type, this.assets)
              );
            }
            this.enemies.splice(j, 1);
            this.bossActive = false;
          }
          break;
        }
      } else {
        if (dist(bullet.x, bullet.y, enemy.x, enemy.y) < enemy.size / 2) {
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
            this.enemies.splice(j, 1);
            if (enemy instanceof Boss) {
              this.bossActive = false;
            }
          }
          break;
        }
      }
    }
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
        this.enemyBullets.splice(i, 1);
        continue;
      }
      if (
        dist(bullet.x, bullet.y, this.player.x, this.player.y) <
          this.player.size / 2 &&
        !this.player.invincible
      ) {
        this.player.health -= bullet.damage;
        this.enemyBullets.splice(i, 1);
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
        this.enemies.splice(i, 1);
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
    if (keyIsDown(32) && millis() - this.lastShotTime > this.playerFireRate) {
      if (this.player.tripleShot) {
        this.bullets.push(
          new Bullet(
            this.player.x - 10,
            this.player.y,
            this.player.damage,
            -400,
            Bullet.defaultSize,
            null,
            this.assets
          )
        );
        this.bullets.push(
          new Bullet(
            this.player.x,
            this.player.y,
            this.player.damage,
            -400,
            Bullet.defaultSize,
            null,
            this.assets
          )
        );
        this.bullets.push(
          new Bullet(
            this.player.x + 10,
            this.player.y,
            this.player.damage,
            -400,
            Bullet.defaultSize,
            null,
            this.assets
          )
        );
      } else {
        this.bullets.push(
          new Bullet(
            this.player.x,
            this.player.y,
            this.player.damage,
            -400,
            Bullet.defaultSize,
            null,
            this.assets
          )
        );
      }
      this.lastShotTime = millis();
    }
  }

  checkGameOver() {
    if (this.player.health <= 0) {
      this.state = "gameOver";
    }
  }

  offerUpgrade() {
    drawBackground(50, this.assets, this.backgroundY1, this.backgroundY2);
    drawText(
      "Choose an Upgrade:",
      width / 2,
      height / 2 - 50,
      24,
      CENTER,
      CENTER
    );
    upgrades.forEach((upgrade, index) => {
      let upgradeText = `${index + 1}: ${upgrade}`;
      if (upgrade === "Speed Up" && this.playerSpeed >= 500) {
        upgradeText += " (Maxed Out)";
      }
      if (upgrade === "Faster Fire Rate" && this.playerFireRate <= 100) {
        upgradeText += " (Maxed Out)";
      }
      if (upgrade === "Smaller Size" && this.player.size <= 20) {
        upgradeText += " (Maxed Out)";
      }
      if (upgrade === "Bigger Bullets" && Bullet.defaultSize >= 20) {
        upgradeText += " (Maxed Out)";
      }
      if (upgrade === "Damage Up") {
        let damageCap = this.calculateDamageCap();
        if (this.player.damage >= damageCap) {
          upgradeText += " (Maxed Out)";
        }
      }
      drawText(
        upgradeText,
        width / 2,
        height / 2 + index * 30,
        24,
        CENTER,
        CENTER
      );
    });
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
  }

  keyPressed(keyCode) {
    if (this.state === "start" && keyCode === ENTER) {
      this.state = "play";
    }
    if (this.state === "gameOver" && keyCode === 82) {
      this.resetGame();
    }
    if (this.state === "upgrade" && keyCode >= 49 && keyCode <= 54) {
      this.applyUpgrade(keyCode - 49);
      if (this.invincibilityTimeout) clearTimeout(this.invincibilityTimeout);
      this.player.invincible = true;
      this.invincibilityTimeout = setTimeout(() => {
        this.player.invincible = false;
        this.invincibilityTimeout = null;
      }, 1000);
      this.state = "play";
    }
    if (this.state === "play" && keyCode === 80) {
      this.state = "pause";
    } else if (this.state === "pause" && keyCode === 80) {
      this.state = "play";
    }
  }

  drawPauseScreen() {
    drawBackground(30, this.assets, this.backgroundY1, this.backgroundY2);
    drawText("Paused", width / 2, height / 2, 32, CENTER, CENTER);
    drawText(
      "Press 'P' to Resume",
      width / 2,
      height / 2 + 50,
      20,
      CENTER,
      CENTER
    );
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
        if (this.level === 1) {
          this.player.damage += 5;
        }
        break;
      case "Faster Fire Rate":
        if (this.playerFireRate > 100) {
          this.playerFireRate -= 50;
          if (this.level === 1) {
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
          if (this.level === 1) {
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
          if (this.level === 1) {
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
