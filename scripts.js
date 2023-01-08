class Rectangle {
  velocity = {
    x: 0,
    y: 0,
  };

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

  update() {
    if (this.game.key && this.game.key == "w") {
      this.velocity.y -= 1;
    }

    if (this.game.key && this.game.key == "s") {
      this.velocity.y += 1;
    }

    if (this.game.key && this.game.key == "a") {
      this.velocity.x -= 1;
    }

    if (this.game.key && this.game.key == "d") {
      this.velocity.x += 1;
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    this.velocity.x = 0;
    this.velocity.y = 0;
  }
}

class Game {
  canvas = document.createElement("canvas");
  gameObjects = [];
  key = false;

  start() {
    var t = this;

    window.addEventListener("keydown", function (event) {
      t.key = event.key;
    });

    window.addEventListener("keyup", function (event) {
      t.key = false;
    });

    this.canvas.width = document.body.clientWidth;
    this.canvas.height = window.innerHeight - 200;
    this.context = this.canvas.getContext("2d");

    document.body.insertBefore(this.canvas, document.body.childNodes[0]);

    this.interval = setInterval(function () {
      t.update();
    }, 20);
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  update() {
    this.clear();

    for (let i = 0; i < this.gameObjects.length; ++i) {
      this.gameObjects[i].update();
      this.gameObjects[i].draw(this.context);
    }
  }

  addGameObject(gameObject) {
    gameObject.game = this;

    this.gameObjects.push(gameObject);
  }
}

onload = function () {
  const game = new Game();
  const rectangle = new Rectangle(10, 10, 300, 300, "red");

  game.addGameObject(rectangle);
  game.start();
};
