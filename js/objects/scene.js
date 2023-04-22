import Input from "./input.js";
import GameObject from "./gameObject.js";
import PhysicalCamera from "./physicalCamera.js";

export default class Scene extends GameObject {
  name = "Scene Name";
  type = "canvas";
  canvasLayer = null;
  guiLayer = null;
  htmlLayer = null;
  mobileLayer = null;
  mainCamera = null;
  onStart = null;
  firstAnimFrame = null;
  currentAnimFrame = null;
  prevTimeStamp = 0;
  lastFrameDurMs = 0;
  lastFrameDurSec = 0;
  state = "stopped";

  static getElementBySceneName(sceneName) {
    const id = sceneName.replace(" ", "-").toLowerCase();

    return document.getElementById(id);
  }

  constructor(game, name = "", type = "") {
    super(game, 0, 0, 0, 0);

    this.htmlLayer = {
      container: null,
    };

    if (name) {
      this.name = name;
    }

    if (type) {
      this.type = type;
    }

    if (this.type === "canvas") {
      this.canvasLayer = {
        elementId: "main-canvas",
        element: null,
        context: null,
        camera: null,
      };
    }

    if (Input.touchScreen) {
      this.mobileLayer = {
        controlPanel: null,
      };
    }
  }

  draw() {
    if (this.canvasLayer) {
      this.canvasLayer.context.save();
      this.canvasLayer.context.clearRect(
        0,
        0,
        this.canvasLayer.element.width,
        this.canvasLayer.element.height
      );
      super.draw();
      this.canvasLayer.context.restore();
    }
  }

  init() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.htmlLayer.container = Scene.getElementBySceneName(this.name);

    if (this.htmlLayer.container) {
      this.htmlLayer.container.height = height;
      this.htmlLayer.container.width = width;
    }

    if (this.type === "canvas") {
      this.canvasLayer.element = document.getElementById(
        this.canvasLayer.elementId
      );

      if (Input.touchScreen) {
        this.canvasLayer.element.height = height / 2;
        this.mobileLayer.controlPanel =
          document.getElementById("control-panel");
      } else {
        this.canvasLayer.element.height = height;
      }

      this.canvasLayer.element.width = width;

      this.canvasLayer.camera = new PhysicalCamera(
        this.game,
        0,
        0,
        this.canvasLayer.element.width,
        this.canvasLayer.element.height
      );

      this.addGameObject(this.canvasLayer.camera);
      this.mainCamera = this.canvasLayer.camera;

      super.init(this.canvasLayer.element);
    }

    this.width = width;
    this.height = height;
  }

  renderFrame(timeStamp) {
    this.lastFrameDurMs = timeStamp - this.prevTimeStamp;
    this.lastFrameDurSec = this.lastFrameDurMs / 1000;

    const fps = 1 / this.lastFrameDurSec;

    this.prevTimeStamp = timeStamp;
    this.game.fps = Math.round(fps);

    this.update();
    this.draw();

    if (this.state == "playing") {
      this.currentAnimFrame = window.requestAnimationFrame((timeStamp) =>
        this.renderFrame(timeStamp)
      );

      window.cancelAnimationFrame(this.firstAnimFrame);

      this.firstAnimFrame = null;
    } else if (this.state == "stopped") {
      this.currentAnimFrame = null;
    }
  }

  start() {
    this.init();

    if (this.htmlLayer.container) {
      this.htmlLayer.container.classList.remove("removed");
    }

    if (this.mobileLayer && this.mobileLayer.controlPanel) {
      this.mobileLayer.controlPanel.classList.remove("removed");

      const btnUp = document.getElementById("up-btn");
      const btnDown = document.getElementById("down-btn");
      const btnLeft = document.getElementById("left-btn");
      const btnRight = document.getElementById("right-btn");

      btnUp.addEventListener("touchstart", () => {
        Input.setKey("ArrowUp");
      });

      btnUp.addEventListener("touchend", () => {
        Input.unsetKey("ArrowUp");
      });

      btnDown.addEventListener("touchstart", () => {
        Input.setKey("ArrowDown");
      });

      btnDown.addEventListener("touchend", () => {
        Input.unsetKey("ArrowDown");
      });

      btnLeft.addEventListener("touchstart", () => {
        Input.setKey("ArrowLeft");
      });

      btnLeft.addEventListener("touchend", () => {
        Input.unsetKey("ArrowLeft");
      });

      btnRight.addEventListener("touchstart", () => {
        Input.setKey("ArrowRight");
      });

      btnRight.addEventListener("touchend", () => {
        Input.unsetKey("ArrowRight");
      });
    }

    if (this.canvasLayer && this.canvasLayer.element) {
      this.canvasLayer.element.classList.remove("removed");
    }

    if (this.onStart) {
      this.onStart();
    }

    this.firstAnimFrame = window.requestAnimationFrame((timeStamp) => {
      this.renderFrame(timeStamp);
    });

    this.state = "playing";
  }

  stop() {
    if (this.htmlLayer.container) {
      this.htmlLayer.container.classList.add("removed");
      this.htmlLayer.container = null;
    }

    if (this.mobileLayer && this.mobileLayer.controlPanel) {
      this.mobileLayer.controlPanel.classList.add("removed");
      this.mobileLayer.controlPanel = null;
      this.mobileLayer = null;
    }

    if (this.canvasLayer && this.canvasLayer.element) {
      this.canvasLayer.context = null;
      this.canvasLayer.element.classList.add("removed");
      this.canvasLayer.element = null;
      this.canvasLayer = null;
    }

    window.cancelAnimationFrame(this.currentAnimFrame);

    this.currentAnimFrame = null;
    this.state = "stopped";
  }

  update() {
    this.game.update();
    super.update();
  }
}
