class Rectangle {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw(context) {
    context.beginPath();
    context.strokeStyle = this.color;
    context.moveTo(this.x, this.y);
    context.lineTo(this.x + this.width, this.y);
    context.lineTo(this.x + this.width, this.y + this.height);
    context.lineTo(this.x, this.y + this.height);
    context.lineTo(this.x, this.y);
    context.stroke();
  }
}

class Game {
  canvas = document.createElement("canvas");
  gameObjects = [];

  constructor() {}

  start() {
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = window.innerHeight - 200;
    this.context = this.canvas.getContext("2d");

    document.body.insertBefore(this.canvas, document.body.childNodes[0]);

    this.interval = setInterval(this.update(), 20);
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  update() {
    this.clear();

    for (let i = 0; i < this.gameObjects.length; ++i) {
      this.gameObjects[i].draw(this.context);
    }
  }

  addGameObject(gameObject) {
    this.gameObjects.push(gameObject);
  }
}

onload = function () {
  const game = new Game();
  const rectangle = new Rectangle(10, 10, 300, 300, "red");

  game.addGameObject(rectangle);
  game.start();
};
