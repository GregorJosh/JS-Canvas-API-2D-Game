class Component {
  constructor() {}
}

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

  game = null;

  transform = null;
  onUpdate = null;

  constructor(game, x, y, width, height) {
    this.transform = new Transform();

    this.game = game;

    this.position.x = x;
    this.position.y = y;

    this.width = width;
    this.height = height;
  }

  update() {
    if (this.onUpdate) {
      this.onUpdate();
    }

    if (this.position.x == "center") {
      this.position.x = this.game.getScene().canvas.width / 2;
      this.position.x -= this.width / 2;
    }

    if (this.position.y == "middle") {
      this.position.y = this.game.getScene().canvas.height / 2;
      this.position.y -= this.height / 2;
    }

    this.transform.position.x = this.position.x;
    this.transform.position.y = this.position.y;
  }
}

class Rectangle extends GameObject {
  background = "black";
  color = null;
  gameObject = null;

  constructor(
    game,
    x,
    y,
    width,
    height,
    bg = null,
    color = null,
    gameObject = null
  ) {
    super(game, x, y, width, height);

    if (bg) {
      this.background = bg;
    }

    if (color) {
      this.color = color;
    }

    if (gameObject) {
      this.gameObject = gameObject;
    }
  }

  update() {
    super.update();
  }

  draw(context) {
    context.fillStyle = this.background;
    context.fillRect(this.position.x, this.position.y, this.width, this.height);

    if (this.color) {
      context.strokeStyle = this.color;
      context.strokeRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }
  }
}

class Label extends GameObject {
  x = 0;
  y = 0;
  text = "Label";
  align = "center";
  gameObject = null;

  constructor(game, x, y, gameObject = null) {
    super(game, x, y, 0, 0);

    if (gameObject) {
      this.gameObject = gameObject;
    }

    this.x = x;
    this.y = y;
  }

  draw(context) {
    this.x = this.gameObject.position.x + this.gameObject.width / 2;
    this.y = this.gameObject.position.y + this.gameObject.height / 2;

    context.font = this.gameObject.height + "px serif";

    context.textAlign = this.align;
    context.textBaseline = "middle";

    context.fillStyle = this.gameObject.color;
    context.fillText(this.text, this.x, this.y, this.gameObject.width);
  }
}

class Img extends GameObject {
  image = null;

  constructor(game, x, y, width, height, image) {
    super(game, x, y, width, height);

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
  color = "red";
  background = "black";
  mouseOver = false;
  onClick = null;
  rectangle = null;
  label = null;

  constructor(game, x, y, width, height, text, color = null) {
    super(game, x, y, width, height);

    this.rectangle = new Rectangle(
      game,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
      this.background,
      0,
      this
    );

    this.label = new Label(game, x, y, this);
    this.label.text = text;

    if (color) {
      this.color = color;
    }
  }

  update() {
    super.update();

    this.mouseOver = false;
    this.rectangle.color = false;

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

    this.rectangle.update();
    this.label.update();
  }

  draw(context) {
    if (this.mouseOver) {
      this.rectangle.color = this.color;
    }

    this.rectangle.draw(context);
    this.label.draw(context);
  }
}

class TextField extends GameObject {
  background = "black";
  color = "white";
  onUpdate = null;
  rectangle = null;
  label = null;

  constructor(game, x, y, width, height, color = null, bg = null) {
    super(game, x, y, width, height);

    if (bg) {
      this.background = bg;
    }

    if (color) {
      this.color = color;
    }

    this.rectangle = new Rectangle(
      game,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
      this.background,
      0, 
      this
    );

    this.label = new Label(game, x, y, this);
  }

  update() {
    super.update();

    this.rectangle.update();
    this.label.update();
  }

  draw(context) {
    this.rectangle.draw(context);
    this.label.draw(context);
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

  constructor(game, x, y, width, height, atlas, numOfFrames, numOfAnims) {
    super(game, x, y, width, height);

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

  constructor(game, cols, rows, atlas, tileWidth, tileHeight) {
    super(game, 0, 0, tileWidth * cols, tileHeight * rows);

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
    super.update();

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
    y: 0,
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

    window.addEventListener("mousemove", function (event) {
      t.mouse.x = event.x;
      t.mouse.y = event.y;
    });
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

class Scene extends GameObject {
  game = null;
  canvas = null;
  context = null;
  gameObjects = [];
  animationFrameReqID = 0;
  oldTimeStamp = 0;

  constructor(game) {
    super(game, 0, 0, 0, 0);
  }

  start() {
    const t = this;

    this.canvas = document.createElement("canvas");
    this.width = this.canvas.width = innerWidth;
    this.height = this.canvas.height = innerHeight;
    this.context = this.canvas.getContext("2d");

    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    document.body.style.overflow = "hidden";
    document.body.style.margin = "0px";

    this.animationFrameReqID = requestAnimationFrame(function (timeStamp) {
      t.animationFrame(timeStamp);
    });
  }

  stop() {
    if (this.canvas) {
      cancelAnimationFrame(this.animationFrameReqID);

      this.context = null;
      this.canvas.remove();
      this.canvas = null;
    }
  }

  animationFrame(timeStamp) {
    if (this.context) {
      const t = this;
      const frameDuration = timeStamp - this.oldTimeStamp;
      const frameDurSeconds = frameDuration / 1000;
      const fps = 1 / frameDurSeconds;

      this.oldTimeStamp = timeStamp;

      this.game.fps = Math.round(fps);

      this.update();
      this.draw();

      this.animationFrameReqID = requestAnimationFrame(function (timeStamp) {
        t.animationFrame(timeStamp);
      });
    }
  }

  update() {
    super.update();

    if (this.context) {
      for (let i = 0; i < this.gameObjects.length; ++i) {
        this.gameObjects[i].update();
      }
    }
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  draw() {
    if (this.context) {
      this.clear();

      for (let i = 0; i < this.gameObjects.length; ++i) {
        this.gameObjects[i].draw(this.context);
      }
    }
  }

  addGameObject(gameObject) {
    this.gameObjects.push(gameObject);
  }
}

class Game {
  fps = 0;
  scenes = [];
  scene = 0;

  constructor() {
    document.body.style.backgroundColor = "black";
    document.body.style.padding = "none";
  }

  start(newScene) {
    this.scenes[this.scene].stop();
    this.scene = newScene;
    this.scenes[this.scene].start();
  }

  getScene() {
    return this.scenes[this.scene];
  }

  addScene(newScene) {
    newScene.game = this;

    this.scenes.push(newScene);
  }
}
