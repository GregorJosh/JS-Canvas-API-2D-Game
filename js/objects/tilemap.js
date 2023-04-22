import GameObject from "./gameObject.js";

import Transform from "../components/transform.js";
import SpriteSheet from "../components/spritesheet.js";

export default class TileMap extends GameObject {
  tilemap = [];
  numOfCols = 0;
  numOfRows = 0;
  numOfTiles = 0;

  constructor(game, numOfCols, numOfRows, atlasImgSrc, tileWidth, tileHeight) {
    const width = tileWidth * numOfCols;
    const height = tileHeight * numOfRows;

    super(game, 0, 0, width, height);

    this.numOfCols = numOfCols;
    this.numOfRows = numOfRows;
    this.numOfTiles = numOfCols * numOfRows;

    const atlas = this.attachComponent(SpriteSheet);
    atlas.setImageByTileSize(atlasImgSrc, tileWidth, tileHeight);

    for (let i = 0; i < this.numOfRows; ++i) {
      const row = [];

      for (let j = 0; j < this.numOfCols; ++j) {
        const tile = {
          col: 2,
          row: 2,
        };

        row.push(tile);
      }

      this.tilemap.push(row);
    }
  }

  draw() {
    const transform = this.getComponent(Transform);

    this.canvasLayer.context.save();
    transform.apply();

    const atlas = this.getComponent(SpriteSheet);

    for (let i = 0; i < this.tilemap.length; ++i) {
      for (let j = 0; j < this.tilemap[i].length; ++j) {
        const sx = (this.tilemap[i][j].col - 1) * atlas.tile.width;
        const sy = (this.tilemap[i][j].row - 1) * atlas.tile.height;

        const dx = j * atlas.tile.width;
        const dy = i * atlas.tile.height;

        this.canvasLayer.context.drawImage(
          atlas.image,
          sx,
          sy,
          atlas.tile.width,
          atlas.tile.height,
          dx,
          dy,
          atlas.tile.width,
          atlas.tile.height
        );
      }
    }

    super.draw();
    this.canvasLayer.context.restore();
  }
}
