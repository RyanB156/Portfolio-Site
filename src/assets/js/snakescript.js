
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width;
var height;
var boxWidth;
var boxHeight;
var running = true;

var size = 50;
var halfsize = size / 2;

console.log("Running Javascript!")

var resize = function() {
  width = window.innerWidth * 2;
  height = window.innerHeight * 2;
  canvas.width = width - width % size;
  canvas.height = height - height % size;
  boxWidth = canvas.width / size;
  boxHeight = canvas.height / size;
}
window.onresize = resize;
resize();

function spawnApple() {
  return {x: Math.floor(Math.random() * boxWidth), y: Math.floor(Math.random() * boxHeight)};
}

var apple = spawnApple();

class Node {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  // Insert at tail.
  push(x, y) {
    if (this.head === null) {
      this.head = new Node(x, y);
      this.tail = this.head;
      //console.log("Head was null");
    }
    else {
      var n = new Node(x, y); // Create new node.
      this.tail.next = n; // Point the tail's node at the new node.
      this.tail = n; // Move tail to the new node.
      //console.log("Head was not null");
    }
  }
  // Remove at head.
  pop() {
    if (this.head === null)
      throw new RangeError("The linked list does not have any elements to remove");
    var pos = {x: this.head.x, y: this.head.y};
    this.head = this.head.next;
  }
}

var list = new LinkedList();
list.push(1, 1);
list.push(list.head.x + 1, list.head.y);
var length = 2;
document.title = "Length: " + length;

for (var n = list.head; n !== null; n = n.next) {
  console.log("(" + n.x + "," + n.y + ") -> ");
}

var dir = {
  up: false,
  right: true, // Start moving to the right.
  down: false,
  left: false,
  reset: function() {
    this.up = false; this.right = false; this.down = false; this.left = false;
  },
  onKeyup: function(event) {
    console.log("Key: " + event.keyCode);
    switch (event.keyCode) {
      case 37: if (!this.right) { this.reset(); this.left = true; } break;
      case 38: if (!this.down) { this.reset(); this.up = true; } break;
      case 39: if (!this.left) { this.reset(); this.right = true; } break;
      case 40: if (!this.up) { this.reset(); this.down = true; } break;
    }
  }
  
}

function wrap(low, high, value) {
  if (value < low)
    return high - (low - value);
  else if (value > high - 1)
    return low + (value - high - 1);
  else return value;
}

function update(progress) {
  var ate = false;

  // Update code here
  if (dir.up) {
    list.push(list.tail.x, list.tail.y - 1);
    console.log('up');
  } else if (dir.right) {
    list.push(list.tail.x + 1, list.tail.y);
    console.log('right');
  } else if (dir.down) {
    list.push(list.tail.x, list.tail.y + 1);
    console.log('down');
  } else if (dir.left) {
    list.push(list.tail.x - 1, list.tail.y);
    console.log('left');
  } else {
    throw new Error('Invalid Direction');
  }

  list.tail.x = wrap(0, boxWidth, list.tail.x);
  list.tail.y = wrap(0, boxHeight, list.tail.y);

  for (var n = list.head; n != list.tail; n = n.next) {
    if (n.x === list.tail.x && n.y === list.tail.y) {
      document.title = "Game Over: " + length;
      running = false;
    }
  }

  if (list.tail.x === apple.x && list.tail.y === apple.y) {
    ate = true;
    length++;
    document.title = "Length: " + length;
    apple = spawnApple();
  }

  if (!ate)
    list.pop();

}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = 'blue';

  for (var n = list.head; n !== null; n = n.next) {
    //console.log("Drawing " + n.x + " " + n.y);
    ctx.fillRect(n.x * size, n.y * size, size, size);
  }  

  ctx.fillStyle = 'red';
  ctx.fillRect(apple.x * size, apple.y * size, size, size);
  
}

var time = 0;
var updateRate = 1000 / 18;

function loop(timestamp) {
  if (running) {
    var progress = (timestamp - lastRender);

    time += progress;
    if (time > updateRate) {
      update(progress);
      time = 0;
    }
    
    draw();
    
    lastRender = timestamp;
    window.requestAnimationFrame(loop);
  }
}
var lastRender = 0;

window.requestAnimationFrame(loop);
window.addEventListener('keyup', function(event) { dir.onKeyup(event); }, false);