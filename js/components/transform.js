import Component from "./component.js";

export default class Transform extends Component {
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

      this.gameObject.canvasLayer.context.setTransform(
        this.scale.x,
        this.skew.v,
        this.skew.h,
        this.scale.y,
        screenPosX,
        screenPosY
      );
    } else {
      this.gameObject.canvasLayer.context.setTransform(
        this.scale.x,
        this.skew.v,
        this.skew.h,
        this.scale.y,
        this.position.x,
        this.position.y
      );
    }

    this.gameObject.canvasLayer.context.rotate((this.rotation * Math.PI) / 180);
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
