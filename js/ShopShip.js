import { upgradeTree } from "./upgradeTree.js";

function getUpgradeNode(type, branch, key) {
  return upgradeTree[type] && upgradeTree[type][branch]
    ? upgradeTree[type][branch][key] || upgradeTree[type][branch].base
    : null;
}

function isUpgradeUnlocked(node, playerProgress) {
  if (!node.unlock) return true;
  if (typeof node.unlock === "function") {
    const player = {
      level: playerProgress.level,
      hasUpgrade: () => false,
    };
    return node.unlock(player);
  }
  if (typeof node.unlock === "object" && node.unlock.level) {
    return playerProgress.level >= node.unlock.level;
  }
  return true;
}

function getAllUpgrades(tree, playerProgress, topLevelType) {
  const upgrades = [];
  for (const branch in tree) {
    for (const key in tree[branch]) {
      let node = tree[branch][key];
      if (isUpgradeUnlocked(node, playerProgress)) {
        upgrades.push({
          type: topLevelType,
          branch: branch,
          key: key,
          upgrade: node.name,
          next: node.next,
        });
      }
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
      ...getAllUpgrades(upgradeTree.stats, this.playerProgress, "stats"),
      ...getAllUpgrades(upgradeTree.weapons, this.playerProgress, "weapons"),
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

    let shipY = height / 2 - 220;
    if (
      window.game &&
      window.game.assets &&
      window.game.assets.ancientBossSprite
    ) {
      imageMode(CENTER);
      image(window.game.assets.ancientBossSprite, width / 2, shipY, 64, 64);
      imageMode(CORNER);
    }

    const boxY = height / 2 - 140;
    fill(30, 30, 30, 220);
    rect(width / 2 - 220, boxY, 440, 320, 16);

    fill(255);
    textAlign(CENTER, TOP);
    textSize(32);
    text("Shop Ship", width / 2, boxY + 20);
    textSize(20);

    for (let i = 0; i < this.inventory.length; i++) {
      const item = this.inventory[i];

      let node =
        upgradeTree[item.type] &&
        upgradeTree[item.type][item.branch] &&
        upgradeTree[item.type][item.branch][item.key]
          ? upgradeTree[item.type][item.branch][item.key]
          : null;

      if (
        !node &&
        upgradeTree[item.type] &&
        upgradeTree[item.type][item.branch]
      ) {
        node = upgradeTree[item.type][item.branch].base;
      }
      node = node || item;

      const y = boxY + 60 + i * 90;

      if (node.icon && window.loadImage) {
        let iconImg = null;
        if (window.game && window.game.assets) {
          const iconKey = node.icon
            .replace(/^.*[\\/]/, "")
            .replace(/\.[^.]+$/, "");
          for (const k in window.game.assets) {
            if (k.toLowerCase().includes(iconKey.toLowerCase())) {
              iconImg = window.game.assets[k];
              break;
            }
          }
        }
        if (iconImg) {
          image(iconImg, width / 2 - 150, y + 18, 36, 36);
        } else {
          fill(80);
          rect(width / 2 - 150, y + 18, 36, 36, 6);
          fill(255);
        }
      }

      let rarityColor = {
        common: [200, 200, 200],
        rare: [80, 180, 255],
        epic: [180, 80, 255],
        legendary: [255, 200, 60],
      }[node.rarity] || [255];

      fill(...rarityColor);
      textAlign(LEFT, TOP);
      textSize(20);
      text(
        `${i + 1}: ${node.name || "??"} [${
          node.rarity ? node.rarity.toUpperCase() : "?"
        }]`,
        width / 2 - 100,
        y
      );
      fill(255);
      textSize(15);
      text(`Type: ${item.type}   $${item.price}`, width / 2 - 100, y + 26);
      textSize(13);
      text(node.description || "", width / 2 - 100, y + 46, 260, 40);
    }
    textAlign(CENTER, TOP);
    textSize(18);
    text(
      "Press 1, 2, or 3 to purchase. Press ESC to exit shop.",
      width / 2,
      height / 2 + 160
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
