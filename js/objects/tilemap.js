import GameObject from "./game-object.js";

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

    this.fillWithTile(2, 2);
  }

  draw() {
    const canvas = this.canvas;
    const transform = this.getComponent(Transform);
    const atlas = this.getComponent(SpriteSheet);

    canvas.context.save();
    transform.apply();

    for (let i = 0; i < this.tilemap.length; i += 1) {
      for (let j = 0; j < this.tilemap[i].length; j += 1) {
        const sx = (this.tilemap[i][j].col - 1) * atlas.tile.width;
        const sy = (this.tilemap[i][j].row - 1) * atlas.tile.height;

        const dx = j * atlas.tile.width;
        const dy = i * atlas.tile.height;

        canvas.context.drawImage(
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
    canvas.context.restore();
  }

  fillNewCol(colValue, rowValue) {
    for (const row of this.tilemap) {
      row.push({
        col: colValue,
        row: rowValue,
      });
    }

    this.numOfCols += 1;
  }

  fillNewRow(colValue, rowValue) {
    const row = [];

    for (let i = 0; i < this.numOfCols; i += 1) {
      row.push({
        col: colValue,
        row: rowValue,
      });
    }

    this.tilemap.push(row);
    this.numOfRows += 1;
  }

  fillWithTile(colValue, rowValue) {
    for (let i = 0; i < this.numOfRows; i += 1) {
      const row = [];

      for (let j = 0; j < this.numOfCols; j += 1) {
        row.push({
          col: colValue,
          row: rowValue,
        });
      }

      this.tilemap.push(row);
    }
  }

  setTile(col, row, { colValue, rowValue }) {
    const tile = this.tilemap[row - 1][col - 1];

    tile.col = colValue;
    tile.row = rowValue;
  }

  update() {
    const atlas = this.getComponent(SpriteSheet);

    this.width = atlas.tile.width * this.numOfCols;
    this.height = atlas.tile.height * this.numOfRows;
    this.numOfTiles = this.numOfCols * this.numOfRows;

    super.update();
  }
}
