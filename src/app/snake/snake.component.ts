import { Component, OnInit, Inject, AfterViewInit, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-snake',
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.scss']
})

export class SnakeComponent implements OnInit, AfterViewInit {

  document: any;
  canvas: any;
  ctx: any;
  size: number;
  halfsize: number;
  width: number;
  height: number;
  boxWidth: number;
  boxHeight: number;
  running: boolean;
  apple: OrderedPair;

  body: OrderedPair[]; // Store the body of the snake as an array of ordered pairs.
  dir: Direction; // The direction the head will travel in.

  time: number;
  updateRate: number;
  lastRender: number;

  constructor(@Inject(DOCUMENT) document) { 

    this.document = document;

    this.dir = new Direction();

    // Create the body with 2 segments.
    this.body = new Array();
    this.body.unshift(new OrderedPair(1, 1));
    this.body.unshift(new OrderedPair(2, 1));
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.canvas = this.document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    
    this.running = true;

    this.size = 50;
    this.halfsize = this.size / 2;

    // Set the size of the window.
    window.onresize = this.resize;
    this.resize();

    this.time = 0;
    this.updateRate = 1000 / 24;

    this.lastRender = 0;

    this.apple = this.spawnApple();

    // Set window to update the game on loop.
    window.requestAnimationFrame(this.loop);
    window.addEventListener('keyup', (event) => this.dir.onKeyup(event), false);
  }

  // Set size of the canvas and boxes based on the size of the window.
  resize() {
    this.width = window.innerWidth * 2;
    this.height = window.innerHeight * 2;
    this.canvas.width = this.width - this.width % this.size;
    this.canvas.height = this.height - this.height % this.size;
    this.boxWidth = this.canvas.width / this.size;
    this.boxHeight = this.canvas.height / this.size;
  }

  // Generate a new apple to add to the game.
  spawnApple() {
    var pair = new OrderedPair(Math.floor(Math.random() * this.boxWidth), Math.floor(Math.random() * this.boxHeight));
    return pair;
  }

  // Make the snake wrap around the screen.
  wrap(low, high, value) {
    if (value < low)
      return high - (low - value);
    else if (value > high - 1)
      return low + (value - high - 1);
    else return value;
  }

  // Update loop.
  update = (progress) => {
    var ate = false;

    // Move the snake.
    if (this.dir.up) {
      this.body.unshift(new OrderedPair(this.body[0].x, this.body[0].y - 1));
    } else if (this.dir.right) {
      this.body.unshift(new OrderedPair(this.body[0].x + 1, this.body[0].y));
    } else if (this.dir.down) {
      this.body.unshift(new OrderedPair(this.body[0].x, this.body[0].y + 1));
    } else if (this.dir.left) {
      this.body.unshift(new OrderedPair(this.body[0].x - 1, this.body[0].y));
    } else {
      throw new Error('Invalid Direction');
    }

    // Wrap the snake around the screen.
    this.body[0].x = this.wrap(0, this.boxWidth, this.body[0].x);
    this.body[0].y = this.wrap(0, this.boxHeight, this.body[0].y);

    // Check for collisions between the head of the snake and its tail.
    this.body.slice(1, this.body.length - 1).forEach((pair) => {
      if (pair.x === this.body[0].x && pair.y === this.body[0].y) {
        this.running = false;
      }
    });
      
    // Check if the snake ate an apple.
    if (this.body[0].x === this.apple.x && this.body[0].y === this.apple.y) {
      ate = true;
      this.apple = this.spawnApple();
    }

    if (!ate)
      this.body.pop();
  }

  up() {
    this.dir.tryUp();
  }

  right() {
    this.dir.tryRight();
  }

  down() {
    this.dir.tryDown();
  }

  left() {
    this.dir.tryLeft();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = 'blue';

    // Draw the snake.
    this.body.forEach((pair) => {
      this.ctx.fillRect(pair.x * this.size, pair.y * this.size, this.size, this.size);
    });
    // Draw the apple.
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(this.apple.x * this.size, this.apple.y * this.size, this.size, this.size);
    
  }

  loop = (timestamp : number) => {
    if (this.running) {
      var progress = (timestamp - this.lastRender);

      this.time += progress;
      if (this.time > this.updateRate) {
        this.update(progress);
        this.time = 0;
      }
      
      this.draw();
      
      this.lastRender = timestamp;
      window.requestAnimationFrame(this.loop);
    }
  }

}

class OrderedPair {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  toString(): string {
    return `(${this.x}, ${this.y})`;
  }
}

// Handles the direction of the snake and maps keyboard event codes to directions.
class Direction {
  up: boolean;
  right: boolean; // Start moving to the right.
  down: boolean;
  left: boolean;

  constructor() {
    this.right = true;
  }

  reset() {
    this.up = false; this.right = false; this.down = false; this.left = false;
  }

  tryUp() {
    if (!this.down) { 
      this.reset(); 
      this.up = true; 
    }
  }

  tryRight() {
    if (!this.left) { 
      this.reset(); 
      this.right = true; 
    }
  }

  tryDown() {
    if (!this.up) { 
      this.reset(); 
      this.down = true; 
    }
  }

  tryLeft() {
    if (!this.right) { 
      this.reset(); 
      this.left = true; 
    } 
  }

  onKeyup(event) {
    console.log(`Received keycode ${event.keyCode}`);
    switch (event.keyCode) {
      case 65:
      case 37: this.tryLeft(); break;
      case 87:
      case 38: this.tryUp(); break;
      case 68:
      case 39: this.tryRight(); break;
      case 83:
      case 40: this.tryDown(); break;
    }
  }
  
}