export const PowerUpRarities = {
  COMMON: "common",
  RARE: "rare",
  EPIC: "epic",
  LEGENDARY: "legendary",
};

export const PowerUpTypes = [
  { type: "Triple Shot", rarity: PowerUpRarities.COMMON },
  { type: "Speed Boost", rarity: PowerUpRarities.COMMON },
  { type: "Recovery", rarity: PowerUpRarities.COMMON },
  { type: "Invincibility", rarity: PowerUpRarities.RARE },
  { type: "Smart Bomb", rarity: PowerUpRarities.EPIC },
  { type: "Slow Time", rarity: PowerUpRarities.LEGENDARY },
];

export function getRandomPowerUp(level) {
  const weights = PowerUpTypes.map((pu) => {
    switch (pu.rarity) {
      case PowerUpRarities.COMMON:
        return 60 - Math.min(level, 40);
      case PowerUpRarities.RARE:
        return 30 + Math.floor(level / 4);
      case PowerUpRarities.EPIC:
        return Math.max(5, Math.floor(level / 2));
      case PowerUpRarities.LEGENDARY:
        return Math.max(1, Math.floor(level / 3));
        3;
      default:
        return 10;
    }
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < PowerUpTypes.length; i++) {
    if (r < weights[i]) return PowerUpTypes[i].type;
    r -= weights[i];
  }
  return PowerUpTypes[0].type;
}
