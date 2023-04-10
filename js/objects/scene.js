import Input from "./input.js";
import GameObject from "./gameObject.js";
import PhysicalCamera from "./physicalCamera.js";

export default class Scene extends GameObject {
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
