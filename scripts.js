class Component {}

class Transform extends Component {
  position = {
    x: 0,
    y: 0,
  };

  scale = {
    x: 1,
    y: 1,
  };

  rotation = 0;
}

class GameObject {
  position = {
    x: 0,
    y: 0,
  };

  width = 0;
  height = 0;

  transform = null;

  constructor(x, y, width, height) {
    this.transform = new Transform();

    this.position.x = this.transform.position.x = x;
    this.position.y = this.transform.position.y = y;

    this.width = width;
    this.height = height;
  }

  update() {}

  draw(context) {}
}

class Img extends GameObject {
  image = null;

  constructor(x, y, width, height, image) {
    super(x, y, width, height);

    this.image = new Image();
    this.image.src = image;
  }

  draw(context) {
    context.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
}

class Button extends GameObject {
  mouseOver = false;
  onClick = null;
  label = " ";

  constructor(x, y, width, height, color, label) {
    if (typeof(x) == "string") {
      x = 0;
    }

    if (typeof(y) == "string") {
      y = 0;
    }


    super(x, y, width, height);

    this.color = color;
    this.label = label;
  }

  update() {
    this.mouseOver = false;

    if (
      Input.mouse.x > this.position.x && 
      Input.mouse.x < this.position.x + this.width &&
      Input.mouse.y > this.position.y &&
      Input.mouse.y < this.position.y + this.height
      ) {
        this.mouseOver = true;
    }

    if (Input.getButton("left") && this.mouseOver) {
      this.onClick();
    }
  }

  draw(context) {
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
    context.strokeStyle = this.color;

    if (this.mouseOver) {
      context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    }

    context.font = this.height + "px serif";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.strokeText(this.label, this.position.x, this.position.y, this.width);
  }
}

class Sprite extends GameObject {
  onUpdate = null;
  atlas = null;
  animation = 1;
  frame = 1;
  numOfFrames = 0;
  numOfAnims = 0;
  frameWidth = 0;
  frameHeight = 0;

  constructor(x, y, width, height, atlas, numOfFrames, numOfAnims) {
    super(x, y, width, height);

    this.atlas = new Image();
    this.atlas.src = atlas;

    this.numOfFrames = numOfFrames;
    this.numOfAnims = numOfAnims;
    this.frameWidth = this.atlas.width / numOfFrames;
    this.frameHeight = this.atlas.height / numOfAnims;
  }

  animate(animation) {
    this.animation = animation;
    this.frame++;

    if (this.frame > this.numOfFrames) {
      this.frame = 1;
    }
  }

