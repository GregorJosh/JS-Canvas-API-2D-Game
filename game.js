onload = function () {
  const color1 = "#7B6662";
  const game = new Game();

  const mainMenu = new Scene(game);
  const mainMenuBg = new Img(
    game,
    0,
    0,
    mainMenu.width,
    mainMenu.height,
    "images/bg.png"
  );

  const button = new Button(
    game,
    "center",
    "middle",
    300,
    50,
    "Start Game",
    "white",
    color1
  );
  button.onClick = function () {
    game.start(1);
  };

  const fps = new TextField(game, 10, 10, 200, 25, "white", color1);
  fps.label.align = "left";

  const mouseXY = new TextField(game, 10, 45, 200, 25, "white", color1);
  mouseXY.label.align = "left";
  mouseXY.onUpdate = function () {
    fps.label.text = "FPS: " + game.fps;
    this.label.text = "Mouse: " + Input.mouse.x + ":" + Input.mouse.y;
  };

  mainMenu.addGameObject(mainMenuBg);
  mainMenu.addGameObject(button);
  mainMenu.addGameObject(fps);
  mainMenu.addGameObject(mouseXY);

  const level1 = new Scene(game);
  level1.onUpdate = function () {
    player.setAnimation("walk right");

    if (Input.getKey("Escape")) {
      game.start(0);
    }

    if (Input.getKey("w")) {
      player.moveUp();
      player.setAnimation("walk up");
      player.animation.play();
    }

    if (Input.getKey("s")) {
      player.moveDown();
      player.setAnimation("walk down");
      player.animation.play();
    }

    if (Input.getKey("a")) {
      player.moveLeft();
      player.setAnimation("walk left");
      player.animation.play();
    }

    if (Input.getKey("d")) {
      player.moveRight();
      player.setAnimation("walk right");
      player.animation.play();
    }
  };

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

  level1.addGameObject(world);
  level1.addGameObject(player);
  level1.addGameObject(fps);
  level1.addGameObject(mouseXY);

  game.addScene(mainMenu);
  game.addScene(level1);
  game.start(0);
};
