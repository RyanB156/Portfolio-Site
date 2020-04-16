import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Entity } from './Entity';
import { ObjectMesh } from './ObjectMesh';


@Component({
  selector: 'app-shooter',
  templateUrl: './shooter.component.html',
  styleUrls: ['./shooter.component.scss']
})
export class ShooterComponent implements AfterViewInit {

  document: any;
  canvas: any;
  ctx: any;
  size: number;
  halfsize: number;
  width: number;
  height: number;
  boxWidth: number;
  boxHeight: number;
  canvasRect: any;
  entities = [];
  player: Entity;
  gamemode: string
  running = true;

  defaultEnemyCount = 2;
  defaultFireRate = 0.05;
  defaultViewDistance = 200;
  enemycount = this.defaultEnemyCount;
  firerate = this.defaultFireRate;
  viewdistance = this.defaultViewDistance;
  entityCap = 20;
  boxSize = 50;

  time = 0;
  updateRate = 1000 / 18;
  lastRender = 0

  gamemodes = {team: 'team', ffa: 'ffa'};


  keys = {a: 65, w: 87, d: 68, s: 83, r: 82, space: 32, escape: 27, v: 86};

  _pressed = {};
  left = this.keys.a;
  up = this.keys.w;
  right = this.keys.d;
  down = this.keys.s;

  constructor(@Inject(DOCUMENT) document) { 

    this.document = document;
  }

  ngAfterViewInit(): void {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasRect = this.canvas.getBoundingClientRect();
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.resize();

    this.player = new Entity(this.width / 2, this.height / 2, 0, 0, Entity.entityType.PLAYER, Entity.sizes.player);
    this.entities.push(new Entity(this.width / 2, this.height / 2, 0, 0, Entity.entityType.ENEMY, Entity.sizes.enemy));

    for (var i = 0; i < this.enemycount; i++)
      this.randomEnemy();

    this.gamemode = this.gamemodes.team;

    window.requestAnimationFrame(this.loop);
    window.addEventListener('keydown', (event) => { this.keydown(event); });
    window.addEventListener('keyup', (event) => { this.checkKeyUp(event); });
    this.canvas.addEventListener('mousemove', (event) => { this.playerAim(this.getMousePos(event)); });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight - 25;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.canvasRect = this.canvas.getBoundingClientRect();
  }

  // Keyboard control
  isDown(keyCode) {
    return this._pressed[keyCode];
  }
  keydown(event) {
    //console.log(event.keyCode);
    switch (event.keyCode) {
      case this.keys.a: this.player.vel.x = -this.player.speed; break;
      case this.keys.w: this.player.vel.y = -this.player.speed; break;
      case this.keys.d: this.player.vel.x = this.player.speed; break;
      case this.keys.s: this.player.vel.y = this.player.speed; break;
    }
    this._pressed[event.keyCode] = true;
  }
  keyup(event) {
    switch (event.keyCode) {
      case this.keys.a: this.player.vel.x = this.isDown(this.right) ? this.player.speed : 0; break;
      case this.keys.d: this.player.vel.x = this.isDown(this.left) ? -this.player.speed : 0; break;
      case this.keys.s: this.player.vel.y = this.isDown(this.up) ? -this.player.speed : 0; break;
      case this.keys.w: this.player.vel.y = this.isDown(this.down) ? this.player.speed : 0; break;
    }
    delete this._pressed[event.keyCode];
  }
  //

  randomPoint() {
    return { x: Math.random() * this.width, y: Math.random() * this.height };
  }

  spawnEnemy(x, y) {
    var e = new Entity(x, y, 0, 0,  Entity.entityType.ENEMY, Entity.sizes.enemy);
    var pt = this.randomPoint();
    e.goto(pt.x, pt.y);
    this.entities.push(e);
  }

  randomEnemy() {
    var pt = this.randomPoint();
    this.spawnEnemy(pt.x, pt.y);
  }

  sqrDist(a, b) {
    return Math.pow((b.x - a.x), 2) + Math.pow((b.y - a.y), 2);
  }

// Need smoother movement. E.g. Holding left then pressing and releasing right stops the player and the player must press left again.

  playerAim(mousePos) {
    this.player.target = mousePos;
  }

  checkKeyUp(event) {
    console.log(event.keyCode);
    if (event.keyCode == this.keys.v)
      this.entities.push(this.player.spawnBullet(this.player.target.x, this.player.target.y));
    else if (event.keyCode == this.keys.r)
      this.reset();
    else if (event.keyCode == this.keys.escape) {
      this.running = !this.running;
    }
    else
        this.keyup(event);
  }


