import GameObject from "./gameObject.js";

import Transform from "../components/transform.js";
import SpriteSheet from "../components/spritesheet.js";
import Animation from "../components/animation.js";

export default class Sprite extends GameObject {
  animationDefs = [];
  animation = null;
  prevAnimation = null;
  defaultAnimation = "idle";

  constructor(game, width, height) {
    super(game, 0, 0, width, height);

    this.defineAnimation(this.defaultAnimation, 1, 1);
    this.chooseAnimation(this.defaultAnimation);
    this.animation.start();
  }

  animate(animationName) {
    if (!this.animation || this.animation.name != animationName) {
      this.chooseAnimation(animationName);
    }

    this.animation.start();
  }

  defineAnimation(animationName, spritesheetRow, numOfFrames) {
    const animationDef = {
      name: animationName,
      id: spritesheetRow,
      length: numOfFrames,
    };

    this.animationDefs[animationName] = animationDef;
  }

  draw() {
    const transform = this.getComponent(Transform);
    const spritesheet = this.getComponent(SpriteSheet);

    this.context.save();
    transform.apply();

    const spritesheetPosX =
      spritesheet.tile.width * (this.animation.currentFrame.id - 1);
    const spritesheetPosY =
      spritesheet.tile.height * (this.animation.spritesheetRow - 1);

    this.context.drawImage(
      spritesheet.image,
      spritesheetPosX,
      spritesheetPosY,
      spritesheet.tile.width,
      spritesheet.tile.height,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );

    super.draw();
    this.context.restore();
  }

  chooseAnimation(newAnimationName) {
    if (this.animation) {
      if (this.animation.name == newAnimationName) {
        return;
      }

      this.removeComponent(Animation);
      this.animation = null;
    }

    const animationDef = this.animationDefs[newAnimationName];

    this.animation = this.attachComponent(Animation);
    this.animation.setCycle(
      animationDef.name,
      animationDef.id,
      animationDef.length
    );
  }

  setSpriteByNumOfTiles(spriteSrc, numOfCols, numOfRows) {
    const spritesheet = this.attachComponent(SpriteSheet);
    spritesheet.setImageByNumOfTiles(spriteSrc, numOfCols, numOfRows);
  }

  setSpriteByTileSize(spriteSrc, tileWidth, tileHeight) {
    const spritesheet = this.attachComponent(SpriteSheet);
    spritesheet.setImageByTileSize(spriteSrc, tileWidth, tileHeight);
  }
}
