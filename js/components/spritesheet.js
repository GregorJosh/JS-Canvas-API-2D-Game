import Component from "./component.js";

export default class SpriteSheet extends Component {
    cols = 0;
    rows = 0;
  
    tile = {
      width: 0,
      height: 0,
    };
  
    image = null;
  
    setImageByTileSize(src, tileWidth, tileHeight) {
      if (!this.image) {
        this.image = new Image();
        this.image.addEventListener("load", () => {
          this.tile.width = tileWidth;
          this.tile.height = tileHeight;
  
          this.cols = this.image.width / tileWidth;
          this.rows = this.image.height / tileHeight;
        });
        this.image.src = src;
      }
    }
  
    setImageByNumOfTiles(src, numOfCols, numOfRows) {
      if (!this.image) {
        this.image = new Image();
        this.image.addEventListener("load", () => {
          this.tile.width = this.image.width / numOfCols;
          this.tile.height = this.image.height / numOfRows;
  
          this.cols = this.image.width / this.tile.width;
          this.rows = this.image.height / this.tile.height;
        });
        this.image.src = src;
      }
    }
  }
