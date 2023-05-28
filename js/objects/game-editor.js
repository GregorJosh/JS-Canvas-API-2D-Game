import SpriteSheet from "../components/spritesheet.js";
import Engine from "./engine.js";
import Scene from "./scene.js";
import TileMap from "./tilemap.js";

export default class GameEditor extends Scene {
  container = null;

  tilePickerWnd = null;
  hoverTilePos = null;
  selTilePos = null;
  tilePicker = null;
  atlas = null;
  atlasGrid = null;
  
  levelEditor = {
    windowContainerElement: null,
    windowContentElement: null, 
    levelScene: null, 
    levelTileMap: null, 
    levelGrid: null,
    init: function() {
      this.windowContainerElement = document.getElementById("level-editor-window");
      this.windowContentElement = document.getElementById("level-editor").addEventListener("click", this);
      
    },
    show: function() {
const tilemap = new TileMap(this.game, 5, 5, this.atlas.image.src, 32, 32);
    this.tilemap = tilemap;

    const level = this.game.createScene("Level", 800, 600);
    level.setCanvas("editor-canvas");
    level.addGameObject(tilemap);
    level.start();

    this.level = level;
    this.createLevelGrid();
    },
    handleEvent: function(event) {
      
    }
  };

  levelEditorWnd = null;
  level = null;
  tilemap = null;
  levelGrid = null;

  selectedTile = {
    col: 1,
    row: 1,
  };

  constructor(gameInstance, sceneTitle = "Game Editor") {
    if (Engine.isEditorCreated()) {
      return Engine.getEditorInstance();
    }

    super(gameInstance, sceneTitle, window.innerWidth, window.innerHeight);

    this.tilePickerWnd = document.getElementById("tile-picker-window");
    this.tilePicker = document.getElementById("tile-picker");
    this.hoverTilePos = document.getElementById("mouseover-position");
    this.selTilePos = document.getElementById("selected-position");
    
    this.levelEditor.init();

    this.tilePicker.addEventListener("mouseout", (mouseEvent) => {
      this.hoverTilePos.textContent = "";
    });

    Engine.setEditorInstance(this);
  }

  addGridCol(grid) {
    const newCells = [];

    for (const row of grid.table.rows) {
      const newCell = row.insertCell();

      this.initGridCell(newCell, row.cells.length, row.rowIndex + 1);
      newCells.push(newCell);
    }

    return newCells;
  }

  addGridRow(grid, numOfCols) {
    const newGridRow = grid.table.insertRow();

    for (let i = 0; i < numOfCols; i += 1) {
      const newGridCell = newGridRow.insertCell();

      this.initGridCell(newGridCell, i + 1, grid.table.rows.length);
    }

    return newGridRow;
  }

  clean() {
    super.clean();
    this.level.clean();
  }

  createGrid(numOfCols, numOfRows) {
    const cells = [];
    const table = document.createElement("table");

    table.classList.add("game-editor__grid");

    for (let i = 0; i < numOfRows; i += 1) {
      const gridRow = table.insertRow();

      for (let j = 0; j < numOfCols; j += 1) {
        const gridCell = gridRow.insertCell();

        this.initGridCell(gridCell, j + 1, i + 1);
        cells.push(gridCell);
      }
    }

    return {
      table,
      cells,
    };
  }

  createAtlasGrid() {
    const grid = this.createGrid(this.atlas.cols, this.atlas.rows);

    for (const cell of grid.cells) {
      cell.addEventListener("mouseover", (mouseEvent) => {
        const target = mouseEvent.target;

        this.hoverTilePos.textContent = `${target.dataset.col} : ${target.dataset.row}`;
      });

      cell.addEventListener("click", (mouseEvent) => {
        this.selectTile(mouseEvent.target);
      });
    }

    this.tilePicker.appendChild(grid.table);
    this.atlasGrid = grid;
  }

  createLevelGrid() {
    const levelGrid = this.createGrid(
      this.tilemap.numOfCols + 1,
      this.tilemap.numOfRows + 1
    );

    for (const cell of levelGrid.cells) {
      cell.addEventListener("click", (mouseEvent) => {
        this.onCellClick(mouseEvent.target);
      });
    }

    this.levelEditor.appendChild(levelGrid.table);
    this.levelGrid = levelGrid;
  }

  deselectAllTiles() {
    for (const row of this.atlasGrid.table.rows) {
      for (const cell of row.cells) {
        if (cell.classList.contains("selected")) {
          cell.classList.remove("selected");
        }
      }
    }
  }

  getSelectedTile() {
    const id = `c${this.selectedTile.col}r${this.selectedTile.row}`;

    return document.getElementById(id);
  }

  onCellClick(cell) {
    if (cell.dataset.col > this.tilemap.numOfCols) {
      this.tilemap.fillNewCol(this.selectedTile.col, this.selectedTile.row);

      const newGridCells = this.addGridCol(this.levelGrid);

      for (const cell of newGridCells) {
        cell.addEventListener("click", (mouseEvent) => {
          this.onCellClick(mouseEvent.target);
        });
      }
    }

    if (cell.dataset.row > this.tilemap.numOfRows) {
      this.tilemap.fillNewRow(this.selectedTile.col, this.selectedTile.row);

      const gridRow = this.addGridRow(this.levelGrid, this.tilemap.numOfCols + 1);

      for (const cell of gridRow.cells) {
        cell.addEventListener("click", (mouseEvent) => {
          this.onCellClick(mouseEvent.target);
        });
      }
    }

    this.tilemap.setTile(cell.dataset.col, cell.dataset.row, {
      colValue: this.selectedTile.col,
      rowValue: this.selectedTile.row,
    });
  }

  setAtlas(src, tileWidth, tileHeight) {
    const atlas = this.attachComponent(SpriteSheet);
    atlas.setImageByTileSize(src, tileWidth, tileHeight);
    atlas.image.classList.add("game-editor__atlas");

    this.atlas = atlas;
  }

  initGridCell(gridCell, colValue, rowValue) {
    gridCell.style.width = `${this.atlas.tile.width}px`;
    gridCell.style.height = `${this.atlas.tile.height}px`;
    gridCell.setAttribute("data-col", colValue);
    gridCell.setAttribute("data-row", rowValue);
    gridCell.id = `c${colValue}r${rowValue}`;
  }

  selectTile(tileCellElement = null) {
    this.deselectAllTiles();

    if (tileCellElement) {
      tileCellElement.classList.add("selected");

      this.selectedTile.row = tileCellElement.dataset.row;
      this.selectedTile.col = tileCellElement.dataset.col;
    } else {
      this.getSelectedTile().classList.add("selected");
    }

    this.selTilePos.textContent = `${this.selectedTile.col} : ${this.selectedTile.row}`;
  }

  showTilePicker() {
    this.tilePicker.appendChild(this.atlas.image);
    this.createAtlasGrid();
    this.selectTile();
  }

  showLevelEditor() {
    const tilemap = new TileMap(this.game, 5, 5, this.atlas.image.src, 32, 32);
    this.tilemap = tilemap;

    const level = this.game.createScene("Level", 800, 600);
    level.setCanvas("editor-canvas");
    level.addGameObject(tilemap);
    level.start();

    this.level = level;
    this.createLevelGrid();
  }

  start() {
    super.start();
    this.showTilePicker();
    this.showLevelEditor();
  }
}
