import GameObject from "./gameObject.js";

import Camera from "../components/camera.js";
import Collider from "../components/collider.js";

export default class PhysicalCamera extends GameObject {
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
