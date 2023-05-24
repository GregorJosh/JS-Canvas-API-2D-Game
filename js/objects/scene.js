import Input from "./input.js";
import GameObject from "./game-object.js";
import PhysicalCamera from "./physical-camera.js";

export default class Scene extends GameObject {
  title = "";
  state = "stopped";

  hiddenLayerClassName = "hidden";

  guiLayer = null;
  mobileLayer = null;
  htmlLayer = null;

  camera = null;

  onStart = null;

  firstAnimFrame = 0;
  animFrame = 0;

  prevTimeStamp = 0;
  lastFrameDurMs = 0;
  lastFrameDurSec = 0;

  static getElementBySceneTitle(sceneTitle) {
    const id = sceneTitle.replace(" ", "-").toLowerCase();

    return document.getElementById(id);
  }

  constructor(game, sceneTitle, width, height) {
    super(game, 0, 0, width, height);

    this.htmlLayer = {
      container: null,
    };

    this.title = sceneTitle;
  }

  draw() {
    if (this.type === "canvas") {
      const canvas = this.canvas;

      canvas.context.save();
      canvas.context.clearRect(0, 0, canvas.camera.width, canvas.camera.height);

      super.draw();

      canvas.context.restore();
    }
  }

  renderFrame(timeStamp) {
    this.lastFrameDurMs = timeStamp - this.prevTimeStamp;
    this.lastFrameDurSec = this.lastFrameDurMs / 1000;

    const fps = 1 / this.lastFrameDurSec;

    this.prevTimeStamp = timeStamp;
    this.game.fps = Math.round(fps);

    this.update();
    this.draw();

    if (this.state === "playing") {
      this.animFrame = window.requestAnimationFrame((timeStamp) =>
        this.renderFrame(timeStamp)
      );

      window.cancelAnimationFrame(this.firstAnimFrame);

      this.firstAnimFrame = 0;
    } else if (this.state === "stopped") {
      this.animFrame = 0;
    }
  }

  showCanvasLayer() {
    const canvas = this.canvas;

    canvas.element = document.getElementById(canvas.id);
    canvas.element.width = canvas.width;
    canvas.element.height = canvas.height;

    canvas.camera = new PhysicalCamera(
      this.game,
      0,
      0,
      canvas.width,
      canvas.height
    );

    this.addGameObject(canvas.camera);
    this.camera = canvas.camera;

    canvas.element.classList.remove(this.hiddenLayerClassName);
  }

  showHTMLLayer() {
    const htmlLayer = this.htmlLayer;

    htmlLayer.container = Scene.getElementBySceneTitle(this.title);

    if (htmlLayer.container) {
      htmlLayer.container.width = window.innerWidth;
      htmlLayer.container.height = window.innerHeight;
      htmlLayer.container.classList.remove(this.hiddenLayerClassName);
    }
  }

  showMobileLayer() {
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

    this.mobileLayer = {
      controlPanel: document.getElementById("control-panel"),
    };

    this.mobileLayer.controlPanel.classList.remove("hidden");
  }

  start() {
    if (this.type === "canvas") {
      this.showCanvasLayer();
    }

    if (this.onStart) {
      this.onStart();
    }

    this.showHTMLLayer();

    if (this.type === "canvas") {
      this.assignCanvasContext(this.canvas.element);

      if (Input.touchScreen) {
        this.showMobileLayer();
      }
    }

    this.firstAnimFrame = window.requestAnimationFrame((timeStamp) => {
      this.renderFrame(timeStamp);
    });

    this.state = "playing";
  }

  stop() {
    if (this.htmlLayer.container) {
      this.htmlLayer.container.classList.add(this.hiddenLayerClassName);
      this.htmlLayer.container = null;
    }

    if (this.mobileLayer && this.mobileLayer.controlPanel) {
      this.mobileLayer.controlPanel.classList.add(this.hiddenLayerClassName);
      this.mobileLayer.controlPanel = null;
      this.mobileLayer = null;
    }

    if (this.type === "canvas") {
      const canvas = this.canvas;

      canvas.element.classList.add(this.hiddenLayerClassName);
      canvas.element = null;
    }

    window.cancelAnimationFrame(this.animFrame);

    this.animFrame = 0;
    this.state = "stopped";
  }

  update() {
    this.game.update();
    super.update();
  }
}
