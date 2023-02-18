window.onload = () => {
  const color1 = "#7B6662";
  const game = new Game();

  game.onUpdate = function () {
    const fps = document.getElementById("fps");
    const mouse = document.getElementById("mouse");

    fps.innerHTML = game.fps;
    mouse.innerHTML = Input.mouse.x + ":" + Input.mouse.y;
  }

  const menu = new Scene(game, "Main Menu", "html");

  document.getElementById("start-game").onclick = () => {
    game.start("Level 1");
  };

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
    200,
    200,
    80,
    100,
    "images/skeleton_walk.png",
    -9,
    -4
  );
  player.addAnimation("walk up", 1, 9);
  player.addAnimation("walk down", 3, 9);
  player.addAnimation("walk left", 2, 9);
  player.addAnimation("walk right", 4, 9);
  player.addAnimation("idle", 4, 1);

  level1.onUpdate = function () {
    if (Input.getKey("Escape")) {
      game.start("Main Menu");
    }

    if (Input.getKey("w") || Input.getKey("ArrowUp")) {
      player.moveUp();
      player.animate("walk up");
    }

    if (Input.getKey("s") || Input.getKey("ArrowDown")) {
      player.moveDown();
      player.animate("walk down");
    }

    if (Input.getKey("a") || Input.getKey("ArrowLeft")) {
      player.moveLeft();
      player.animate("walk left");
    }

    if (Input.getKey("d") || Input.getKey("ArrowRight")) {
      player.moveRight();
      player.animate("walk right");
    }
  };

  level1.addGameObject(world);
  level1.addGameObject(player);

  game.addScene(menu);
  game.addScene(level1);
  game.start("Main Menu");
};
