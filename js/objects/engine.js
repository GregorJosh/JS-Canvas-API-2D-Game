import GameEditor from "./game-editor.js";
import Game from "./game.js";

export default class Engine {
  static #gameInstance = null;
  static #editorInstance = null;

  static createGame(title = "Game Title") {
    if (!this.#gameInstance) {
      new Game(title);
    }

    return this.#gameInstance;
  }

  static createEditor(gameInstance, sceneTitle = "Game Editor") {
    if (!this.#editorInstance) {
      new GameEditor(gameInstance, sceneTitle);
    }

    return this.#editorInstance;
  }

  static isGameCreated() {
    return this.#gameInstance ? true : false;
  }

  static isEditorCreated() {
    return this.#editorInstance ? true : false;
  }

  static getGameInstance() {
    return this.#gameInstance;
  }

  static getEditorInstance() {
    return this.#editorInstance;
  }

  static setGameInstance(gameInstance) {
    this.#gameInstance = gameInstance;
  }

  static setEditorInstance(editorInstance) {
    this.#editorInstance = editorInstance;
  }
}
