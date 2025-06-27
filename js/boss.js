import { Enemy, NormalEnemy, FastEnemy, TankShieldedEnemy } from "./enemy.js";
import { Bullet } from "./bullet.js";

export class Boss extends Enemy {
  constructor(x, y, bossType, bossesDefeated, assets) {
    let sprite, speed, health, damage, scoreValue, size;
    const bossCount = bossesDefeated || 0;
    switch (bossType) {
      case "CosmicSerpent":
        sprite = assets.cosmicserpentheadSprite || assets.ancientBossSprite;
        size = 100;
        speed = 40;
        health = 300 + bossCount * 80;
        damage = 5 + Math.floor(bossCount / 2);
        scoreValue = 400 + bossCount * 200;
        break;
      case "CelestialGuardian":
        sprite = assets.celestialguardianSprite || assets.crimsonwingSprite;
        size = 120;
        speed = 20;
        health = 250 + bossCount * 70;
        damage = 6 + Math.floor(bossCount / 2);
        scoreValue = 350 + bossCount * 150;
        break;
      case "VoidWeaver":
        sprite = assets.voidweaverSprite || assets.azureSprite;
        size = 90;
        speed = 50;
        health = 200 + bossCount * 75;
        damage = 4 + Math.floor(bossCount / 2);
        scoreValue = 300 + bossCount * 150;
        break;
      case "ancient":
        sprite = assets.ancientBossSprite;
        size = 80;
        speed = 25;
        health = 200 + bossCount * 60;
        damage = 2 + Math.floor(bossCount / 3);
        scoreValue = 240 + bossCount * 120;
        break;
      case "crimsonwing":
        sprite = assets.crimsonwingSprite;
        size = 80;
        speed = 30;
        health = 150 + bossCount * 50;
        damage = 3 + Math.floor(bossCount / 3);
        scoreValue = 220 + bossCount * 110;
        break;
      case "azure":
        sprite = assets.azureSprite;
        size = 80;
        speed = 50;
        health = 100 + bossCount * 40;
        damage = 1 + Math.floor(bossCount / 4);
        scoreValue = 200 + bossCount * 100;
        break;
      default:
        sprite = assets.ancientBossSprite;
        size = 80;
        speed = 30;
        health = 100 + bossCount * 40;
        damage = 3 + Math.floor(bossCount / 4);
        scoreValue = 200 + bossCount * 100;
        break;
    }
    super(x, y, size, speed, health, damage, sprite, scoreValue);
    this.bossType = bossType;
    this.phase = 1;
    this.phaseTimer = 0;
    this.attackTimer = 0;
    this.healthMax = this.health;
    this.segments = [];
    this.directionX = "left";
    this.teleportTimer = 0;
    this.blackHoleTimer = 0;
    this.assets = assets;
    this.snakeWaveOffset = Math.random() * Math.PI * 2;
    this.segmentTrail = [];
    this.setupAttackPatterns();
  }

  setupAttackPatterns() {
    switch (this.bossType) {
      case "CosmicSerpent":
        this.segments = [];
        let segmentCount = 5;
        let segmentSpacing = 55;
        for (let i = 1; i <= segmentCount; i++) {
          this.segments.push({
            x: this.x,
            y: this.y + i * segmentSpacing,
            health: this.healthMax / (segmentCount + 1),
          });
        }
        this.tail = {
          x: this.x,
          y: this.y + (segmentCount + 1) * segmentSpacing,
          health: this.healthMax / (segmentCount + 1),
        };
        this.assets.cosmicSerpentSegmentSprite =
          this.assets.cosmicserpentbodySprite;
        this.assets.cosmicSerpentTailSprite =
          this.assets.cosmicserpenttailSprite;
        this.attackPattern = [
          this.cosmicSerpentPhase1.bind(this),
          this.cosmicSerpentPhase2.bind(this),
          this.cosmicSerpentPhase3.bind(this),
        ];
        break;
      case "CelestialGuardian":
        this.attackPattern = [
          this.celestialGuardianPhase1.bind(this),
          this.celestialGuardianPhase2.bind(this),
          this.celestialGuardianPhase3.bind(this),
        ];
        this.summonTimer = 0;
        break;
      case "VoidWeaver":
        this.attackPattern = [
          this.voidWeaverPhase1.bind(this),
          this.voidWeaverPhase2.bind(this),
          this.voidWeaverPhase3.bind(this),
        ];
        this.teleportCooldown = 0;
        this.blackHoleCooldown = 0;
        break;
      case "ancient":
        this.attackPattern = [
          this.ancientPhase1.bind(this),
          this.ancientPhase2.bind(this),
          this.ancientPhase3.bind(this),
        ];
        break;
      case "crimsonwing":
        this.attackPattern = [
          this.crimsonwingPhase1.bind(this),
          this.crimsonwingPhase2.bind(this),
          this.crimsonwingPhase3.bind(this),
        ];
        break;
      case "azure":
        this.attackPattern = [
          this.azurePhase1.bind(this),
          this.azurePhase2.bind(this),
          this.azurePhase3.bind(this),
        ];
        break;
      default:
        this.attackPattern = [this.standardBossAttack.bind(this)];
        break;
    }
  }