  draw(context) {
    context.drawImage(
      this.atlas,
      this.frameWidth * (this.frame - 1),
      this.frameHeight * (this.animation - 1),
      this.frameWidth,
      this.frameHeight,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
}

class TileMap extends GameObject {
  atlas = {
    cols: 0,
    rows: 0,
    image: null,
    tile: {
      width: 0,
      height: 0,
    },
  };

  numOfCols = 0;
  numOfRows = 0;
  numOfIslands = 0;
  map = [];

  constructor(cols, rows, atlas, tileWidth, tileHeight) {
    super(0, 0, tileWidth * cols, tileHeight * rows);

    this.numOfCols = cols;
    this.numOfRows = rows;
    this.numOfIslands = cols * rows;

    this.atlas.image = new Image();
    this.atlas.image.src = atlas;

    this.atlas.tile.width = tileWidth;
    this.atlas.tile.height = tileHeight;

    this.atlas.cols = this.atlas.image.width / tileWidth;
    this.atlas.rows = this.atlas.image.height / tileHeight;

    for (let i = 0; i < this.numOfRows; ++i) {
      const row = [];

      for (let j = 0; j < this.numOfCols; ++j) {
        const island = {
          col: 2,
          row: 2,
        };

        row.push(island);
      }

      this.map.push(row);
    }
  }

  update() {}

  draw(context) {
    for (let i = 0; i < this.map.length; ++i) {
      for (let j = 0; j < this.map[i].length; ++j) {
        const atlasPosX = (this.map[i][j].col - 1) * this.atlas.tile.width;
        const atlasPosY = (this.map[i][j].row - 1) * this.atlas.tile.height;

        const screenPosX = this.position.x + j * this.atlas.tile.width;
        const screenPosY = this.position.y + i * this.atlas.tile.height;

        context.drawImage(
          this.atlas.image,
          atlasPosX,
          atlasPosY,
          this.atlas.tile.width,
          this.atlas.tile.height,
          screenPosX,
          screenPosY,
          this.atlas.tile.width,
          this.atlas.tile.height
        );
      }
    }
  }
}

class Character extends Sprite {
  velocity = {
    x: 0,
    y: 0,
  };

  update() {
    if (this.onUpdate) {
      this.onUpdate();
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.velocity.x = 0;
    this.velocity.y = 0;
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

class Input {
  static keys = false;
  static buttons = false;

  static mouse = {
    x: 0,
    y: 0
  };

  static {
    const t = this;

    window.addEventListener("keydown", function (event) {
      if (!t.keys) {
        t.keys = [];
      }

      t.keys[event.key] = true;
    });

    window.addEventListener("keyup", function (event) {
      t.keys[event.key] = false;
    });

    window.addEventListener("mousedown", function (event) {
      if (!t.buttons) {
        t.buttons = [];
      }

      t.buttons[t.getButtonName(event.button)] = true;
    });

    window.addEventListener("mouseup", function (event) {
      t.buttons[t.getButtonName(event.button)] = false;
    });

    window.addEventListener("mousemove", function(event) {
      t.mouse.x = event.x;
      t.mouse.y = event.y;
    })
  }

  static getKey(key) {
    if (this.keys && this.keys[key]) {
      return true;
    } else {
      return false;
    }
  }

  static getButton(button) {
    if (this.buttons && this.buttons[button]) {
      return true;
    } else {
      return false;
    }
  }

  static getButtonName(button) {
    let name;

    switch (button) {
      case 0:
        name = "left";
        break;
      case 1:
        name = "middle";
        break;
      case 2:
        name = "right";
        break;
      default:
        name = "left";
    }

    return name;
  }
}

class Scene {
  game = null;
  canvas = null;
  context = null;
  gameObjects = [];
  animationFrameReqID = 0;


  start() {
    const t = this;

    this.canvas = document.createElement("canvas");
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = window.innerHeight - 200;
    this.context = this.canvas.getContext("2d");

    document.body.insertBefore(this.canvas, document.body.childNodes[0]);

    this.animationFrameReqID = requestAnimationFrame(function () {
      t.animationFrame();
    });
  }

  stop() {
    if (this.canvas) {
      cancelAnimationFrame(this.animationFrameReqID);

      this.context = null;
      this.canvas.remove();
    }
  }

  animationFrame() {
    const t = this;

    this.update();
    this.draw();

    this.animationFrameReqID = requestAnimationFrame(function () {
      t.animationFrame();
    });
  }

  update() {
    for (let i = 0; i < this.gameObjects.length; ++i) {
      this.gameObjects[i].update();
    }
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  draw() {
    this.clear();

    for (let i = 0; i < this.gameObjects.length; ++i) {
      this.gameObjects[i].draw(this.context);
    }
  }

  addGameObject(gameObject) {
    gameObject.scene = this;
    gameObject.game = this.game;

    this.gameObjects.push(gameObject);
  }
}

class Game {
  #scenes = [];
  #scene = 0;

  constructor() {
    document.body.style.backgroundColor = "black";
  }

  start(newScene) {
    this.#scenes[this.#scene].stop();
    this.#scene = newScene;
    this.#scenes[this.#scene].start();
  }

  get(scene) {
    return this.#scenes[scene];
  }

  addScene(scene) {
    scene.game = this;

    this.#scenes.push(scene);
  }
}

onload = function () {
  const game = new Game();

  const mainMenu = new Scene();
  const mainMenuBg = new Img(0, 0, 1418, 766, "images/bg.png");
  const button = new Button("center", "middle", 300, 200, "red", "Start Game");

  button.onClick = function () {
    game.start(1);
  };

  mainMenu.addGameObject(mainMenuBg);
  mainMenu.addGameObject(button);

  const level1 = new Scene();
  const world = new TileMap(60, 40, "images/terrain_and_objects.png", 32, 32);
  const player = new Character(
    50,
    50,
    80,
    100,
    "images/skeleton_walk.png",
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

  level1.addGameObject(world);
  level1.addGameObject(player);

  game.addScene(mainMenu);
  game.addScene(level1);
  game.start(0);
};
