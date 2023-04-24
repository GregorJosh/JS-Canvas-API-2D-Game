import Game from "./objects/game.js";
import Scene from "./objects/scene.js";
import TileMap from "./objects/tilemap.js";
import Character from "./objects/character.js";

window.addEventListener("load", () => {
  const color1 = "#7B6662";
  const game = new Game();
  const menu = new Scene(game, "Main Menu", "html");
  const level1 = new Scene(game, "Level 1");
  const world = new TileMap(
    game,
    60,
    40,
    "images/terrain_and_objects.png",
    32,
    32
  );

  const player = new Character(game, 80, 100);
  player.setSpriteByNumOfTiles("images/skeleton_walk.png", 9, 4);
  player.defineAnimation("walk up", 1, 9);
  player.defineAnimation("walk down", 3, 9);
  player.defineAnimation("walk left", 2, 9);
  player.defineAnimation("walk right", 4, 9);
  player.defineAnimation("look up", 1, 1);
  player.defineAnimation("look down", 3, 1);
  player.defineAnimation("look left", 2, 1);
  player.defineAnimation("look right", 4, 1);

  level1.onStart = () => {
    level1.mainCamera.camera.lookAt(player);
    world.addGameObject(level1.mainCamera);
    game.debugger.watch(level1.mainCamera);
  };

  level1.addCmdKeys(["Escape"], "back to menu");
  level1.onCommand("back to menu", () => {
    game.start("Main Menu");
  });

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

  player.onUpdate = () => {
    if (player.state === "is standing") {
      player.animate(`look ${player.direction}`);
    }
  };

  level1.addGameObject(world);
  world.addGameObject(player);

  game.debugger.watch(world);
  game.debugger.watch(player);

  game.addScene(menu);
  game.addScene(level1);
  game.start("Main Menu");

  document.getElementById("start-btn").addEventListener("click", () => {
    game.start("Level 1");
  });

  document.getElementById("quit-btn").addEventListener("click", () => {
    game.start("Main Menu");
  });
});
