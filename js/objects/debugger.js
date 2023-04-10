import Transform from "../components/transform.js";

export default class Debugger {
  game = null;
  container = null;
  fps = null;
  output = null;
  watcher = null;
  watched = [];

  constructor(game) {
    this.game = game;
    this.container = document.getElementById("debugger-container");
    this.fps = document.getElementById("fps");
    this.output = document.getElementById("debugger-output");
    this.watcher = document.getElementById("debugger-watcher");
  }

  log(msg) {
    if (this.output) {
      const p = document.createElement("p");

      p.innerHTML = msg;
      this.output.appendChild(p);
      this.output.scrollTop = this.output.scrollHeight;
    }
  }

  watch(gameObject) {
    if (this.watcher) {
      const li = document.createElement("li");
      const watched = {
        object: gameObject,
        element: li,
      };

      li.id = gameObject.id;
      li.classList.add("debug-window__watched");

      this.watched.push(watched);
      this.watcher.appendChild(li);
    }
  }

  update() {
    this.fps.innerHTML = this.game.fps;

    for (const id in this.watched) {
      const o = this.watched[id].object;
      const transform = o.getComponent(Transform);
      const innerHTML =
        o.id +
        " position: " +
        Math.floor(transform.position.x) +
        ":" +
        Math.floor(transform.position.y) +
        " width: " +
        o.width +
        " height: " +
        o.height +
        " left: " +
        Math.floor(transform.rect.left) +
        " right: " +
        Math.floor(transform.rect.right) +
        " top: " +
        Math.floor(transform.rect.top) +
        " bottom: " +
        Math.floor(transform.rect.bottom);

      this.watched[id].element.innerHTML = innerHTML;
    }
  }
}
