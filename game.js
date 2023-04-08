window.onload = () => {
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
  const player = new Character(
    game,
    80,
    100,
    "images/skeleton_walk.png",
    -9,
    -4
  );

  game.onUpdate = () => {
    document.getElementById("fps").innerHTML = game.fps;
  };

  level1.onStart = () => {
    level1.mainCamera.parent = world;
    level1.mainCamera.camera.lookAt(player);
    game.debugger.watch(level1.mainCamera);
  };

  level1.addCmdKeys(["Escape"], "back to menu");
  level1.onCommand("back to menu", () => {
    game.start("Main Menu");
  });

  player.addAnimation("walk up", 1, 9);
  player.addAnimation("walk down", 3, 9);
  player.addAnimation("walk left", 2, 9);
  player.addAnimation("walk right", 4, 9);

  player.addAnimation("look up", 1, 1);
  player.addAnimation("look down", 3, 1);
  player.addAnimation("look left", 2, 1);
  player.addAnimation("look right", 4, 1);

  player.addCmdKeys(["w"], "walk up", ["ArrowUp"]);
  player.addCmdKeys(["s"], "walk down", ["ArrowDown"]);
  player.addCmdKeys(["a"], "walk left", ["ArrowLeft"]);
  player.addCmdKeys(["d"], "walk right", ["ArrowRight"]);

  player.onCommand("walk up", () => {
    player.moveUp();
    player.setAnimation("walk up");
  });

  player.onCommand("walk down", () => {
    player.moveDown();
    player.setAnimation("walk down");
  });

  player.onCommand("walk left", () => {
    player.moveLeft();
    player.setAnimation("walk left");
  });

  player.onCommand("walk right", () => {
    player.moveRight();
    player.setAnimation("walk right");
  });

  player.onUpdate = () => {
    if (player.state == "is standing") {
      player.setAnimation("look " + player.direction);
    }
  };

  level1.addGameObject(world);
  world.addGameObject(player);

  game.debugger.watch(world);
  game.debugger.watch(player);

  game.addScene(menu);
  game.addScene(level1);
  game.start("Main Menu");

  document.getElementById("start-game").addEventListener("click",  () => {
    game.start("Level 1");
  });

  document.getElementById("quit-game").addEventListener("click", () => {
    game.start("Main Menu");
  });
};
