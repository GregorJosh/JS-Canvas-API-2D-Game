class Player {
  onUpdate = null;
  
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
    if (this.onUpdate) {
      this.onUpdate();
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.velocity.x = 0;
    this.velocity.y = 0;
  }
}

class Input {
  static keyboard = false;

  static {
    var t = this;

    window.addEventListener("keydown", function (event) {
      if (!t.keyboard) {
        t.keyboard = [];
      }

      t.keyboard[event.key] = true;
    });

    window.addEventListener("keyup", function (event) {
      t.keyboard[event.key] = false;
    });
  }

  static getKey(key) {
    if (this.keyboard && this.keyboard[key]) {
      return true;
    } else {
      return false;
    }
  }
}

class Game {
  canvas = document.createElement("canvas");
  gameObjects = [];

  start() {
    var t = this;

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
  const player = new Player(10, 10, 28, 48, "images/skeleton_walk_right.png", "image");

  player.onUpdate = function () {
    if (Input.getKey("w")) {
      this.image.src = "images/skeleton_walk_up.png";
      this.velocity.y -= 1;
    }

    if (Input.getKey("s")) {
      this.image.src = "images/skeleton_walk_down.png";
      this.velocity.y += 1;
    }

    if (Input.getKey("a")) {
      this.image.src = "images/skeleton_walk_left.png";
      this.velocity.x -= 1;
    }

    if (Input.getKey("d")) {
      this.image.src = "images/skeleton_walk_right.png";
      this.velocity.x += 1;
    }
  }

  game.addGameObject(player);
  game.start();
};
