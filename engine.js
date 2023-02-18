class Component {
  game = null;

  constructor(game) {
    this.game = game;
  }
}

class Anim extends Component {
  sheetRowId = 1;
  frame = 1;
  numOfFrames = 0;
  name = "idle";
  isPlaying = false;
  duration = 1000;
  frameDuration = 0;
  numOfIterations = 0;
  iteration = 0;

  constructor(game, name, sheetRowId, numOfFrames, speed = null) {
    super(game);

    this.name = name;
    this.sheetRowId = sheetRowId;
    this.numOfFrames = numOfFrames;

    if (speed) {
      this.speed = speed;
    }
  }

  animate() {
    if (this.isPlaying) {
      this.frameDuration = this.duration / this.numOfFrames;
      this.frame++;

      if (this.frame > this.numOfFrames) {
        this.rewind();
        this.iteration++;
      }

      if (this.iteration > this.numOfIterations - 1) {
        this.stop();
        this.iteration = 0;
      }
    }
  }

  resume() {
    this.isPlaying = true;
  }

  pause() {
    this.isPlaying = false;
  }

  play(iterations) {
    if (this.numOfFrames > 1) {
      this.isPlaying = true;
      this.numOfIterations = iterations;
    }
  }

  rewind() {
    this.frame = 1;
  }

  stop() {
    this.pause();
    this.rewind();
  }
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

class SpriteSheet extends Component {
  cols = 0;
  rows = 0;

  tile = {
    width: 0,
    height: 0,
  };

  image = null;

  constructor(game, image, tileWidth, tileHeight) {
    super(game);

    if (!this.image) {
      const t = this;

      this.image = new Img(game, 0, 0, 0, 0, image);
      this.image.onLoad = function () {
        if (tileWidth < 0 && tileHeight < 0) {
          t.divByNum(tileWidth - 2 * tileWidth, tileHeight - 2 * tileHeight);
        } else {
          t.tile.width = tileWidth;
          t.tile.height = tileHeight;

          t.cols = t.image.width / tileWidth;
          t.rows = t.image.height / tileHeight;
        }
      };
    }
  }

  divByNum(cols, rows) {
    this.tile.width = this.image.width / cols;
    this.tile.height = this.image.height / rows;

    this.cols = this.image.width / this.tile.width;
    this.rows = this.image.height / this.tile.height;
  }

  getImage() {
    return this.image.img;
  }
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

  parent = null;
  gameObjects = [];

  static uid = 0;
  id = 0;

  constructor(game, x, y, width, height) {
    this.transform = new Transform(game);

    this.game = game;

    this.position.x = x;
    this.position.y = y;

    this.width = width;
    this.height = height;

    this.id = this.constructor.name + GameObject.uid;
    GameObject.uid++; 
    
    console.log(this.id);
  }

  addGameObject(gameObject) {
    gameObject.parent = this;

    this.gameObjects.push(gameObject);
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
  gameObject = null;
  x = 0;
  y = 0;
  text = "Label";
  align = "center";
  baseline = "middle";
  font = "serif";

  constructor(game, x, y, gameObject = null) {
    super(game, x, y, 0, 0);

    if (gameObject) {
      this.gameObject = gameObject;
    }

    this.x = x;
    this.y = y;
  }

  update() {
    super.update();

    switch (this.align) {
      case "left":
        this.x = this.gameObject.position.x;
        break;
      case "center":
        this.x = this.gameObject.position.x + this.gameObject.width / 2;
        break;
      case "right":
        this.x = this.gameObject.position.x + this.gameObject.width;
    }

    switch (this.baseline) {
      case "top":
        this.y = this.gameObject.position.y;
        break;
      case "middle":
        this.y = this.gameObject.position.y + this.gameObject.height / 2;
        break;
      case "bottom":
        this.y = this.gameObject.position.y + this.gameObject.height;
    }
  }

  draw(context) {
    context.font = this.gameObject.height + "px " + this.font;

    context.textAlign = this.align;
    context.textBaseline = this.baseline;

    context.fillStyle = this.gameObject.color;
    context.fillText(this.text, this.x, this.y, this.gameObject.width);
  }
}

class Img extends GameObject {
  img = null;
  onLoad = null;

  constructor(game, x, y, width, height, image) {
    super(game, x, y, width, height);

    if (!this.img) {
      const t = this;

      this.img = new Image();
      this.img.onload = function () {
        if (!t.width) {
          t.width = this.width;
        }

        if (!t.height) {
          t.height = this.height;
        }

        if (t.onLoad) {
          t.onLoad();
        }
      };

      this.img.src = image;
    }
  }

  update() {
    super.update();
  }

