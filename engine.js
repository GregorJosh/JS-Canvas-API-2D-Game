class Component {
  game = null;
  gameObject = null;

  constructor(game, gameObject) {
    this.game = game;
    this.gameObject = gameObject;

    this.game.debugger.log(
      this.constructor.name +
        " component for " +
        this.gameObject.id +
        " is constructed"
    );
  }

  draw() {}
  init() {}
  update() {}
}

class Transform extends Component {
  position = {
    x: 0,
    y: 0,
  };

  rect = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  rotation = 0;

  scale = {
    x: 1,
    y: 1,
  };

  skew = {
    v: 0,
    h: 0,
  };

  apply() {
    const scene = this.game.scene;

    if (scene.mainCamera && this.gameObject != scene.mainCamera) {
      const camTransform = scene.mainCamera.getComponent(Transform);
      const camPosX = camTransform.position.x;
      const camPosY = camTransform.position.y;

      const screenPosX = this.position.x - camPosX;
      const screenPosY = this.position.y - camPosY;

      this.gameObject.context.setTransform(
        this.scale.x,
        this.skew.v,
        this.skew.h,
        this.scale.y,
        screenPosX,
        screenPosY
      );
    } else {
      this.gameObject.context.setTransform(
        this.scale.x,
        this.skew.v,
        this.skew.h,
        this.scale.y,
        this.position.x,
        this.position.y
      );
    }

    this.gameObject.context.rotate((this.rotation * Math.PI) / 180);
  }

  setBottom(bottom) {
    this.rect.bottom = bottom;
    this.position.y = bottom - this.gameObject.height * this.scale.y;
    this.rect.top = this.position.y;
  }

  setRight(right) {
    this.rect.right = right;
    this.position.x = right - this.gameObject.width * this.scale.x;
    this.rect.left = this.position.x;
  }

  setLeft(left) {
    this.rect.left = this.position.x = left;
    this.rect.right = this.position.x + this.gameObject.width * this.scale.x;
  }

  setTop(top) {
    this.rect.top = this.position.y = top;
    this.rect.bottom = this.position.y + this.gameObject.height * this.scale.y;
  }

  update() {
    this.rect.top = this.position.y;
    this.rect.left = this.position.x;
    this.rect.right = this.position.x + this.gameObject.width * this.scale.x;
    this.rect.bottom = this.position.y + this.gameObject.height * this.scale.y;
  }
}

class Camera extends Component {
  target = null;
  world = null;

  lookAt(gameObject) {
    this.target = gameObject;
  }

  update() {
    if (this.target) {
      const camera = this.gameObject;
      const camTransform = camera.getComponent(Transform);
      const target = this.target;
      const targetTransform = target.getComponent(Transform);

      camTransform.position.x =
        targetTransform.position.x - camera.width / 2 + target.width / 2;
      camTransform.position.y =
        targetTransform.position.y - camera.height / 2 + target.height / 2;
    }
  }
}

class Collider extends Component {
  update() {
    if (this.gameObject.parent) {
      const parentTransform = this.gameObject.parent.getComponent(Transform);
      const movingTransform = this.gameObject.getComponent(Transform);

      if (movingTransform.rect.left < parentTransform.rect.left) {
        movingTransform.setLeft(parentTransform.rect.left);
      }

      if (movingTransform.rect.top < parentTransform.rect.top) {
        movingTransform.setTop(parentTransform.rect.top);
      }

      if (movingTransform.rect.right > parentTransform.rect.right) {
        movingTransform.setRight(parentTransform.rect.right);
      }

      if (movingTransform.rect.bottom > parentTransform.rect.bottom) {
        movingTransform.setBottom(parentTransform.rect.bottom);
      }
    }
  }
}

class SpriteSheet extends Component {
  cols = 0;
  rows = 0;

  tile = {
    width: 0,
    height: 0,
  };

  image = null;

  setImageByTileSize(src, tileWidth, tileHeight) {
    if (!this.image) {
      this.image = new Image();
      this.image.addEventListener("load", () => {
        this.tile.width = tileWidth;
        this.tile.height = tileHeight;

        this.cols = this.image.width / tileWidth;
        this.rows = this.image.height / tileHeight;
      });
      this.image.src = src;
    }
  }

  setImageByNumOfTiles(src, numOfCols, numOfRows) {
    if (!this.image) {
      this.image = new Image();
      this.image.addEventListener("load", () => {
        this.tile.width = this.image.width / numOfCols;
        this.tile.height = this.image.height / numOfRows;

        this.cols = this.image.width / this.tile.width;
        this.rows = this.image.height / this.tile.height;
      });
      this.image.src = src;
    }
  }
}

