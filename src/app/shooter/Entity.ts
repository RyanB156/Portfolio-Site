
export class Entity {
  tag = 0;
  running = true;
  walls = {top: 'top', bottom: 'bottom', right: 'right', left: 'left'};
  wallBuffer = 2;
  boxSize = 50;

  entityCap = 40; // Important for performance. Enemies stop firing at this point.

  static entityType = { PLAYER: 'player', ENEMY: 'enemy', BULLET: 'bullet' }
  static sizes = { player: 25, enemy: 25, bullet: 7 };
  static speeds = { player: 5, enemy: 5, bullet: 7 };
  static enemyMoveChance = 0.045;

  pos: any;
  size: number;
  target: any;
  vel: any;
  hasTarget: boolean;
  movePoint: any;
  team: string;
  alive: boolean;
  speed: number;
  type: any;

  constructor(x, y, vx, vy, entityType, size) {
    this.pos = {x: x, y: y};
    this.type = entityType;
    this.size = size;
    this.vel = {x: vx, y: vy};
    this.target = {x: 0, y: 0};
    this.hasTarget = false;
    this.movePoint = {x: 0, y: 0};
    this.tag = this.tag++;
    this.team = entityType;
    this.alive = true;
    switch (entityType) {
      case entityType.BULLET: this.speed = Entity.speeds.bullet; break;
      case entityType.ENEMY: this.speed = Entity.speeds.enemy; break;
      default: this.speed = Entity.speeds.player; break;
    }
  }
  setTag(tag) {
    this.tag = tag;
  }
  setTeam(team) {
    this.team = team;
  }
  stop() {
    this.vel = {x: 0, y: 0};
  }
  move(width, height) {
    if (this.type === Entity.entityType.BULLET) {
      // Bullets will despawn when they collide with a wall.
      if (this.checkCollideWithWall(width, height).hitWall) {
        this.alive = false;
        return;
      }
    }

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }
  goto(x, y) {
    // Use trigonometry to set the velocity so each Entity moves towards its target.
    var dx = x - this.pos.x;
    var dy = y - this.pos.y;
    var angle = Math.atan2(dy, dx);
    this.vel.x = this.speed * Math.cos(angle);
    this.vel.y = this.speed * Math.sin(angle);
    this.movePoint = {x: x, y: y};
  }
  checkCollideWithWall(width, height) {
    var walls = [];
    if (this.pos.x < 0 + this.wallBuffer) // Hit left wall.
      walls.push(this.walls.left);
    if (this.pos.x > width - this.wallBuffer) // Hit right wall.
      walls.push(this.walls.right);
    if (this.pos.y < 0 + this.wallBuffer) // Hit top wall.
      walls.push(this.walls.top);
    if (this.pos.y > height - this.wallBuffer) // Hit bottom wall.
      walls.push(this.walls.bottom);

    var b = walls.length > 0 ? true : false;
    return {hitWall: b, wallsHit: walls};
  }
  // Add bullets in the game that move towards the target location.
  spawnBullet = (tx, ty) => {
    if (this.alive) {
      // Create a new bullet and set the tag so the the firing entity does not kill itself.
      var bullet = new Entity(this.pos.x, this.pos.y, 0, 0, Entity.entityType.BULLET, Entity.sizes.bullet);
      bullet.goto(tx, ty);
      bullet.setTag(this.tag);
      bullet.setTeam(this.type);
      return bullet;
    } else {
      return null;
    }
  }
}