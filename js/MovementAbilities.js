export class MovementAbilities {
  constructor() {
    this.canDash = false;
    this.dashCooldown = 2;
    this.lastDash = -Infinity;
    this.dashDistance = 120;
    this.canTeleport = false;
    this.teleportCharges = 0;
    this.teleportDistance = 300;
  }

  tryDash(currentTime, player, direction) {
    if (
      this.canDash &&
      currentTime - this.lastDash > this.dashCooldown * 1000 &&
      direction &&
      (direction.x !== 0 || direction.y !== 0)
    ) {
      this.lastDash = currentTime;
      player.x += direction.x * this.dashDistance;
      player.y += direction.y * this.dashDistance;
      player.x = constrain(player.x, 0, width);
      player.y = constrain(player.y, 0, height);
      return true;
    }
    return false;
  }

  tryTeleport(player, targetX, targetY) {
    if (this.canTeleport && this.teleportCharges > 0) {
      this.teleportCharges--;
      const dx = targetX - player.x;
      const dy = targetY - player.y;
      const distSq = dx * dx + dy * dy;
      const maxDistSq = this.teleportDistance * this.teleportDistance;
      if (distSq > maxDistSq) {
        const angle = Math.atan2(dy, dx);
        player.x += Math.cos(angle) * this.teleportDistance;
        player.y += Math.sin(angle) * this.teleportDistance;
      } else {
        player.x = targetX;
        player.y = targetY;
      }
      player.x = constrain(player.x, 0, width);
      player.y = constrain(player.y, 0, height);
      return true;
    }
    return false;
  }
}
