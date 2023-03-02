class Component {
  game = null;

  constructor(game) {
    this.game = game;
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

  keysCmdMap = null;
  cmdCbMap = null;
  cmdList = [];
  lastCommand = "";

  static uid = 0;
  id = 0;

  constructor(game, x, y, width, height) {
    this.transform = new Transform(game);
    this.keysCmdMap = new Map();
    this.cmdCbMap = new Map();

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

  addCmdKeys(primKeys, cmd, secKeys = null) {
    this.keysCmdMap.set(primKeys, cmd);

    if (secKeys) {
      this.keysCmdMap.set(secKeys, cmd);
    }
  }

  onCommand(cmd, callback) {
    this.cmdCbMap.set(cmd, callback);
  }

  update() {
    if (this.onUpdate) {
      this.onUpdate();
    }

    for (const [keys, cmd] of this.keysCmdMap) {
      let areAllpressed = true;

      for (let i = 0; i < keys.length; i++) {
        if (!Input.getKey(keys[i])) {
          areAllpressed = false;
        }
      }
      
      if (areAllpressed) {
        this.cmdList.push(cmd);
      }
    }

    for (let i = 0; i < this.cmdList.length; i++) {
      this.lastCommand = this.cmdList[i];

      const callback = this.cmdCbMap.get(this.lastCommand);

      callback();
    }

    this.cmdList = [];

    if (this.position.x == "center") {
      this.position.x = this.game.scene.canvas.width / 2;
      this.position.x -= this.width / 2;
    }

    if (this.position.y == "middle") {
      this.position.y = this.game.scene.canvas.height / 2;
      this.position.y -= this.height / 2;
    }

    this.transform.position.x = this.position.x;
    this.transform.position.y = this.position.y;
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

class AnimState extends Component {
  name = "idle";
  duration = 1500;
  sheetRow = 1;
  isPlaying = false;

  frame = 1;
  frameDuration = 0;
  numOfFrames = 0;

  iteration = 0;
  numOfIterations = 0;

  constructor(game, name, sheetRow, numOfFrames) {
    super(game);

    this.name = name;
    this.sheetRow = sheetRow;
    this.numOfFrames = numOfFrames;
  }

  pause() {
    this.isPlaying = false;
  }

  resume() {
    this.isPlaying = true;
  }

  rewind() {
    this.frame = 1;
  }

  stop() {
    this.pause();
    this.rewind();

    this.frameDuration = 0;
  }

  update() {
    if (this.isPlaying && this.numOfFrames > 1) {
      if (this.iteration > this.numOfIterations) {
        this.stop();
        this.iteration = 0;
        return;
      }

      const scene = this.game.scene;
      const lastFrameDur = scene.lastFrameDurMs;
      this.frameDuration -= lastFrameDur;
      
      if (this.frameDuration < 0) {
        this.frame++;
        this.frameDuration = this.duration / this.numOfFrames;

        if (this.frame > this.numOfFrames) {
          this.rewind();
          this.iteration++;
        }
      }
    }
  }
}

class Sprite extends GameObject {
  animState = null;
  prevAnimState = null;
  sheet = null;
  defaultAnimState = "idle";
  isPlaying = false;

  animStates = [];

  constructor(game, x, y, width, height, atlas, tileWidth, tileHeight) {
    super(game, x, y, width, height);

    this.sheet = new SpriteSheet(game, atlas, tileWidth, tileHeight);

    this.addAnimState(this.defaultAnimState, 1, 1);
    this.setAnimState(this.defaultAnimState);
  }

  addAnimState(name, sheetRow, numOfFrames) {
    const animState = new AnimState(this.game, name, sheetRow, numOfFrames);

    this.animStates[name] = animState;
  }

  setAnimState(animState) {
    this.animState = this.animStates[animState];
    this.animState.resume();
  }

  update() {
    this.animState.update();
    super.update();
  }

  draw(context) {
    context.drawImage(
      this.sheet.getImage(),
      this.sheet.tile.width * (this.animState.frame - 1),
      this.sheet.tile.height * (this.animState.sheetRow - 1),
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

  state = "is standing";
  direction = "right";

  update() {
    const scene = this.game.scene;
    const lastFrameSeconds = scene.lastFrameDurSec;

    super.update();

    this.position.x += this.velocity.x * lastFrameSeconds;
    this.position.y += this.velocity.y * lastFrameSeconds;

    this.velocity.x = 0;
    this.velocity.y = 0;
    this.state = "is standing";
  }

  moveLeft() {
    this.direction = "left";
    this.velocity.x -= this.speed;
    this.state = "is moving";
  }

  moveRight() {
    this.direction = "right";
    this.velocity.x += this.speed;
    this.state = "is moving";
  }

  moveUp() {
    this.direction = "up";
    this.velocity.y -= this.speed;
    this.state = "is moving";
  }

  moveDown() {
    this.direction = "down";
    this.velocity.y += this.speed;
    this.state = "is moving";
  }
}

class Camera extends GameObject {
  target = null;
  
  constructor(game, x, y, width, height) {
    super(game, x, y, width, height);
    
  }
  
  update() {
    super.update();
    
  }
  
  lookAt(gameObject) {
    this.target = gameObject;
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
    let width = window.innerWidth;
    let height = window.innerHeight;
    let controlPanel = null;
    let container = null;

    container = Scene.getElementBySceneName(this.name);
    
    if (container) {
      container.height = height;
      container.width = width;

      this.container = container;
    }

    if (this.type == "canvas") {
      const canvas = document.getElementById(this.canvasId);
      
      if (Input.touchScreen) {
        canvas.height = height / 2;
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
    
    if (this.container) {
      this.container.classList.remove("removed");
    }
    
    if (this.controlPanel) {
      this.controlPanel.classList.remove("removed");
    }
    
    if (this.canvas) {
      this.canvas.classList.remove("removed");
    }

    this.animFrame = window.requestAnimationFrame((timeStamp) =>
      this.nextFrame(timeStamp)
    );

    this.state = "playing";
  }

  stop() {
    if (this.container) {
      this.container.classList.add("removed");
      this.container = null;
    }
    
    if (this.controlPanel) {
      this.controlPanel.classList.add("removed");
      this.controlPanel = null;
    }
    
    if (this.canvas) {
      this.context = null;
      this.canvas.classList.add("removed");
      this.canvas = null;
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
    
    if (this.game.onUpdate) {
      this.game.onUpdate();
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

  static getElementBySceneName(sceneName) {
    const id = sceneName.replace(/ /i, "-").toLowerCase();
    const element = document.getElementById(id);

    return element;
  }
}

class Game {
  fps = 0;
  scenes = [];
  scene = null;
  onUpdate = null;

  start(sceneName) {
    if (this.scene) {
      this.scene.stop();
    }

    this.scene = this.scenes[sceneName];
    this.scene.start();
  }

  addScene(newScene) {
    newScene.game = this;

    this.scenes[newScene.name] = newScene;
  }
}
