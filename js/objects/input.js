export default class Input {
  static keys = false;
  static buttons = false;
  static touchScreen = false;

  static mouse = {
    x: 0,
    y: 0,
  };

  static {
    if ("ontouchstart" in window) {
      this.touchScreen = true;

      window.addEventListener("touchstart", (event) => {
        const x = Math.floor(event.touches[0].clientX);
        const y = Math.floor(event.touches[0].clientY);

        if (!this.buttons) {
          this.buttons = [];
        }

        this.buttons["left"] = true;
        this.setMouseCoord(x, y);
      });

      window.addEventListener("touchend", () => {
        this.buttons["left"] = false;
      });
    }

    window.addEventListener("keydown", (event) => {
      this.setKey(event.key);
    });

    window.addEventListener("keyup", (event) => {
      this.unsetKey(event.key);
    });

    window.addEventListener("mousedown", (event) => {
      if (!this.buttons) {
        this.buttons = [];
      }

      this.buttons[this.getButtonName(event.button)] = true;
    });

    window.addEventListener("mouseup", (event) => {
      this.buttons[this.getButtonName(event.button)] = false;
    });

    window.addEventListener("mousemove", (event) => {
      this.setMouseCoord(event.x, event.y);
    });
  }

  static getKey(key) {
    if (this.keys && this.keys[key]) {
      return true;
    }

    return false;
  }

  static getKeys(keys) {
    let areAllpressed = true;

    for (let i = 0; i < keys.length; i++) {
      if (!Input.getKey(keys[i])) {
        areAllpressed = false;
      }
    }

    return areAllpressed;
  }

  static setKey(key) {
    if (!this.keys) {
      this.keys = [];
    }

    this.keys[key] = true;
  }

  static unsetKey(key) {
    this.keys[key] = false;
  }

  static getButton(button) {
    if (this.buttons && this.buttons[button]) {
      return true;
    }

    return false;
  }

  static getButtonName(button) {
    let name;

    switch (button) {
      case 0:
        name = "left";
        break;
      case 1:
        name = "middle";
        break;
      case 2:
        name = "right";
        break;
      default:
        name = "left";
    }

    return name;
  }

  static setMouseCoord(x, y) {
    this.mouse.x = x;
    this.mouse.y = y;
  }
}
