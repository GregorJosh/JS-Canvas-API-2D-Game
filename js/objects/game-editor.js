import SpriteSheet from "../components/spritesheet.js";
import Engine from "./engine.js";
import Scene from "./scene.js";

export default class GameEditor extends Scene {
  atlas = null;
  atlasContainer = null;

  constructor(gameInstance, sceneTitle = "Game Editor") {
    if (Engine.isEditorCreated()) {
      return Engine.getEditorInstance();
    }

    super(gameInstance, sceneTitle);

    this.atlasContainer = document.getElementById("tile-picker");

    Engine.setEditorInstance(this);
  }

  createGrid() {
    let gridHTML = "<table class='game-editor__atlas-grid'>";

    for (let i = 0; i < this.atlas.rows; i += 1) {
      gridHTML += "<tr>";

      for (let j = 0; j < this.atlas.cols; j += 1) {
        gridHTML += `<td style='width: ${this.atlas.tile.width}px; height: ${this.atlas.tile.height}px;'></td>`;
      }

      gridHTML += "</tr>";
    }

    gridHTML += "</table>";

    this.atlasContainer.innerHTML = gridHTML;
  }

  setAtlas(src, tileWidth, tileHeight) {
    const atlas = this.attachComponent(SpriteSheet);
    atlas.setImageByTileSize(src, tileWidth, tileHeight);
    atlas.image.classList.add("game-editor__atlas");

    this.atlas = atlas;
  }

  start() {
    super.start();
    this.createGrid();
    this.atlasContainer.appendChild(this.atlas.image);
  }
}
