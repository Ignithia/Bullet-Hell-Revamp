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

export function applyBossUpgrade(game, upg) {
  if (!game.player) return;
  if (!game.hasOwnProperty("playerFireRate")) game.playerFireRate = 300;
  if (!game.hasOwnProperty("playerSpeed")) game.playerSpeed = 300;
  if (!game.hasOwnProperty("maxPlayerHealth")) game.maxPlayerHealth = 10;
  if (!game.hasOwnProperty("playerHealth")) game.playerHealth = 10;
  if (!game.player.hasOwnProperty("damage")) game.player.damage = 5;
  if (!game.player.hasOwnProperty("speed"))
    game.player.speed = game.playerSpeed;
  if (!game.player.hasOwnProperty("health"))
    game.player.health = game.playerHealth;
  if (!game.player.hasOwnProperty("maxHealth"))
    game.player.maxHealth = game.maxPlayerHealth;

  switch (upg.name) {
    case "Overcharged Blaster":
      game.playerFireRate = Math.floor(game.playerFireRate * 0.5);
      game.player.damage = Math.floor(game.player.damage * 0.8);
      break;
    case "Glass Cannon":
      game.player.damage = Math.floor(game.player.damage * 2);
      game.player.takeDoubleDamage = true;
      break;
    case "Iron Plating":
      game.maxPlayerHealth += 5;
      game.playerHealth += 5;
      game.player.speed = Math.floor(game.player.speed * 0.8);
      game.playerSpeed = game.player.speed;
      break;
    case "Vampiric Core":
      game.player.vampiricKills = 0;
      game.player.vampiricCore = true;
      break;
    case "Temporal Distortion":
      game.temporalDistortion = true;
      game.temporalDistortionApplied = false;
      break;
    case "Adaptive Shields":
      game.player.adaptiveShield = true;
      break;
    case "Berserker Mode":
      game.player.berserkerMode = true;
      break;
    case "Nano Repair Bots":
      if (!game.player.nanoRepairInterval) {
        game.player.nanoRepairInterval = setInterval(() => {
          if (game.player.health < game.maxPlayerHealth) {
            game.player.health++;
          }
        }, 10000);
      }
      game.player.speed = Math.floor(game.player.speed * 0.9);
      game.playerSpeed = game.player.speed;
      break;
    case "Explosive Payload":
      game.player.explosivePayload = true;
      game.playerFireRate = Math.floor(game.playerFireRate * 1.2);
      break;
    case "Quantum Splitter":
      game.player.quantumSplitter = true;
      game.playerFireRate = Math.floor(game.playerFireRate * 1.15);
      break;
    case "Reactive Armor":
      game.player.reactiveArmor = true;
      game.player.speed = Math.floor(game.player.speed * 0.9);
      game.playerSpeed = game.player.speed;
      break;
    case "Overdrive Engine":
      game.player.speed = Math.floor(game.player.speed * 1.3);
      game.playerSpeed = game.player.speed;
      game.maxPlayerHealth -= 3;
      if (game.player.health > game.maxPlayerHealth) {
        game.player.health = game.maxPlayerHealth;
      }
      break;
    case "Precision Targeting":
      game.player.criticalChance = 0.5;
      game.playerFireRate = Math.floor(game.playerFireRate * 1.15);
      break;
    case "Energy Overflow":
      game.playerFireRate = Math.floor(game.playerFireRate * 0.8);
      game.player.damage = Math.floor(game.player.damage * 1.2);
      game.player.energyOverflow = true;
      break;
    default:
      break;
  }
}
