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
      this.image = new Image();
      this.image.onload = () => {
        if (tileWidth < 0 && tileHeight < 0) {
          this.divByNum(tileWidth - 2 * tileWidth, tileHeight - 2 * tileHeight);
        } else {
          this.tile.width = tileWidth;
          this.tile.height = tileHeight;

          this.cols = this.image.width / tileWidth;
          this.rows = this.image.height / tileHeight;
        }
      }
      
      this.image.src = image;
    }
  }

  divByNum(cols, rows) {
    this.tile.width = this.image.width / cols;
    this.tile.height = this.image.height / rows;

    this.cols = this.image.width / this.tile.width;
    this.rows = this.image.height / this.tile.height;
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
  context = null;

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
  
  draw(canvas) {
    if (!this.context) {
      this.context = canvas.getContext("2d");
    }
    
    
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

  draw(canvas) {
    super.draw(canvas);
    
    this.context.drawImage(
      this.sheet.image,
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
  numOfTiles = 0;
  map = [];

  constructor(game, cols, rows, atlas, tileWidth, tileHeight) {
    super(game, 0, 0, tileWidth * cols, tileHeight * rows);

    this.numOfCols = cols;
    this.numOfRows = rows;
    this.numOfTiles = cols * rows;

    this.atlas = new SpriteSheet(game, atlas, tileWidth, tileHeight);

    for (let i = 0; i < this.numOfRows; ++i) {
      const row = [];

      for (let j = 0; j < this.numOfCols; ++j) {
        const tile = {
          col: 2,
          row: 2,
        };

        row.push(tile);
      }

      this.map.push(row);
    }
  }

  draw(canvas) {
    super.draw(canvas);
    
    for (let i = 0; i < this.map.length; ++i) {
      for (let j = 0; j < this.map[i].length; ++j) {
        const atlasPosX = (this.map[i][j].col - 1) * this.atlas.tile.width;
        const atlasPosY = (this.map[i][j].row - 1) * this.atlas.tile.height;
    
        const tilePosX = j * this.atlas.tile.width;
        const tilePosY = i * this.atlas.tile.height;
    
        this.context.drawImage(
          this.atlas.image,
          atlasPosX,
          atlasPosY,
          this.atlas.tile.width,
          this.atlas.tile.height,
          tilePosX,
          tilePosY,
          this.atlas.tile.width,
          this.atlas.tile.height
        );
      }
    }
    
    const newScreenPosX = this.transform.position.x - this.game.scene.camera.position.x;
    const newScreenPosY = this.transform.position.y - this.game.scene.camera.position.y;
    
    this.context.setTransform(1, 0, 0, 1, newScreenPosX, newScreenPosY);
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
  world = null;
  
  constructor(game, x, y, width, height) {
    super(game, x, y, width, height);
    
  }
  
  update() {
    if (this.target) {
      this.position.x = this.target.position.x - this.width / 2 + this.target.width / 2;
      this.position.y = this.target.position.y - this.height / 2 + this.target.height / 2;
    }
    
    if (this.world) {
      if (this.position.x < this.world.position.x) {
        this.position.x = this.world.position.x;
      }
      
      if (this.position.y < this.world.position.y) {
        this.position.y = this.world.position.y;
      }
      
      const camRightEdge = this.position.x + this.width;
      const camBottomEdge = this.position.y + this.height;
      const worldRightEdge = this.world.position.x + this.world.width;
      const worldBottomEdge = this.world.position.y + this.world.height;
      
      if (camRightEdge > worldRightEdge) {
        this.position.x = worldRightEdge - this.width;
      }
      
      if (camBottomEdge > worldBottomEdge) {
        this.position.y = worldBottomEdge - this.height;
      }
    }
    
    super.update();
  }
  
  lookAt(target) {
    this.target = target;
  }
  
  attachTo(world) {
    this.world = world;
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
  type = "canvas";
  canvasId = "main-canvas";
  canvas = null;
  camera = null;
  onStart = null;
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
      
      const camera = new Camera(this.game, 0, 0, canvas.width, canvas.height);

      this.canvas = canvas;
      this.camera = camera;
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
    
    if (this.canvas) {
      this.canvas.classList.remove("removed");
    }
    
    if (this.onStart) {
      this.onStart();
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
    if (this.game.onUpdate) {
      this.game.onUpdate();
    }
    
    super.update();
    
    if (this.camera) {
      this.camera.update();
    }

    for (let i = 0; i < this.gameObjects.length; ++i) {
      this.gameObjects[i].update();
    }
  }

  draw() {
    if (this.canvas) {
      super.draw(this.canvas);
      
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = 0; i < this.gameObjects.length; ++i) {
        this.gameObjects[i].draw(this.canvas);
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