  reset() {
    this.player = new Entity(this.width / 2, this.height / 2, 0, 0, Entity.entityType.PLAYER, Entity.sizes.player);
    this.entities = [];
    this.enemycount = this.defaultEnemyCount;
    this.firerate = this.defaultFireRate;
    this.viewdistance = this.defaultViewDistance;

    // *** Don't forget to remove this...
    for (var i = 0; i < this.enemycount; i++)
      this.randomEnemy();
  }

  // Apply updates to entities including moving the player, enemies, and bullets.
  update = (progress) => {

    if (this.running) {
      if (this.player.alive) {
        this.player.move(this.height, this.width);
      }

    // Check for collisions between bullets and other entities.
    var allEntities = this.entities.concat([this.player]);
    var mesh = new ObjectMesh(this.width, this.height, this.boxSize, allEntities);

    for (var i = 0; i < this.entities.length; i++) {
      var e = this.entities[i];
      if (e.alive) {
        //e.move(this.width, this.height); TODO: Make them move again!!!
        if (e.entityType == Entity.entityType.BULLET) {
          var nearbyEntities = mesh.checkCollisions(e, 150);

          for (var j = 0; j < nearbyEntities.length; j++) {
            var n = nearbyEntities[j];
            if (nearbyEntities.length > 0)
                console.log("Nearby entities: " + nearbyEntities);

            // The other entity does not have a matching tag, is not a bullet, and the bullet is inside it.
            if (n.tag !== e.tag && n.entityType !== Entity.entityType.BULLET && this.sqrDist(e.pos, n.pos) < n.size * n.size) {
              if (this.gamemode === this.gamemodes.team && n.team !== e.team) {
                //console.log('killing ' + n.tag);
                e.alive = false;
              n.alive = false;
              }
                  
            }
          }
        } else if (e.entityType === Entity.entityType.ENEMY) {
          var nearbyEntities = mesh.checkCollisions(e, this.viewdistance); // Find other entities that are roughly within 100 units of this entity.

          for (var j = 0; j < nearbyEntities.length; j++) {
            var n = nearbyEntities[j];
            if (this.gamemode === this.gamemodes.team && n.entityType !== e.entityType && n.entityType !== Entity.entityType.BULLET) {
              e.target = n.pos; // May adjust for velocity later...
              e.hasTarget = true;
              break;
            }
            e.hasTarget = false; // Remove target if no enemies are in range.
          }

          if (Math.random() < this.firerate && e.hasTarget && this.entities.length < this.entityCap) {
            this.entities.push(e.spawnBullet(e.target.x, e.target.y));
          }

          if (this.sqrDist(e.pos, e.movePoint) < e.size) {
            e.stop();
            if (Math.random() < Entity.enemyMoveChance) {
              var pt = this.randomPoint();
              e.goto(pt.x, pt.y);
            }
          }
        }
      }
    }

    var len = this.entities.length;
    for (var i = 0; i < len; i++) {
      var e = this.entities[i];
      if (!e.alive) {
        this.entities.splice(i, 1);
          len--;
          continue;
      }
    }
  }
    
}

/*
    TODO:
        Add entity collisions with walls.
        Move method in the Entity class. This will check for collisions and stop Entities (player and enemies) or remove them (bullets)
            when they hit a wall.
        Allow player to shoot bullets. Will need mouse event for left click and adding new entities with a set initial velocity.
        Test collision mesh between bullets and other Entities. Check the tag to ensure Entities do not kill themselves.
        Stop game when player dies (Loss).
        Stop game when player wins (Win). All enemies must be defeated (keep track of the number with a simple counter).
        Enemies that move and attack other. Check for next enemy using the ObjectMesh.
        ...
*/
draw = () => {
  this.ctx.clearRect(0, 0, this.width, this.height);

  this.ctx.fillStyle = this.player.alive ? 'blue' : 'black';
  this.ctx.beginPath();
  this.ctx.ellipse(this.player.pos.x, this.player.pos.y, this.player.size, this.player.size, 0, 0, 2 * Math.PI);
  this.ctx.fill();

  this.ctx.fillStyle = 'red';
  for (var i = 0; i < this.entities.length; i++) {
    var e = this.entities[i];
    this.ctx.beginPath();
    this.ctx.ellipse(e.pos.x, e.pos.y, e.size, e.size, 0, 0, 2 * Math.PI);
    this.ctx.fill();
  }
}

strPair(a, b) {
    return '(' + a + ', ' + b + ')';
}

// Gameloop.
loop = (timestamp) => {
    var progress = timestamp - this.lastRender;
    this.update(progress);

    this.time += progress;
    if (this.time >= this.updateRate) {
        this.update(progress);
        this.time = 0;
    }

    this.draw();
    this.lastRender = timestamp;
    window.requestAnimationFrame(this.loop);
}

// Get mouse position relative to the canvas.
getMousePos(evt) {
    var rect = this.canvasRect;
    return {x: evt.clientX - rect.left, y: evt.clientY - rect.top};
  }

}


