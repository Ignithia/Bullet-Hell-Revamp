export class PlayerProgress {
  constructor() {
    this.currency = 0;
    this.exp = 0;
    this.level = 1;
    this.expToNext = 100;
    this.leveledUp = false;
  }

  addCurrency(amount) {
    this.currency += amount;
  }

  addExp(amount) {
    this.exp += amount;
    while (this.exp >= this.expToNext) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.exp -= this.expToNext;
    this.expToNext = Math.floor(this.expToNext * 1.2);
    this.leveledUp = true;
  }
}
