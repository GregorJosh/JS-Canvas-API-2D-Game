import Sprite from "./sprite.js";

import Collider from "../components/collider.js";
import Transform from "../components/transform.js";

export default class Character extends Sprite {
  velocity = {
    x: 0,
    y: 0,
  };

  speed = 60;
  direction = "right";
  state = "is standing";
  lastState = "";

  constructor(game, width, height) {
    super(game, width, height);

    this.attachComponent(Collider);
    this.lastState = this.state;
  }
  
  animate(animationName) {
    if (this.lastState !== this.state) {
      super.animate(animationName);
      
      this.lastState = this.state;
    }
  }

  moveLeft() {
    this.direction = "left";
    this.velocity.x -= this.speed;
    this.state = "is moving";
  }

  moveRight() {
    this.direction = "right";
    this.velocity.x += this.speed;
    this.state = "is moving";
  }

  moveUp() {
    this.direction = "up";
    this.velocity.y -= this.speed;
    this.state = "is moving";
  }

  moveDown() {
    this.direction = "down";
    this.velocity.y += this.speed;
    this.state = "is moving";
  }

  update() {
    super.update();

    const scene = this.game.scene;
    const transform = this.getComponent(Transform);

    transform.position.x += this.velocity.x * scene.lastFrameDurSec;
    transform.position.y += this.velocity.y * scene.lastFrameDurSec;

    this.velocity.x = 0;
    this.velocity.y = 0;
    this.state = "is standing";
  }
}
