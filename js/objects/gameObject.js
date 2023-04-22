import Input from "./input.js";

import Transform from "../components/transform.js";

export default class GameObject {
  static uid = 0;

  position = {
    x: 0,
    y: 0,
  };

  width = 0;
  height = 0;

  game = null;
  canvasLayer = null;

  parent = null;
  gameObjects = [];

  components = null;

  keysCmdMap = null;
  cmdCbMap = null;
  lastCommand = "";

  id = 0;

  onDraw = null;
  onInit = null;
  onUpdate = null;

  constructor(game, x, y, width, height) {
    this.id = this.constructor.name + GameObject.uid;

    game.debugger.log(`${this.id} object is under construction`);

    this.game = game;
    this.components = new Map();

    this.canvasLayer = {
      context: null
    };

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
        this.lastCommand = command;
      
        const commandCallback = this.cmdCbMap.get(this.lastCommand);
      
        commandCallback();
      }
    }
  }

  getComponent(componentClass) {
    if (this.components.has(componentClass)) {
      return this.components.get(componentClass);
    }
  }

  init(canvas = null) {
    if (canvas && !this.canvasLayer.context) {
      this.canvasLayer.context = canvas.getContext("2d");

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