class StopMotionAnimation extends Component {
  name = "idle";
  duration = 2000;
  spritesheetRow = 1;
  numOfFrames = 0;
  frameDuration = 0;
  isPlaying = false;

  currentFrame = {
    id: 1,
    duration: 0,
  };

  iteration = 0;
  numOfIterations = 0;

  animate() {
    this.isPlaying = true;
    this.frameDuration = this.duration / this.numOfFrames;
  }

  setCycle(animationName, spritesheetRow, numOfFrames) {
    this.name = animationName;
    this.spritesheetRow = spritesheetRow;
    this.numOfFrames = numOfFrames;
  }

  pause() {
    this.isPlaying = false;
  }

  rewind() {
    this.currentFrame.id = 1;
  }

  stop() {
    this.pause();
    this.rewind();

    this.currentFrame.duration = 0;
  }

  update() {
    if (this.isPlaying && this.numOfFrames > 1) {
      if (this.iteration > this.numOfIterations) {
        this.stop();
        this.iteration = 0;
        return;
      }

      const scene = this.game.scene;
      const sceneLastFrameDur = scene.lastFrameDurMs;
      this.currentFrame.duration -= sceneLastFrameDur;

      if (this.currentFrame.duration < 0) {
        this.currentFrame.id++;
        this.currentFrame.duration = this.frameDuration;

        if (this.currentFrame.id > this.numOfFrames) {
          this.rewind();
          this.iteration++;
        }
      }
    }
  }
}

class GameObject {
  static uid = 0;

  position = {
    x: 0,
    y: 0,
  };

  width = 0;
  height = 0;

  game = null;
  context = null;

  parent = null;
  gameObjects = [];

  components = null;

  keysCmdMap = null;
  cmdCbMap = null;
  cmdList = [];
  lastCommand = "";

  id = 0;

  onDraw = null;
  onInit = null;
  onUpdate = null;

  constructor(game, x, y, width, height) {
    this.id = this.constructor.name + GameObject.uid;

    game.debugger.log(this.id + " object is under construction");

    this.game = game;
    this.components = new Map();

    const transform = this.attachComponent(Transform);
    transform.position.x = x;
    transform.position.y = y;

    this.width = width;
    this.height = height;

    this.keysCmdMap = new Map();
    this.cmdCbMap = new Map();

    GameObject.uid++;
  }

  addCmdKeys(primKeys, cmd, secKeys = null) {
    this.keysCmdMap.set(primKeys, cmd);

    if (secKeys) {
      this.keysCmdMap.set(secKeys, cmd);
    }
  }

  addGameObject(gameObject) {
    gameObject.parent = this;

    this.gameObjects.push(gameObject);
  }

  attachComponent(componentClass) {
    if (!this.components.has(componentClass)) {
      const component = new componentClass(this.game, this);

      this.components.set(componentClass, component);

      return component;
    }
  }

  draw() {
    for (const [name, component] of this.components) {
      component.draw();
    }

    for (const gameObject of this.gameObjects) {
      gameObject.draw();
    }

    if (this.onDraw) {
      this.onDraw();
    }
  }

  executeCommands() {
    for (const [keys, command] of this.keysCmdMap) {
      if (Input.getKeys(keys)) {
        this.cmdList.push(command);
      }
    }

    for (let i = 0; i < this.cmdList.length; i++) {
      this.lastCommand = this.cmdList[i];

      this.cmdCbMap.get(this.lastCommand)();
    }

    this.cmdList = [];
  }

  getComponent(componentClass) {
    if (this.components.has(componentClass)) {
      return this.components.get(componentClass);
    }
  }

  init(canvas = null) {
    if (canvas && !this.context) {
      this.context = canvas.getContext("2d");

      for (const gameObject of this.gameObjects) {
        gameObject.init(canvas);
      }
    }

    if (this.onInit) {
      this.onInit();
    }
  }

  onCommand(cmd, callback) {
    this.cmdCbMap.set(cmd, callback);
  }

  removeComponent(componentClass) {
    if (this.components.has(componentClass)) {
      this.components.delete(componentClass);
    }
  }

  update() {
    this.executeCommands();

    if (this.onUpdate) {
      this.onUpdate();
    }

    for (const [componentClass, component] of this.components) {
      component.update();
    }

    for (const gameObject of this.gameObjects) {
      gameObject.update();
    }
  }
}

