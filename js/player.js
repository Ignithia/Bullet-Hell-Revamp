export class Player {
  constructor(assets, speed = 500) {
    this.x = width / 2;
    this.y = height - 50;
    this.size = 40;
    this.speed = speed;
    this.tripleShot = false;
    this.invincible = false;
    this.damage = 5;
    this.health = 10;
    this.maxHealth = 10;
    this.assets = assets;
  }

  update() {}

  show() {
    imageMode(CENTER);
    if (this.invincible) {
      push();
      let alpha = frameCount % 20 < 10 ? 180 : 80;
      tint(255, 255, 100, alpha);
      image(this.assets.playerSprite, this.x, this.y, this.size, this.size);
      pop();
    } else {
      image(this.assets.playerSprite, this.x, this.y, this.size, this.size);
    }
  }
}
