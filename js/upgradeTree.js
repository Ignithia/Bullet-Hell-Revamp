export const upgradeTree = {
  stats: {
    speed: {
      base: { name: "Speed Up", next: ["dash", "evasion"] },
      dash: { name: "Dash Boost", next: [] },
      evasion: { name: "Evasion", next: [] },
    },
    health: {
      base: { name: "Extra Health", next: ["regen", "shield"] },
      regen: { name: "Regeneration", next: [] },
      shield: { name: "Temporary Shield", next: [] },
    },
  },
  weapons: {
    bullet: {
      base: { name: "Bigger Bullets", next: ["piercing", "explosive"] },
      piercing: { name: "Piercing Bullets", next: [] },
      explosive: { name: "Explosive Bullets", next: [] },
    },
    laser: {
      base: { name: "Laser", next: ["split", "continuous"] },
      split: { name: "Split Laser", next: [] },
      continuous: { name: "Continuous Laser", next: [] },
    },
  },
};
