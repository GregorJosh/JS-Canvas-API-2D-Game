import Component from "./component.js";
import Transform from "./transform.js";

export default class Collider extends Component {
    update() {
      if (this.gameObject.parent) {
        const parentTransform = this.gameObject.parent.getComponent(Transform);
        const movingTransform = this.gameObject.getComponent(Transform);
  
        if (movingTransform.rect.left < parentTransform.rect.left) {
          movingTransform.setLeft(parentTransform.rect.left);
        }
  
        if (movingTransform.rect.top < parentTransform.rect.top) {
          movingTransform.setTop(parentTransform.rect.top);
        }
  
        if (movingTransform.rect.right > parentTransform.rect.right) {
          movingTransform.setRight(parentTransform.rect.right);
        }
  
        if (movingTransform.rect.bottom > parentTransform.rect.bottom) {
          movingTransform.setBottom(parentTransform.rect.bottom);
        }
      }
    }
  }
  