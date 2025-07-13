import {
  NormalEnemy,
  FastEnemy,
  Bomber,
  LaserDrone,
  TankShieldedEnemy,
} from "./enemy.js";

const ENEMY_GROUPS = {
  basic: { enemy1: { type: "NormalEnemy", count: 6 } },
  laser: { enemy1: { type: "LaserDrone", count: 4 } },
  tank: { enemy1: { type: "TankShieldedEnemy", count: 3 } },
  bomber: { enemy1: { type: "Bomber", count: 2 } },
  fast: { enemy1: { type: "FastEnemy", count: 8 } },
};

const MIXED_GROUPS = [
  {
    enemy1: { type: "NormalEnemy", count: 4 },
    enemy2: { type: "LaserDrone", count: 2 },
  },
  {
    enemy1: { type: "TankShieldedEnemy", count: 2 },
    enemy2: { type: "Bomber", count: 2 },
  },
  {
    enemy1: { type: "FastEnemy", count: 5 },
    enemy2: { type: "NormalEnemy", count: 3 },
  },
  {
    enemy1: { type: "LaserDrone", count: 3 },
    enemy2: { type: "Bomber", count: 1 },
  },
  {
    enemy1: { type: "TankShieldedEnemy", count: 1 },
    enemy2: { type: "FastEnemy", count: 6 },
  },
  {
    enemy1: { type: "Bomber", count: 2 },
    enemy2: { type: "NormalEnemy", count: 4 },
  },
  {
    enemy1: { type: "LaserDrone", count: 2 },
    enemy2: { type: "FastEnemy", count: 4 },
  },
  {
    enemy1: { type: "TankShieldedEnemy", count: 2 },
    enemy2: { type: "NormalEnemy", count: 4 },
  },
  {
    enemy1: { type: "Bomber", count: 1 },
    enemy2: { type: "FastEnemy", count: 7 },
  },
  {
    enemy1: { type: "LaserDrone", count: 2 },
    enemy2: { type: "TankShieldedEnemy", count: 2 },
    enemy3: { type: "NormalEnemy", count: 2 },
  },
];

const WAVE_CONFIGS_PREBOSS = [
  [ENEMY_GROUPS.basic],
  [ENEMY_GROUPS.basic, ENEMY_GROUPS.fast],
  [ENEMY_GROUPS.basic, ENEMY_GROUPS.laser],
  [ENEMY_GROUPS.tank, ENEMY_GROUPS.laser],
];
const WAVE_CONFIGS_POSTBOSS = [
  [MIXED_GROUPS[0], MIXED_GROUPS[1]],
  [MIXED_GROUPS[2], MIXED_GROUPS[3]],
  [MIXED_GROUPS[8], MIXED_GROUPS[8], MIXED_GROUPS[8]],
  [MIXED_GROUPS[1], MIXED_GROUPS[4], MIXED_GROUPS[7], MIXED_GROUPS[9]],
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getProceduralGroups(waveNum) {
  const allGroups = [...Object.values(ENEMY_GROUPS), ...MIXED_GROUPS];
  const numGroups = randInt(2, 3);
  const selected = [];
  const used = new Set();
  while (selected.length < numGroups) {
    const idx = randInt(0, allGroups.length - 1);
    if (!used.has(idx)) {
      used.add(idx);
      const group = JSON.parse(JSON.stringify(allGroups[idx]));
      for (const key in group) {
        group[key].count = Math.ceil(
          group[key].count * (1 + (0.5 * (waveNum - 10)) / 10)
        );
      }
      selected.push(group);
    }
  }
  return selected;
}

const typeMap = {
  NormalEnemy,
  FastEnemy,
  Bomber,
  LaserDrone,
  TankShieldedEnemy,
};

function spawnEnemyGroup(game, group, wave) {
  for (const key in group) {
    const { type, count } = group[key];
    const EnemyClass = typeMap[type];
    for (let i = 0; i < count; i++) {
      const x = random(40, width - 40);
      const y = random(-120, -40);
      const enemy = new EnemyClass(x, y, game.assets);
      if (wave > 10) {
        enemy.health += Math.floor(wave * 1.5);
        enemy.damage += Math.floor(wave / 10);
      }
      game.enemies.push(enemy);
    }
  }
}

export function spawnWave(game, currentWaveNumber) {
  let groupsToSpawn;
  if (currentWaveNumber <= 5) {
    groupsToSpawn = WAVE_CONFIGS_PREBOSS[currentWaveNumber - 1];
  } else if (currentWaveNumber > 5 && currentWaveNumber <= 10) {
    let index = 0;
    groupsToSpawn = WAVE_CONFIGS_POSTBOSS[index];
    index++;
  } else {
    groupsToSpawn = getProceduralGroups(currentWaveNumber);
  }
  groupsToSpawn.forEach((group) =>
    spawnEnemyGroup(game, group, currentWaveNumber)
  );
}
