import Engine from "./objects/engine.js";
import Input from "./objects/input.js";
import TileMap from "./objects/tilemap.js";
import Character from "./objects/character.js";

const game = Engine.createGame("Skeleton");

const editor = Engine.createEditor(game, "Game Editor");
editor.setAtlas("images/terrain-and-objects.png", 32, 32);
game.addScene(editor);

game.createScene("Main Menu", window.innerWidth, window.innerHeight);

const level1 = game.createScene(
  "Level 1",
  window.innerWidth,
  Input.touchScreen ? window.innerHeight / 2 : window.innerHeight
);
level1.setCanvas("main-canvas");

level1.onStart = function () {
  const world = new TileMap(
    game,
    60,
    40,
    "images/terrain-and-objects.png",
    32,
    32
  );

  const player = new Character(game, 80, 100);
  player.setSpriteByNumOfTiles("images/skeleton-walk.png", 9, 4);
  player.defineAnimation("walk up", 1, 9);
  player.defineAnimation("walk down", 3, 9);
  player.defineAnimation("walk left", 2, 9);
  player.defineAnimation("walk right", 4, 9);
  player.defineAnimation("look up", 1, 1);
  player.defineAnimation("look down", 3, 1);
  player.defineAnimation("look left", 2, 1);
  player.defineAnimation("look right", 4, 1);

  player.addCmdKeys(["w"], "walk up", ["ArrowUp"]);
  player.addCmdKeys(["s"], "walk down", ["ArrowDown"]);
  player.addCmdKeys(["a"], "walk left", ["ArrowLeft"]);
  player.addCmdKeys(["d"], "walk right", ["ArrowRight"]);

  player.onCommand("walk up", () => {
    player.moveUp();
    player.animate("walk up");
  });

  player.onCommand("walk down", () => {
    player.moveDown();
    player.animate("walk down");
  });

  player.onCommand("walk left", () => {
    player.moveLeft();
    player.animate("walk left");
  });

  player.onCommand("walk right", () => {
    player.moveRight();
    player.animate("walk right");
  });

  player.onUpdate = function () {
    if (this.state === "is standing") {
      this.animate(`look ${this.direction}`);
    }
  };

  world.addGameObject(this.camera);
  world.addGameObject(player);
  this.addGameObject(world);

  this.camera.lookAt(player);
};

level1.addCmdKeys(["Escape"], "back to menu");
level1.onCommand("back to menu", () => {
  game.start("Main Menu");
});

game.start("Main Menu");

document.getElementById("start-btn").addEventListener("click", () => {
  game.start("Level 1");
});

document.getElementById("edit-btn").addEventListener("click", () => {
  game.start("Game Editor");
});

document.querySelectorAll(".quit-btn").forEach((quitBtn) => {
  quitBtn.addEventListener("click", () => {
    game.start("Main Menu");
  });
});