  update(enemyBullets, player, enemiesList = []) {
    this.phaseTimer += deltaTime;
    this.attackTimer += deltaTime;
    switch (this.bossType) {
      case "CosmicSerpent":
        this.updateCosmicSerpent(player);
        break;
      case "CelestialGuardian":
        this.updateCelestialGuardian(enemyBullets, player, enemiesList);
        break;
      case "VoidWeaver":
        this.updateVoidWeaver(enemyBullets);
        break;
      case "ancient":
      case "crimsonwing":
      case "azure":
        this.updateClassicBoss();
        break;
      default:
        this.updateStandardBoss();
        break;
    }
    if (this.attackPattern && this.phase <= this.attackPattern.length) {
      if (this.bossType === "CelestialGuardian" && this.phase === 3) {
        this.attackPattern[this.phase - 1](enemyBullets, player, enemiesList);
      } else {
        this.attackPattern[this.phase - 1](enemyBullets, player);
      }
    }
    this.checkPhaseTransition();
    if (this.bossType === "CosmicSerpent") {
      this.segmentTrail.unshift({ x: this.x, y: this.y });
      const maxTrail = (this.segments?.length || 0) * 10 + 1;
      if (this.segmentTrail.length > maxTrail)
        this.segmentTrail.length = maxTrail;
    }
  }

  updateCosmicSerpent(player) {
    this.y += (this.speed * deltaTime) / 1000;
    this.x =
      width / 2 + Math.sin(this.y / 80 + this.snakeWaveOffset) * (width / 4);
    if (this.segments.length > 0 && this.segmentTrail.length > 0) {
      for (let i = 0; i < this.segments.length; i++) {
        const trailIdx = (i + 1) * 10;
        if (this.segmentTrail[trailIdx]) {
          this.segments[i].x = this.segmentTrail[trailIdx].x;
          this.segments[i].y = this.segmentTrail[trailIdx].y;
        }
      }
      if (this.segments.length > 0) {
        const lastSeg = this.segments[this.segments.length - 1];
        let tailOffset = 55;
        let tailAngle = 0;
        if (this.segments.length > 1) {
          let prev = this.segments[this.segments.length - 2];
          tailAngle = Math.atan2(lastSeg.y - prev.y, lastSeg.x - prev.x);
        } else {
          tailAngle = Math.atan2(lastSeg.y - this.y, lastSeg.x - this.x);
        }
        this.tail.x = lastSeg.x + Math.cos(tailAngle) * tailOffset;
        this.tail.y = lastSeg.y + Math.sin(tailAngle) * tailOffset;
      }
    }
  }

  cosmicSerpentPhase1(enemyBullets, player) {
    if (this.attackTimer > 1000) {
      const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
      const spread = 0.35;
      const count = 5;
      for (let i = 0; i < count; i++) {
        const angle = angleToPlayer + spread * (i - (count - 1) / 2);
        enemyBullets.push(
          new Bullet(
            this.x,
            this.y,
            this.damage,
            250,
            30,
            angle,
            this.assets,
            true
          )
        );
      }
      this.attackTimer = 0;
    }
  }

