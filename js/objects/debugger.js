import Transform from "../components/transform.js";

export default class Debugger {
  game = null;
  container = null;
  fps = null;
  content = null;
  output = null;
  watcher = null;
  heightBtn = null;
  outputBtn = null;
  objectsBtn = null;
  watched = [];

  isSelected = false;
  cursorX = 0;
  cursorY = 0;
  offsetX = 0;
  offsetY = 0;

  constructor(game) {
    this.game = game;
    this.container = document.getElementById("debugger");
    this.fps = document.getElementById("debugger-fps");
    this.content = document.getElementById("debugger-content");
    this.output = document.getElementById("debugger-output");
    this.watcher = document.getElementById("debugger-watcher");

    this.heightBtn = document.getElementById("height-btn");
    this.outputBtn = document.getElementById("output-btn");
    this.objectsBtn = document.getElementById("objects-btn");

    this.showTab(this.output);
    this.container.classList.add("debugger--minimalized");

    this.container.addEventListener("mousedown", (mouseEvent) => {
      mouseEvent.preventDefault();

      this.isSelected = true;
      this.cursorX = mouseEvent.x;
      this.cursorY = mouseEvent.y;

      document.addEventListener("mousemove", (mouseEvent) => {
        if (this.isSelected) {
          this.offsetX = this.cursorX - mouseEvent.x;
          this.offsetY = this.cursorY - mouseEvent.y;

          this.cursorX = mouseEvent.x;
          this.cursorY = mouseEvent.y;

          this.container.style.left = `${
            this.container.offsetLeft - this.offsetX
          }px`;
          this.container.style.top = `${
            this.container.offsetTop - this.offsetY
          }px`;
        }
      });

      document.addEventListener("mouseup", () => {
        this.isSelected = false;
        this.cursorOffsetX = 0;
        this.cursorOffsetY = 0;

        document.onmouseup = null;
        document.onmousemove = null;
      });
    });

    this.heightBtn.addEventListener("click", () => {
      this.container.classList.toggle("debugger--minimalized");
    });

    this.outputBtn.addEventListener("click", () => {
      this.showTab(this.output);
    });

    this.objectsBtn.addEventListener("click", () => {
      this.showTab(this.watcher);
    });
  }

  showTab(tab) {
    for (const element of this.content.children) {
      element.classList.add("hidden");
    }

    tab.classList.remove("hidden");
  }

  log(msg) {
    if (this.output) {
      const p = document.createElement("p");

      p.innerHTML = msg;
      this.output.appendChild(p);
      p.scrollIntoView({behavior: "smooth"});
    }
  }

  watch(gameObject) {
    if (this.watcher) {
      const container = document.createElement("li");
      const watched = {
        object: gameObject,
        id: gameObject.id,
        container: container,
      };

      container.id = gameObject.id;
      container.classList.add("debugger__watched");

      this.watched.push(watched);
      this.watcher.appendChild(container);
    }
  }

  unwatch(gameObject) {
    const element = document.getElementById(gameObject.id);

    if (element) {
      this.watcher.removeChild(element);
    }

    for (const watched of this.watched) {
      if (watched.id === gameObject.id) {
        this.watched.splice(this.watched.indexOf(watched), 1);
      }
    }
  }

  update() {
    this.fps.innerHTML = this.game.fps;

    for (const watched of this.watched) {
      const object = watched.object;
      const transform = object.getComponent(Transform);

      let html = `
        <table>
          <caption>${object.id}</caption>
          <tr>
            <td>Position: </td>
            <td>X: ${Math.floor(transform.position.x)}</td>
            <td>Y: ${Math.floor(transform.position.y)}</td>
          </tr>
          <tr>
            <td>Width: </td>
            <td>${object.width}</td>
          </tr>
          <tr>
            <td>Height: </td>
            <td>${object.height}</td>
          </tr>
          <tr>
            <td></td><td>Top: ${Math.floor(transform.rect.top)}</td><td></td>
          </tr>
          <tr>
            <td>Left: ${Math.floor(
              transform.rect.left
            )}</td><td></td><td>Right: ${Math.floor(transform.rect.right)}</td>
          </tr>
          <tr>
            <td></td><td>Bottom: ${Math.floor(
              transform.rect.bottom
            )}</td><td></td>
          </tr>
      `;

      if (object.animation) {
        html += `<tr>
          <td>State: </td><td colspan="2">${object.animation.name}</td>
        </tr>
        <tr>
          <td>Frame: </td><td colspan="2">${object.animation.currentFrame.id}</td>
        </tr>`;
      }

      html += "</table>";

      watched.container.innerHTML = html;
    }
  }
}
