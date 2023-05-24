import Debugger from "./debugger.js";
import Engine from "./engine.js";
import Scene from "./scene.js";

export default class Game {
  title = "";
  fps = 0;
  scenes = null;
  scene = null;
  debugger = null;
  onUpdate = null;

  constructor(title = "Game Title") {
    if (Engine.isGameCreated()) {
      return Engine.getGameInstance();
    }

    this.debugger = new Debugger(this);
    this.debugger.log("Game object is constructed");

    this.title = title;
    this.scenes = new Map();

    Engine.setGameInstance(this);
  }

  addScene(newScene) {
    this.scenes.set(newScene.title, newScene);
  }

  createScene(sceneTitle, width, height) {
    const scene = new Scene(this, sceneTitle, width, height);
    
    this.scenes.set(sceneTitle, scene);

    return scene;
  }

  start(sceneName) {
    if (this.scenes.has(sceneName)) {
      if (this.scene) {
        this.scene.stop();
        this.scene.clean();
      }

      this.scene = this.scenes.get(sceneName);
      this.scene.start();
    } else {
      console.error(`Game Class: Scene "${sceneName}" doesn't exist.`);
    }
  }

  update() {
    if (this.onUpdate) {
      this.onUpdate();
    }

    this.debugger.update();
  }
}