  cosmicSerpentPhase2(enemyBullets, player) {
    if (this.attackTimer > 700) {
      const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
      const waveCount = 7;
      const waveSpread = 0.5;
      for (let i = 0; i < waveCount; i++) {
        const offset = Math.sin(frameCount * 0.15 + i) * 0.25;
        const angle =
          angleToPlayer + waveSpread * (i - (waveCount - 1) / 2) + offset;
        enemyBullets.push(
          new Bullet(
            this.x,
            this.y,
            this.damage,
            320,
            30,
            angle,
            this.assets,
            true
          )
        );
      }
      this.attackTimer = 0;
    }
  }

  cosmicSerpentPhase3(enemyBullets, player) {
    if (this.attackTimer > 200) {
      const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
      const spiralBase = (frameCount * 0.18) % (Math.PI * 2);
      for (let i = 0; i < 6; i++) {
        const angle = angleToPlayer + spiralBase + (i * Math.PI * 2) / 6;
        enemyBullets.push(
          new Bullet(
            this.x,
            this.y,
            this.damage,
            340,
            30,
            angle,
            this.assets,
            true
          )
        );
      }
      this.attackTimer = 0;
    }
  }

  updateCelestialGuardian(enemyBullets, player, enemiesList) {
    this.y = height / 3 + 20 * sin(frameCount * 0.04);
    if (!this.directionX) this.directionX = "right";
    if (this.directionX === "right") {
      this.x += (this.speed * deltaTime) / 1500;
      if (this.x > width - this.size / 2) this.directionX = "left";
    } else {
      this.x -= (this.speed * deltaTime) / 1500;
      if (this.x < this.size / 2) this.directionX = "right";
    }
    if ((this.phase === 2 || this.phase === 3) && this.summonTimer > 8000) {
      enemiesList.push(new NormalEnemy(this.x - 30, this.y + 50, this.assets));
      enemiesList.push(new FastEnemy(this.x + 30, this.y + 50, this.assets));
      this.summonTimer = 0;
    } else {
      this.summonTimer += deltaTime;
    }
  }
  celestialGuardianPhase1(enemyBullets, player) {
    if (this.attackTimer > 2000) {
      for (let i = 0; i < 360; i += 60) {
        let angle = radians(i + (frameCount % 360));
        let bullet = new Bullet(
          this.x + cos(angle) * 40,
          this.y + sin(angle) * 40,
          this.damage,
          0,
          15,
          angle,
          this.assets
        );
        bullet.isExpanding = true;
        bullet.ownerBossId = this;
        bullet.update = function () {
          this.size += 0.4;
        };
        enemyBullets.push(bullet);
      }
      this.attackTimer = 0;
    }
  }
  celestialGuardianPhase2(enemyBullets, player) {
    if (this.attackTimer > 1500) {
      const targetAngle = atan2(player.y - this.y, player.x - this.x);
      enemyBullets.push(
        new Bullet(
          this.x,
          this.y,
          this.damage,
          400,
          30,
          targetAngle,
          this.assets,
          true
        )
      );
      this.attackTimer = 0;
    }
  }
  celestialGuardianPhase3(enemyBullets, player, enemiesList = []) {
    if (this.attackTimer > 700) {
      const targetAngle = atan2(player.y - this.y, player.x - this.x);
      for (let offset of [-0.1, 0, 0.1]) {
        enemyBullets.push(
          new Bullet(
            this.x,
            this.y,
            this.damage,
            450,
            30,
            targetAngle + offset,
            this.assets,
            true
          )
        );
      }
      this.attackTimer = 0;
      if (this.summonTimer > 4000) {
        enemiesList.push(
          new TankShieldedEnemy(this.x, this.y + 50, this.assets)
        );
        this.summonTimer = 0;
      }
    }
  }

