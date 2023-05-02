import GameObject from "./game-object.js";

import Transform from "../components/transform.js";
import SpriteSheet from "../components/spritesheet.js";
import Animation from "../components/animation.js";

export default class Sprite extends GameObject {
  animationDefs = [];
  animation = null;
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

    this.canvasContext.save();
    transform.apply();

    const spritesheetPosX =
      spritesheet.tile.width * (this.animation.currentFrame.id - 1);
    const spritesheetPosY =
      spritesheet.tile.height * (this.animation.spritesheetRow - 1);

    this.canvasContext.drawImage(
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
    this.canvasContext.restore();
  }

  chooseAnimation(newAnimationName) {
    if (this.animation) {
      if (this.animation.name == newAnimationName) {
        return;
      }

      this.removeComponent(Animation);
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
    this.attachComponent(SpriteSheet).setImageByNumOfTiles(
      spriteSrc,
      numOfCols,
      numOfRows
    );
  }

  setSpriteByTileSize(spriteSrc, tileWidth, tileHeight) {
    this.attachComponent(SpriteSheet).setImageByTileSize(
      spriteSrc,
      tileWidth,
      tileHeight
    );
  }
}
