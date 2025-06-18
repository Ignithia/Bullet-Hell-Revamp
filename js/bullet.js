export class Bullet {
  constructor(
    x,
    y,
    damage,
    speed = -400,
    size = Bullet.defaultSize || 5,
    angle = null,
    assets = null,
    isEnemy = false
  ) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.damage = damage;
    if (angle !== null) {
      this.xspeed = speed * cos(angle);
      this.yspeed = speed * sin(angle);
    } else {
      this.xspeed = 0;
      this.yspeed = speed;
    }
    this.assets = assets;
    this.isEnemy = isEnemy;
  }

  update() {
    this.x += (this.xspeed * deltaTime) / 1000;
    this.y += (this.yspeed * deltaTime) / 1000;
  }

  show() {
    imageMode(CENTER);
    if (this.assets) {
      if (this.isEnemy && this.assets.bomberBulletSprite && this.size > 10) {
        push();
        translate(this.x, this.y);
        rotate(PI);
        image(this.assets.bomberBulletSprite, 0, 0, this.size, this.size);
        pop();
      } else if (this.isEnemy && this.assets.enemyBulletSprite) {
        image(
          this.assets.enemyBulletSprite,
          this.x,
          this.y,
          this.size,
          this.size
        );
      } else if (!this.isEnemy && this.assets.bulletSprite) {
        image(this.assets.bulletSprite, this.x, this.y, this.size, this.size);
      } else {
        ellipse(this.x, this.y, this.size, this.size);
      }
    }
  }
  static setSize(newSize) {
    Bullet.defaultSize = newSize;
  }
}
Bullet.defaultSize = 5;
