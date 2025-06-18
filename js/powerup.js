export class PowerUp {
  constructor(x, y, type, assets) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.type = type;
    this.speed = 100;
    this.assets = assets;
  }

  update() {
    this.y += (this.speed * deltaTime) / 1000;
  }

  show() {
    if (this.type === "Triple Shot") {
      image(this.assets.tripleshotSprite, this.x, this.y, this.size, this.size);
    } else if (this.type === "Invincibility") {
      image(
        this.assets.invincibilitySprite,
        this.x,
        this.y,
        this.size,
        this.size
      );
    } else if (this.type === "Smart Bomb") {
      image(this.assets.smartBombSprite, this.x, this.y, this.size, this.size);
    } else if (this.type === "Speed Boost") {
      image(this.assets.speedBoostSprite, this.x, this.y, this.size, this.size);
    } else if (this.type === "Recovery") {
      image(this.assets.recoverySprite, this.x, this.y, this.size, this.size);
    }
  }
}