class Sprite extends GameObject {
  animations = [];
  animation = null;
  prevAnimation = null;
  defaultAnimation = "idle";

  constructor(game, width, height) {
    super(game, 0, 0, width, height);

    this.addAnimation(this.defaultAnimation, 1, 1);
    this.setAnimation(this.defaultAnimation);
    this.animation.animate();
  }

  animate(animationName) {
    if (!this.animation || this.animation.name !== animationName) {
      this.setAnimation(animationName);
    }

    this.animation.animate();
  }

  addAnimation(animationName, spritesheetRow, numOfFrames) {
    const animation = {
      name: animationName,
      id: spritesheetRow,
      length: numOfFrames,
    };

    this.animations[animationName] = animation;
  }

  draw() {
    const transform = this.getComponent(Transform);
    const spritesheet = this.getComponent(SpriteSheet);

    this.context.save();
    transform.apply();

    const spritesheetPosX =
      spritesheet.tile.width * (this.animation.currentFrame.id - 1);
    const spritesheetPosY =
      spritesheet.tile.height * (this.animation.spritesheetRow - 1);

    this.context.drawImage(
      spritesheet.image,
      spritesheetPosX,
      spritesheetPosY,
      spritesheet.tile.width,
      spritesheet.tile.height,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );

    super.draw();
    this.context.restore();
  }

  setAnimation(newAnimationName) {
    if (this.animation) {
      if (this.animation.name == newAnimationName) {
        return;
      }

      this.removeComponent(StopMotionAnimation);
    }

    const animation = this.animations[newAnimationName];

    this.animation = this.attachComponent(StopMotionAnimation);
    this.animation.setCycle(animation.name, animation.id, animation.length);
  }

  setSpriteByNumOfTiles(spriteSrc, numOfCols, numOfRows) {
    const spritesheet = this.attachComponent(SpriteSheet);
    spritesheet.setImageByNumOfTiles(spriteSrc, numOfCols, numOfRows);
  }

  setSpriteByTileSize(spriteSrc, tileWidth, tileHeight) {
    const spritesheet = this.attachComponent(SpriteSheet);
    spritesheet.setImageByTileSize(spriteSrc, tileWidth, tileHeight);
  }
}

class Character extends Sprite {
  velocity = {
    x: 0,
    y: 0,
  };

  speed = 60;
  direction = "right";
  state = "is standing";

  constructor(game, width, height) {
    super(game, width, height);

    this.attachComponent(Collider);
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

  update() {
    super.update();

    const scene = this.game.scene;
    const sceneLastFrameSeconds = scene.lastFrameDurSec;
    const transform = this.getComponent(Transform);

    transform.position.x += this.velocity.x * sceneLastFrameSeconds;
    transform.position.y += this.velocity.y * sceneLastFrameSeconds;

    this.velocity.x = 0;
    this.velocity.y = 0;
    this.state = "is standing";
  }
}

class TileMap extends GameObject {
  tilemap = [];
  numOfCols = 0;
  numOfRows = 0;
  numOfTiles = 0;

  constructor(game, numOfCols, numOfRows, atlasImgSrc, tileWidth, tileHeight) {
    const width = tileWidth * numOfCols;
    const height = tileHeight * numOfRows;

    super(game, 0, 0, width, height);

    this.numOfCols = numOfCols;
    this.numOfRows = numOfRows;
    this.numOfTiles = numOfCols * numOfRows;

    const atlas = this.attachComponent(SpriteSheet);
    atlas.setImageByTileSize(atlasImgSrc, tileWidth, tileHeight);

    for (let i = 0; i < this.numOfRows; ++i) {
      const row = [];

      for (let j = 0; j < this.numOfCols; ++j) {
        const tile = {
          col: 2,
          row: 2,
        };

        row.push(tile);
      }

      this.tilemap.push(row);
    }
  }

  draw() {
    const transform = this.getComponent(Transform);

    this.context.save();
    transform.apply();

    const atlas = this.getComponent(SpriteSheet);

    for (let i = 0; i < this.tilemap.length; ++i) {
      for (let j = 0; j < this.tilemap[i].length; ++j) {
        const sx = (this.tilemap[i][j].col - 1) * atlas.tile.width;
        const sy = (this.tilemap[i][j].row - 1) * atlas.tile.height;

        const dx = j * atlas.tile.width;
        const dy = i * atlas.tile.height;

        this.context.drawImage(
          atlas.image,
          sx,
          sy,
          atlas.tile.width,
          atlas.tile.height,
          dx,
          dy,
          atlas.tile.width,
          atlas.tile.height
        );
      }
    }

    super.draw();
    this.context.restore();
  }
}

class PhysicalCamera extends GameObject {
  camera = null;
  collder = null;

