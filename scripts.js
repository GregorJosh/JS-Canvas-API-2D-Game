class Player {
  onUpdate = null;
  animation = 1;
  frame = 1;
  numberOfFrames = 0;
  numberOfAnimations = 0;
  frameWidth = 0;
  frameHeight = 0;

  velocity = {
    x: 0,
    y: 0,
  };

  position = {
    x: 0,
    y: 0,
  };

  constructor(
    x,
    y,
    width,
    height,
    color = null,
    type = null,
    numberOfFrames = null,
    numberOfAnimations = null
  ) {
    this.position.x = x;
    this.position.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.type = type;

    if (type == "image" || type == "atlas") {
      this.image = new Image();
      this.image.src = color;
    }

    if (type == "atlas" && numberOfFrames && numberOfAnimations) {
      this.numberOfFrames = numberOfFrames;
      this.numberOfAnimations = numberOfAnimations;
      this.frameWidth = this.image.width / numberOfFrames;
      this.frameHeight = this.image.height / numberOfAnimations;
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
    } else if (this.type == "atlas") {
      let animation = this.animation - 1;
      let frame = this.frame - 1;

      context.drawImage(
        this.image,
        this.frameWidth * frame,
        this.frameHeight * animation,
        this.frameWidth,
        this.frameHeight,
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

  animate(animation) {
    this.animation = animation;
    this.frame++;

    if (this.frame > this.numberOfFrames) {
      this.frame = 1;
    }
  }

  moveLeft() {
    this.velocity.x -= 1;
  }

  moveRight() {
    this.velocity.x += 1;
  }

  moveUp() {
    this.velocity.y -= 1;
  }

  moveDown() {
    this.velocity.y += 1;
  }
}

class World {
  constructor() {

  }
  
  update() {

  }

  draw(context) {

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
    const t = this;

    this.canvas.width = document.body.clientWidth;
    this.canvas.height = window.innerHeight - 200;
    this.context = this.canvas.getContext("2d");

    document.body.insertBefore(this.canvas, document.body.childNodes[0]);

    requestAnimationFrame(function () {
      t.update();
    });
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  update() {
    const t = this;
    
    this.clear();

    for (let i = 0; i < this.gameObjects.length; ++i) {
      this.gameObjects[i].update();
      this.gameObjects[i].draw(this.context);
    }

    requestAnimationFrame(function () {
      t.update();
    });
  }

  addGameObject(gameObject) {
    gameObject.game = this;

    this.gameObjects.push(gameObject);
  }
}

window.onload = function () {
  const game = new Game();
  const player = new Player(
    50,
    50,
    80,
    100,
    "images/skeleton_walk.png",
    "atlas",
    9,
    4
  );

  player.onUpdate = function () {
    if (Input.getKey("w")) {
      this.moveUp();
      this.animate(1);
    }

    if (Input.getKey("s")) {
      this.moveDown();
      this.animate(3);
    }

    if (Input.getKey("a")) {
      this.moveLeft();
      this.animate(2);
    }

    if (Input.getKey("d")) {
      this.moveRight();
      this.animate(4);
    }
  };

  game.addGameObject(player);
  game.start();
};
