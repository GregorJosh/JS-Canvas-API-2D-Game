import Component from "./component.js";
import Transform from "./transform.js";

export default class Camera extends Component {
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
  