  updateVoidWeaver(enemyBullets) {
    this.teleportCooldown = (this.teleportCooldown || 0) + deltaTime;
    this.blackHoleCooldown = (this.blackHoleCooldown || 0) + deltaTime;
    if (this.teleportCooldown > 8000) {
      this.x = random(this.size / 2, width - this.size / 2);
      this.y = random(this.size / 2, height / 2);
      this.teleportCooldown = 0;
    }
    if (this.phase === 3 && this.blackHoleCooldown > 10000) {
      enemyBullets.push(new BlackHole(this.x, this.y + 30, 50));
      this.blackHoleCooldown = 0;
    }
  }
  voidWeaverPhase1(enemyBullets, player) {
    if (this.attackTimer > 1500) {
      const angle = atan2(player.y - this.y, player.x - this.x);
      enemyBullets.push(
        new Bullet(
          this.x,
          this.y,
          this.damage,
          250,
          30,
          angle,
          this.assets,
          true
        )
      );
      this.attackTimer = 0;
    }
  }
  voidWeaverPhase2(enemyBullets, player) {
    if (this.attackTimer > 1200) {
      const baseAngle = atan2(player.y - this.y, player.x - this.x);
      for (let delta of [-0.15, 0, 0.15]) {
        enemyBullets.push(
          new Bullet(
            this.x,
            this.y,
            this.damage,
            270,
            30,
            baseAngle + delta,
            this.assets,
            true
          )
        );
      }
      this.attackTimer = 0;
    }
  }
  voidWeaverPhase3(enemyBullets, player) {
    if (this.attackTimer > 800) {
      for (let i = 0; i < 360; i += 30) {
        let angle = radians((frameCount * 6 + i) % 360);
        enemyBullets.push(
          new Bullet(
            this.x,
            this.y,
            this.damage,
            300,
            30,
            angle,
            this.assets,
            true
          )
        );
      }
      this.attackTimer = 0;
    }
  }

  ancientPhase1(enemyBullets, player) {
    if (this.attackTimer > 1200) {
      enemyBullets.push(
        new Bullet(
          this.x,
          this.y,
          this.damage,
          180,
          30,
          null,
          this.assets,
          true
        )
      );
      this.attackTimer = 0;
    }
  }
  ancientPhase2(enemyBullets, player) {
    if (this.attackTimer > 900) {
      const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
      const spread = 0.25;
      const angles = [
        angleToPlayer - spread,
        angleToPlayer,
        angleToPlayer + spread,
      ];
      angles.forEach((angle) => {
        enemyBullets.push(
          new Bullet(
            this.x,
            this.y,
            this.damage,
            200,
            30,
            angle,
            this.assets,
            true
          )
        );
      });
      this.attackTimer = 0;
    }
  }
  ancientPhase3(enemyBullets, player) {
    if (this.attackTimer > 400) {
      for (let i = 0; i < 360; i += 60) {
        let angle = radians((frameCount * 2 + i) % 360);
        enemyBullets.push(
          new Bullet(
            this.x,
            this.y,
            this.damage,
            220,
            30,
            angle,
            this.assets,
            true
          )
        );
      }
      this.attackTimer = 0;
    }
  }

