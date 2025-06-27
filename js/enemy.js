import { Bullet } from "./bullet.js";

export class Enemy {
  constructor(x, y, size, speed, health, damage, sprite, scoreValue) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.health = health;
    this.damage = damage;
    this.sprite = sprite;
    this.scoreValue = scoreValue;
  }

  update() {
    this.y += (this.speed * deltaTime) / 1000;
  }

  show() {
    imageMode(CENTER);
    image(this.sprite, this.x, this.y, this.size, this.size);
  }
}

export class NormalEnemy extends Enemy {
  constructor(x, y, assets) {
    super(x, y, 40, 100, 10, 1, assets.defaultEnemySprite, 10);
  }
}

export class FastEnemy extends Enemy {
  constructor(x, y, assets) {
    super(x, y, 30, 200, 5, 1, assets.fastEnemySprite, 5);
  }
}

export class Bomber extends Enemy {
  constructor(x, y, assets) {
    super(x, y, 35, 80, 15, 2, assets.bomberEnemySprite, 20);
    this.bombCooldown = 0;
    this.assets = assets;
  }
  update(enemyBullets) {
    super.update();
    this.bombCooldown += deltaTime;
    if (this.bombCooldown > 1500) {
      enemyBullets.push(
        new Bullet(
          this.x,
          this.y,
          this.damage,
          200,
          50,
          PI / 2,
          this.assets,
          true
        )
      );
      this.bombCooldown = 0;
    }
  }
}

export class LaserDrone extends Enemy {
  constructor(x, y, assets) {
    super(x, y, 30, 120, 8, 1, assets.laserDroneEnemySprite, 30);
    this.laserCooldown = 0;
    this.assets = assets;
  }
  update(enemyBullets, player) {
    super.update();
    this.laserCooldown += deltaTime;
    if (this.laserCooldown > 2000 && player) {
      const baseAngle = Math.atan2(player.y - this.y, player.x - this.x);
      const offsets = [-0.12, 0, 0.12];
      for (let offset of offsets) {
        enemyBullets.push(
          new Bullet(
            this.x,
            this.y,
            this.damage,
            200,
            32,
            baseAngle + offset,
            this.assets,
            true
          )
        );
      }
      this.laserCooldown = 0;
    }
  }
}

export class TankShieldedEnemy extends Enemy {
  constructor(x, y, assets) {
    super(x, y, 60, 50, 20, 2, assets.tankEnemySprite, 40);
    this.shield = 15;
    this.maxShield = 15;
    this.shieldActive = true;
    this.assets = assets;
    this.shieldBreakTimer = 0;
  }
  update() {
    super.update();
    if (this.shieldActive && this.shield <= 0) {
      this.shieldActive = false;
      this.shieldBreakTimer = 15;
    }
    if (this.shieldBreakTimer > 0) {
      this.shieldBreakTimer--;
    }
  }
  takeDamage(amount) {
    if (this.shieldActive) {
      this.shield -= amount;
      if (this.shield <= 0) {
        this.shieldActive = false;
        this.shield = 0;
      }
    } else {
      this.health -= amount;
    }
  }
  show() {
    if (this.shieldBreakTimer > 0) {
      push();
      tint(255, 255, 255, 200);
      super.show();
      pop();
    } else if (!this.shieldActive) {
      push();
      tint(255, 100, 100, 220);
      super.show();
      pop();
    } else {
      super.show();
    }
    if (this.shieldActive) {
      noFill();
      stroke(0, 200, 255, 180);
      strokeWeight(3);
      ellipse(this.x, this.y, this.size + 10);
      strokeWeight(1);
    }
  }
}