  draw(context) {
    context.drawImage(
      this.img,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
}

class Button extends GameObject {
  color = "white";
  background = "black";
  mouseOver = false;
  onClick = null;
  rectangle = null;
  image = null;
  label = null;

  constructor(game, x, y, width, height, text, color = null, bg = null) {
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
      this.color,
      this
    );

    this.label = new Label(game, x, y, this);
    this.label.text = text;

    this.addGameObject(this.rectangle);
    this.addGameObject(this.label);
  }

  update() {
    super.update();

    this.mouseOver = false;
    this.rectangle.color = false;
    this.game.getScene().canvas.style.cursor = "default";

    if (
      Input.mouse.x > this.position.x &&
      Input.mouse.x < this.position.x + this.width &&
      Input.mouse.y > this.position.y &&
      Input.mouse.y < this.position.y + this.height
    ) {
      this.mouseOver = true;
      this.rectangle.color = this.color;
      this.game.getScene().canvas.style.cursor = "pointer";
    }

    if (Input.getButton("left") && this.mouseOver) {
      this.onClick();
    }

    this.rectangle.update();
    this.label.update();
  }

  draw(context) {
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
      this.color,
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
  animation = null;
  prevAnimation = null;
  sheet = null;

  animations = [];

  constructor(game, x, y, width, height, atlas, tileWidth, tileHeight) {
    super(game, x, y, width, height);

    this.sheet = new SpriteSheet(game, atlas, tileWidth, tileHeight);

    this.addAnimation("idle", 1, 1);
    this.animate("idle");
  }

  addAnimation(name, sheetRowId, numOfFrames) {
    const anim = new Anim(this.game, name, sheetRowId, numOfFrames);

    this.animations[name] = anim;
    this.animation = anim;
  }

  animate(name) {
    this.prevAnimation = this.animation;
    this.animation = this.animations[name];

    this.animation.play(1);
  }

  update() {
    super.update();
    this.animation.animate();
  }

  draw(context) {
    context.drawImage(
      this.sheet.getImage(),
      this.sheet.tile.width * (this.animation.frame - 1),
      this.sheet.tile.height * (this.animation.sheetRowId - 1),
      this.sheet.tile.width,
      this.sheet.tile.height,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
}

class TileMap extends GameObject {
  atlas = null;
  numOfCols = 0;
  numOfRows = 0;
  numOfIslands = 0;
  map = [];

  constructor(game, cols, rows, atlas, tileWidth, tileHeight) {
    super(game, 0, 0, tileWidth * cols, tileHeight * rows);

    this.numOfCols = cols;
    this.numOfRows = rows;
    this.numOfIslands = cols * rows;

    this.atlas = new SpriteSheet(game, atlas, tileWidth, tileHeight);

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
          this.atlas.getImage(),
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
  speed = 60;

  velocity = {
    x: 0,
    y: 0,
  };

  update() {
    const lastFrameSeconds = this.game.getScene().lastFrameDurSec;

    super.update();

    this.position.x += this.velocity.x * lastFrameSeconds;
    this.position.y += this.velocity.y * lastFrameSeconds;

    this.velocity.x = 0;
    this.velocity.y = 0;
  }

  moveLeft() {
    this.velocity.x -= this.speed;
  }

  moveRight() {
    this.velocity.x += this.speed;
  }

  moveUp() {
    this.velocity.y -= this.speed;
  }

  moveDown() {
    this.velocity.y += this.speed;
  }
}

class Input {
  static keys = false;
  static buttons = false;
  static touchScreen = false;

  static mouse = {
    x: 0,
    y: 0,
  };

  static {
    if ("ontouchstart" in window) {
      this.touchScreen = true;

      window.ontouchstart = (event) => {
        const x = Math.floor(event.touches[0].clientX);
        const y = Math.floor(event.touches[0].clientY);

        if (!this.buttons) {
          this.buttons = [];
        }

        this.buttons["left"] = true;
        this.setMouseCoord(x, y);
      };

      window.ontouchend = (event) => {
        this.buttons["left"] = false;
      };
    }

    window.onkeydown = (event) => {
      this.setKey(event.key);
    };

    window.onkeyup = (event) => {
      this.unsetKey(event.key);
    };

    window.onmousedown = (event) => {
      if (!this.buttons) {
        this.buttons = [];
      }

      this.buttons[this.getButtonName(event.button)] = true;
    };

    window.onmouseup = (event) => {
      this.buttons[this.getButtonName(event.button)] = false;
    };

    window.onmousemove = (event) => {
      this.setMouseCoord(event.x, event.y);
    };
  }

  static getKey(key) {
    if (this.keys && this.keys[key]) {
      return true;
    } else {
      return false;
    }
  }
  
  static setKey(key) {
    if (!this.keys) {
      this.keys = [];
    }
    
    this.keys[key] = true;
  }
  
  static unsetKey(key) {
    this.keys[key] = false;
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

  static setMouseCoord(x, y) {
    this.mouse.x = x;
    this.mouse.y = y;
  }
}

class Scene extends GameObject {
  name = "Scene Name";
  game = null;
  type = "canvas";
  canvasId = "main-canvas";
  canvas = null;
  context = null;
  animFrame = false;
  prevTimeStamp = 0;
  lastFrameDurMs = 0;
  lastFrameDurSec = 0;
  container = null;
  secLayerContainer = null;
  controlPanel = null;
  state = "stopped";

  constructor(game, name = "", type = "") {
    super(game, 0, 0, 0, 0);

    if (name) {
      this.name = name;
    }

    if (type) {
      this.type = type;
    }
  }

  init() {
    let width = 0;
    let height = 0;
    let controlPanel = null;
    let container = null;

    container = Scene.getElementBySceneName(this.name);
    
    if (container) {
      container.height = height = window.innerHeight;
      container.width = width = window.innerWidth;

      this.container = container;
    }

    if (this.type == "canvas") {
      const canvas = document.getElementById(this.canvasId);
      
      if (Input.touchScreen) {
        canvas.height = window.innerHeight / 2;
        controlPanel = document.getElementById("control-panel");
      } else {
        canvas.height = height;
      }
      
      canvas.width = width;

      this.context = canvas.getContext("2d");
      this.canvas = canvas;
    }

    this.width = width;
    this.height = height;

    if (controlPanel) {
      this.controlPanel = controlPanel;
    }
  }

  start() {
    this.init();

    if (this.canvas) {
      this.canvas.classList.remove("removed");
    } else if (this.container) {
      this.container.classList.remove("removed");
    }

    if (this.secLayerContainer) {
      this.secLayerContainer.classList.remove("removed");
    }
    
    if (this.controlPanel) {
      this.controlPanel.classList.remove("removed");
    }

    this.animFrame = window.requestAnimationFrame((timeStamp) =>
      this.nextFrame(timeStamp)
    );

    this.state = "playing";
  }

  stop() {
    if (this.canvas) {
      this.context = null;
      this.canvas.classList.add("removed");
      this.canvas = null;
    } else if (this.container) {
      this.container.classList.add("removed");
      this.container = null;
    } 

    if (this.secLayerContainer) {
      this.secLayerContainer.classList.add("removed");
    }
    
    if (this.controlPanel) {
      this.controlPanel.classList.add("removed");
    }

    window.cancelAnimationFrame(this.animFrame);
    this.state = "stopped";
  }

  nextFrame(timeStamp) {
    this.lastFrameDurMs = timeStamp - this.prevTimeStamp;
    this.lastFrameDurSec = this.lastFrameDurMs / 1000;

    const fps = 1 / this.lastFrameDurSec;

    this.prevTimeStamp = timeStamp;
    this.game.fps = Math.round(fps);

    this.update();
    this.draw();

    if (this.state == "playing") {
      this.animFrame = window.requestAnimationFrame((timeStamp) =>
        this.nextFrame(timeStamp)
      );
    } else if (this.state == "stopped") {
      this.animFrame = false;
    }
  }

  update() {
    if (this.controlPanel) {
      const btnUp = document.getElementById("btn-up");
      const btnDown = document.getElementById("btn-down");
      const btnLeft = document.getElementById("btn-left");
      const btnRight = document.getElementById("btn-right");

      btnUp.ontouchstart = () => {
        Input.setKey("ArrowUp");
      };
      
      btnUp.ontouchend = () => {
        Input.unsetKey("ArrowUp");
      };
      
      btnDown.ontouchstart = () => {
        Input.setKey("ArrowDown");
      };
      
      btnDown.ontouchend = () => {
        Input.unsetKey("ArrowDown");
      };
      
      btnLeft.ontouchstart = () => {
        Input.setKey("ArrowLeft");
      };
      
      btnLeft.ontouchend = () => {
        Input.unsetKey("ArrowLeft");
      }; 
      
      btnRight.ontouchstart = () => {
        Input.setKey("ArrowRight");
      };
      
      btnRight.ontouchend = () => {
        Input.unsetKey("ArrowRight");
      };
    }
    
    super.update();

    for (let i = 0; i < this.gameObjects.length; ++i) {
      this.gameObjects[i].update();
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

  set2ndLayerCont(containerId) {
    this.secLayerContainer = document.getElementById(containerId);
  }

  static getElementBySceneName(sceneName) {
    const id = sceneName.replace(/ /i, "-").toLowerCase();
    const element = document.getElementById(id);

    return element;
  }
}

class Game {
  fps = 0;
  scenes = [];
  currentScene = null;

  start(sceneName) {
    if (this.currentScene) {
      this.currentScene.stop();
    }

    this.currentScene = this.scenes[sceneName];
    this.currentScene.start();
  }

  getScene() {
    return this.currentScene;
  }

  addScene(newScene) {
    newScene.game = this;

    this.scenes[newScene.name] = newScene;
  }
}
