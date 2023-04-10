import Debugger from "./debugger.js";

export default class Game {
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
  