  constructor(game, x, y, width, height) {
    super(game, x, y, width, height);

    const camera = this.attachComponent(Camera);
    const collider = this.attachComponent(Collider);

    this.camera = camera;
    this.collider = collider;
  }
}

class Scene extends GameObject {
  name = "Scene Name";
  type = "canvas";
  canvasId = "main-canvas";
  canvas = null;
  mainCamera = null;
  onStart = null;
  animFrame = false;
  prevTimeStamp = 0;
  lastFrameDurMs = 0;
  lastFrameDurSec = 0;
  container = null;
  controlPanel = null;
  state = "stopped";

  static getElementBySceneName(sceneName) {
    const id = sceneName.replace(/ /i, "-").toLowerCase();
    const element = document.getElementById(id);

    return element;
  }

  constructor(game, name = "", type = "") {
    super(game, 0, 0, 0, 0);

    if (name) {
      this.name = name;
    }

    if (type) {
      this.type = type;
    }
  }

  draw() {
    if (this.canvas) {
      this.context.save();
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      super.draw();
      this.context.restore();
    }
  }

  init() {
    const width = window.innerWidth;
    const height = window.innerHeight;
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
      this.canvas = canvas;

      const physicalCamera = new PhysicalCamera(
        this.game,
        0,
        0,
        canvas.width,
        canvas.height
      );

      this.addGameObject(physicalCamera);
      this.mainCamera = physicalCamera;

      super.init(canvas);
    }

    this.width = width;
    this.height = height;

    if (controlPanel) {
      this.controlPanel = controlPanel;
    }
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

  update() {
    this.game.update();
    super.update();
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

  static getKeys(keys) {
    let areAllpressed = true;

    for (let i = 0; i < keys.length; i++) {
      if (!Input.getKey(keys[i])) {
        areAllpressed = false;
      }
    }

    return areAllpressed;
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

class Debugger {
  game = null;
  container = null;
  fps = null;
  output = null;
  watcher = null;
  watched = [];

  constructor(game) {
    this.game = game;
    this.container = document.getElementById("debugger-container");
    this.fps = document.getElementById("fps");
    this.output = document.getElementById("debugger-output");
    this.watcher = document.getElementById("debugger-watcher");
  }

  log(msg) {
    if (this.output) {
      const p = document.createElement("p");

      p.innerHTML = msg;
      this.output.appendChild(p);
      this.output.scrollTop = this.output.scrollHeight;
    }
  }

  watch(gameObject) {
    if (this.watcher) {
      const li = document.createElement("li");
      const watched = {
        object: gameObject,
        element: li,
      };

      li.id = gameObject.id;
      li.classList.add("debug-window__watched");

      this.watched.push(watched);
      this.watcher.appendChild(li);
    }
  }

  update() {
    this.fps.innerHTML = this.game.fps;

    for (const id in this.watched) {
      const o = this.watched[id].object;
      const transform = o.getComponent(Transform);
      const innerHTML =
        o.id +
        " position: " +
        Math.floor(transform.position.x) +
        ":" +
        Math.floor(transform.position.y) +
        " width: " +
        o.width +
        " height: " +
        o.height +
        " left: " +
        Math.floor(transform.rect.left) +
        " right: " +
        Math.floor(transform.rect.right) +
        " top: " +
        Math.floor(transform.rect.top) +
        " bottom: " +
        Math.floor(transform.rect.bottom);

      this.watched[id].element.innerHTML = innerHTML;
    }
  }
}

class Game {
  fps = 0;
  scenes = [];
  scene = null;
  debugger = null;
  onUpdate = null;

  constructor() {
    this.debugger = new Debugger(this);
    this.debugger.log("Game object is constructed");
  }

  addScene(newScene) {
    newScene.game = this;

    this.scenes[newScene.name] = newScene;
  }

  start(sceneName) {
    if (this.scene) {
      this.scene.stop();
    }

    this.scene = this.scenes[sceneName];
    this.scene.start();
  }

  update() {
    if (this.onUpdate) {
      this.onUpdate();
    }

    this.debugger.update();
  }
}