  crimsonwingPhase1(enemyBullets, player) {
    if (this.attackTimer > 900) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      const spread = 0.18;
      for (let offset of [-spread, 0, spread]) {
        enemyBullets.push(
          new Bullet(
            this.x,
            this.y,
            this.damage,
            220,
            30,
            angle + offset,
            this.assets,
            true
          )
        );
      }
      this.attackTimer = 0;
    }
  }
  crimsonwingPhase2(enemyBullets, player) {
    if (this.attackTimer > 600) {
      const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
      for (let offset of [-0.2, 0, 0.2]) {
        enemyBullets.push(
          new Bullet(
            this.x,
            this.y,
            this.damage,
            260,
            30,
            angleToPlayer + offset,
            this.assets,
            true
          )
        );
      }
      this.attackTimer = 0;
    }
  }
  crimsonwingPhase3(enemyBullets, player) {
    if (this.attackTimer > 400) {
      const angle = atan2(player.y - this.y, player.x - this.x);
      for (let offset of [-0.15, 0, 0.15]) {
        enemyBullets.push(
          new Bullet(
            this.x,
            this.y,
            this.damage,
            300,
            30,
            angle + offset,
            this.assets,
            true
          )
        );
      }
      this.attackTimer = 0;
    }
  }

  azurePhase1(enemyBullets, player) {
    if (this.attackTimer > 700) {
      const angle = atan2(player.y - this.y, player.x - this.x);
      enemyBullets.push(
        new Bullet(
          this.x,
          this.y,
          this.damage,
          350,
          30,
          angle,
          this.assets,
          true
        )
      );
      this.attackTimer = 0;
    }
  }
  azurePhase2(enemyBullets, player) {
    if (this.attackTimer > 500) {
      const angle = atan2(player.y - this.y, player.x - this.x);
      for (let offset of [-0.1, 0, 0.1]) {
        enemyBullets.push(
          new Bullet(
            this.x,
            this.y,
            this.damage,
            370,
            30,
            angle + offset,
            this.assets,
            true
          )
        );
      }
      this.attackTimer = 0;
    }
  }
  azurePhase3(enemyBullets, player) {
    if (this.attackTimer > 200) {
      for (let i = 0; i < 360; i += 45) {
        let angle = radians((frameCount * 4 + i) % 360);
        enemyBullets.push(
          new Bullet(
            this.x,
            this.y,
            this.damage,
            400,
            30,
            angle,
            this.assets,
            true
          )
        );
      }
      this.attackTimer = 0;
    }
  }

  updateClassicBoss() {
    this.y += (this.speed * deltaTime) / 1000;
    if (this.y > height) this.y = -this.size;
    if (this.directionX === "left") {
      this.x -= (this.speed * deltaTime) / 2000;
      if (this.x < this.size / 2) this.directionX = "right";
    } else {
      this.x += (this.speed * deltaTime) / 2000;
      if (this.x > width - this.size / 2) this.directionX = "left";
    }
  }
  classicBossAttack() {
    if (this.bossType === "ancient" && frameCount % 90 === 0) {
      enemyBullets.push(
        new Bullet(
          this.x,
          this.y,
          this.damage,
          200,
          30,
          null,
          this.assets,
          true
        )
      );
    } else if (this.bossType === "crimsonwing" && frameCount % 60 === 0) {
      enemyBullets.push(
        new Bullet(
          this.x,
          this.y,
          this.damage,
          250,
          30,
          null,
          this.assets,
          true
        )
      );
      enemyBullets.push(
        new Bullet(
          this.x - 30,
          this.y,
          this.damage,
          250,
          30,
          null,
          this.assets,
          true
        )
      );
      enemyBullets.push(
        new Bullet(
          this.x + 30,
          this.y,
          this.damage,
          250,
          30,
          null,
          this.assets,
          true
        )
      );
    } else if (this.bossType === "azure" && frameCount % 30 === 0) {
      const angle = atan2(player.y - this.y, player.x - this.y);
      enemyBullets.push(
        new Bullet(
          this.x,
          this.y,
          this.damage,
          400,
          30,
          angle,
          this.assets,
          true
        )
      );
    }
  }

  updateStandardBoss() {
    this.y += (this.speed * deltaTime) / 1000;
    if (this.y > height) this.y = -this.size;
    if (this.directionX === "left") {
      this.x -= (this.speed * deltaTime) / 2000;
      if (this.x < this.size / 2) this.directionX = "right";
    } else {
      this.x += (this.speed * deltaTime) / 2000;
      if (this.x > width - this.size / 2) this.directionX = "left";
    }
  }
  standardBossAttack() {
    if (frameCount % 60 === 0) {
      enemyBullets.push(
        new Bullet(
          this.x,
          this.y,
          this.damage,
          200,
          30,
          null,
          this.assets,
          true
        )
      );
    }
  }

  checkPhaseTransition() {
    if (this.health / this.healthMax < 0.3 && this.phase < 3) {
      this.phase = 3;
      this.phaseTimer = 0;
      this.attackTimer = 0;
      this.speed *= 1.2;
    } else if (this.health / this.healthMax < 0.6 && this.phase < 2) {
      this.phase = 2;
      this.phaseTimer = 0;
      this.attackTimer = 0;
      this.speed *= 1.1;
    }
  }

  show() {
    if (this.bossType === "CosmicSerpent") {
      if (this.segments.length > 0) {
        for (let i = this.segments.length - 1; i >= 0; i--) {
          let seg = this.segments[i];
          let next =
            i < this.segments.length - 1 ? this.segments[i + 1] : this.tail;
          let angle = Math.atan2(next.y - seg.y, next.x - seg.x);
          push();
          translate(seg.x, seg.y);
          rotate(angle - Math.PI / 2);
          if (this.assets && this.assets.cosmicSerpentSegmentSprite) {
            image(
              this.assets.cosmicSerpentSegmentSprite,
              0,
              0,
              this.size * 0.6,
              this.size * 0.6
            );
          }
          pop();
        }
        let lastSeg = this.segments[this.segments.length - 1];
        let tailAngle = 0;
        if (this.segments.length > 1) {
          let prev = this.segments[this.segments.length - 2];
          tailAngle = Math.atan2(lastSeg.y - prev.y, lastSeg.x - prev.x);
        } else {
          tailAngle = Math.atan2(
            this.tail.y - lastSeg.y,
            this.tail.x - lastSeg.x
          );
        }
        push();
        translate(this.tail.x, this.tail.y);
        rotate(tailAngle - Math.PI / 2 + Math.PI);
        if (this.assets && this.assets.cosmicSerpentTailSprite) {
          image(
            this.assets.cosmicSerpentTailSprite,
            0,
            0,
            this.size * 0.4,
            this.size * 0.4
          );
        }
        pop();
      }
      push();
      translate(this.x, this.y);
      let headAngle = 0;
      if (this.segments.length > 0) {
        headAngle = Math.atan2(
          this.segments[0].y - this.y,
          this.segments[0].x - this.x
        );
      } else if (this.segmentTrail.length > 1) {
        headAngle = Math.atan2(
          this.segmentTrail[1].y - this.y,
          this.segmentTrail[1].x - this.x
        );
      }
      rotate(headAngle - Math.PI / 2 + Math.PI);
      imageMode(CENTER);
      if (this.assets && this.assets.cosmicserpentheadSprite) {
        image(this.assets.cosmicserpentheadSprite, 0, 0, this.size, this.size);
      } else {
        image(this.sprite, 0, 0, this.size, this.size);
      }
      pop();
    } else {
      super.show();
    }
  }

  isSegmentHit(x, y) {
    if (dist(x, y, this.x, this.y) < this.size / 2)
      return { part: "head", idx: -1 };
    for (let i = 0; i < this.segments.length; i++) {
      if (
        dist(x, y, this.segments[i].x, this.segments[i].y) <
        (this.size * 0.7 * (1 - i / this.segments.length)) / 2
      ) {
        return { part: "segment", idx: i };
      }
    }
    if (dist(x, y, this.tail.x, this.tail.y) < this.size * 0.25)
      return { part: "tail", idx: -1 };
    return null;
  }
}

export class BlackHole {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius * 1.5;
    this.size = this.radius * 2;
    this.pullStrength = 2.0;
    this.duration = 8000;
    this.timer = 0;
    this.expired = false;
  }
  update(player) {
    this.timer += deltaTime;
    let dx = this.x - player.x;
    let dy = this.y - player.y;
    let distToPlayer = sqrt(dx * dx + dy * dy);
    if (distToPlayer < this.radius) {
      let pull = this.pullStrength * (1 - distToPlayer / this.radius);
      let pullX = (dx / distToPlayer) * pull;
      let pullY = (dy / distToPlayer) * pull;
      player.xSpeed += pullX;
      player.ySpeed += pullY;
    }
    if (this.timer > this.duration) {
      this.expired = true;
    }
  }
  show() {
    push();
    noFill();
    stroke(150, 0, 200, 180);
    strokeWeight(6);
    ellipse(this.x, this.y, this.radius * 2.2);
    strokeWeight(3);
    stroke(200, 0, 255, 120);
    ellipse(this.x, this.y, this.radius * 1.5);
    fill(60, 0, 80, 120);
    noStroke();
    ellipse(this.x, this.y, this.radius * 1.1);
    pop();
  }
}
