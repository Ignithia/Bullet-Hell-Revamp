export class Player {
  constructor(assets, speed = 200) {
    this.x = width / 2;
    this.y = height - 50;
    this.size = 40;
    this.speed = speed;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.acceleration = 10;
    this.tripleShot = false;
    this.invincible = false;
    this.damage = 5;
    this.health = 10;
    this.maxHealth = 10;
    this.assets = assets;
  }

  update() {
    const maxSpeed = this.speed;

    if (keyIsDown(LEFT_ARROW)) {
      this.xSpeed = max(this.xSpeed - this.acceleration, -maxSpeed);
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.xSpeed = min(this.xSpeed + this.acceleration, maxSpeed);
    }
    if (!keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW)) {
      this.xSpeed *= 0.9;
    }

    if (keyIsDown(UP_ARROW)) {
      this.ySpeed = max(this.ySpeed - this.acceleration, -maxSpeed);
    }
    if (keyIsDown(DOWN_ARROW)) {
      this.ySpeed = min(this.ySpeed + this.acceleration, maxSpeed);
    }
    if (!keyIsDown(UP_ARROW) && !keyIsDown(DOWN_ARROW)) {
      this.ySpeed *= 0.9;
    }

    this.x += (this.xSpeed * deltaTime) / 1000;
    this.y += (this.ySpeed * deltaTime) / 1000;

    this.x = constrain(this.x, 0, width);
    this.y = constrain(this.y, 0, height);
  }

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
