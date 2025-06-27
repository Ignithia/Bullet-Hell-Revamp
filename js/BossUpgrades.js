export const BossUpgrades = [
  {
    name: "Overcharged Blaster",
    effect: "+50% fire rate",
    drawback: "-20% damage",
    rarity: "epic",
  },
  {
    name: "Glass Cannon",
    effect: "+100% damage",
    drawback: "Take double damage",
    rarity: "legendary",
  },
  {
    name: "Iron Plating",
    effect: "+5 max health",
    drawback: "-20% speed",
    rarity: "rare",
  },
  {
    name: "Vampiric Core",
    effect: "Heal 1 HP every 5 kills",
    drawback: "-10% fire rate",
    rarity: "epic",
  },
  {
    name: "Temporal Distortion",
    effect: "Slow all enemies by 20%",
    drawback: "-10% damage",
    rarity: "epic",
  },
  {
    name: "Adaptive Shields",
    effect: "Gain a shield every 30 seconds",
    drawback: "-10% fire rate",
    rarity: "rare",
  },
  {
    name: "Berserker Mode",
    effect: "+30% damage when below 50% HP",
    drawback: "Lose 1 HP every 10 seconds",
    rarity: "epic",
  },
  {
    name: "Nano Repair Bots",
    effect: "Regenerate 1 HP every 10 seconds",
    drawback: "-10% speed",
    rarity: "rare",
  },
  {
    name: "Explosive Payload",
    effect: "Bullets explode on kill",
    drawback: "-20% fire rate",
    rarity: "legendary",
  },
  {
    name: "Quantum Splitter",
    effect: "33% Chance to fire double bullets",
    drawback: "- 15% fire rate",
    rarity: "epic",
  },
  {
    name: "Reactive Armor",
    effect: "Negate first hit every 30 seconds",
    drawback: "-10% speed",
    rarity: "legendary",
  },
  {
    name: "Overdrive Engine",
    effect: "+30% speed",
    drawback: "-3 max health",
    rarity: "epic",
  },
  {
    name: "Precision Targeting",
    effect: "+50% critical hit chance",
    drawback: "-15% fire rate",
    rarity: "epic",
  },
  {
    name: "Energy Overflow",
    effect: "+20% fire rate, +20% damage",
    drawback: "Lose 1 HP every 60 seconds",
    rarity: "legendary",
  },
];

export function getBossUpgradeChoices(level) {
  const rarityWeights = {
    common: 60 - Math.min(level, 40),
    rare: 30 + Math.floor(level / 4),
    epic: Math.max(5, Math.floor(level / 2)),
    legendary: Math.max(1, Math.floor(level / 3)),
  };
  const pool = [];
  BossUpgrades.forEach((upg) => {
    const w = rarityWeights[upg.rarity] || 10;
    for (let i = 0; i < w; i++) pool.push(upg);
  });
  const choices = [];
  while (choices.length < 3 && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    const pick = pool[idx];
    if (!choices.includes(pick)) choices.push(pick);
    pool.splice(idx, 1);
  }
  return choices;
}
