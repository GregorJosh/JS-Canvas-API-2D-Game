import GameObject from "./game-object.js";

import Camera from "../components/camera.js";
import Collider from "../components/collider.js";

export default class PhysicalCamera extends GameObject {
  camera = null;
  collder = null;

  constructor(game, x, y, width, height) {
    super(game, x, y, width, height);

    this.camera = this.attachComponent(Camera);
    this.collider = this.attachComponent(Collider);
  }

  lookAt(gameObject) {
    this.camera.lookAt(gameObject);
  }
}
