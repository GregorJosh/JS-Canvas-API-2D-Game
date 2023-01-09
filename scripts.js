class Player {
  velocity = {
    x: 0,
    y: 0,
  };

  position = {
    x: 0,
    y: 0,
  };

  constructor(x, y, width, height, color, type) {
    this.position.x = x;
    this.position.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.type = type;

    if (type == "image") {
      this.image = new Image();
      this.image.src = color;
    }
  }

  draw(context) {
    if (this.type == "image") {
      context.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    } else {
      context.fillStyle = this.color;
      context.fillRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }
  }

  // Metoda Update jest wywoływana po przypisaniu wskaźnika do obiektu gry!

  update() {
    if (this.game.keys && this.game.keys["w"]) {
      this.velocity.y -= 1;
    }

    if (this.game.keys && this.game.keys["s"]) {
      this.velocity.y += 1;
    }

    if (this.game.keys && this.game.keys["a"]) {
      this.velocity.x -= 1;
    }

    if (this.game.keys && this.game.keys["d"]) {
      this.velocity.x += 1;
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.velocity.x = 0;
    this.velocity.y = 0;
  }
}

class Game {
  canvas = document.createElement("canvas");
  gameObjects = [];
  keys = false;

  start() {
    var t = this;

    window.addEventListener("keydown", function (event) {
      if (!t.keys) {
        t.keys = [];
      }
      
      t.keys[event.key] = true;
    });

    window.addEventListener("keyup", function (event) {
      t.keys[event.key] = false;
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

window.onload = function () {
  const game = new Game();
  const player = new Player(10, 10, 28, 48, "images/skeleton.png", "image");

  game.addGameObject(player);
  game.start();
};
