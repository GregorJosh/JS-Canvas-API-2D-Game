export default class Component {
  game = null;
  gameObject = null;

  constructor(game, gameObject) {
    this.game = game;
    this.gameObject = gameObject;

    this.game.debugger.log(
      `${this.constructor.name} component for ${this.gameObject.id} is constructed`
    );
  }

  draw() {}
  init() {}
  update() {}
}
