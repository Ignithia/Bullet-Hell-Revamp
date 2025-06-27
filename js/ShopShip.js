import { upgradeTree } from "./upgradeTree.js";

function getAllUpgrades(tree) {
  const upgrades = [];
  for (const branch in tree) {
    for (const key in tree[branch]) {
      let node = tree[branch][key];
      upgrades.push({
        type: branch,
        branch: key,
        upgrade: node.name,
        next: node.next,
      });
    }
  }
  return upgrades;
}

export class ShopShip {
  constructor(level, playerProgress, onPurchase = null) {
    this.level = level;
    this.playerProgress = playerProgress;
    this.inventory = this.generateInventory();
    this.onPurchase = onPurchase;
    this.closed = false;
  }

  generateInventory() {
    const allUpgrades = [
      ...getAllUpgrades(upgradeTree.stats),
      ...getAllUpgrades(upgradeTree.weapons),
    ];
    const inventory = [];
    const used = new Set();
    while (inventory.length < 3 && allUpgrades.length > 0) {
      const idx = Math.floor(Math.random() * allUpgrades.length);
      const upg = allUpgrades[idx];
      const key = `${upg.type}-${upg.branch}-${upg.upgrade}`;
      if (!used.has(key)) {
        used.add(key);
        const price = 100 + this.level * 25 + Math.floor(Math.random() * 50);
        inventory.push({ ...upg, price });
      }
      allUpgrades.splice(idx, 1);
    }
    return inventory;
  }

  showShopUI() {
    if (this.closed) return;
    fill(30, 30, 30, 220);
    rect(width / 2 - 220, height / 2 - 160, 440, 320, 16);
    fill(255);
    textAlign(CENTER, TOP);
    textSize(32);
    text("Shop Ship", width / 2, height / 2 - 140);
    textSize(22);
    for (let i = 0; i < this.inventory.length; i++) {
      const item = this.inventory[i];
      const y = height / 2 - 80 + i * 60;
      text(
        `${i + 1}: ${item.upgrade} (${item.type}) - $${item.price}`,
        width / 2,
        y
      );
    }
    textSize(18);
    text(
      "Press 1, 2, or 3 to purchase. Press ESC to exit shop.",
      width / 2,
      height / 2 + 110
    );
  }

  purchase(index) {
    if (this.closed) return false;
    const item = this.inventory[index];
    if (!item) return false;
    if (this.playerProgress.currency >= item.price) {
      this.playerProgress.currency -= item.price;
      this.inventory.splice(index, 1);
      if (typeof this.onPurchase === "function") {
        this.onPurchase(item);
      }
      this.close();
      return true;
    }
    return false;
  }

  close() {
    this.closed = true;
  }

  handleInput(event) {
    if (this.closed) return false;
    if (event.key === "Escape") {
      this.close();
      return true;
    }
    if (event.key === "1" || event.key === "2" || event.key === "3") {
      const idx = Number(event.key) - 1;
      if (this.purchase(idx)) {
        return true;
      }
    }
    return false;
  }
}
