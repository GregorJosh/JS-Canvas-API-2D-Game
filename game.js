onload = function () {
  const color1 = "#7B6662";
  const game = new Game();

  const menu = new Scene(game, "Main Menu");
  
  const bg = new Img(
    game,
    0,
    0,
    menu.width,
    menu.height,
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
    game.start("Level 1");
  };

  const fps = new TextField(game, 10, 10, 200, 25, "white", color1);
  fps.label.align = "left";
  fps.onUpdate = function () {
    this.label.text = "FPS: " + game.fps;
  };

  const mouseXY = new TextField(game, 10, 45, 200, 25, "white", color1);
  mouseXY.label.align = "left";
  mouseXY.onUpdate = function () {
    this.label.text = "Mouse: " + Input.mouse.x + ":" + Input.mouse.y;
  };

  menu.addGameObject(bg);
  menu.addGameObject(button);
  menu.addGameObject(fps);
  menu.addGameObject(mouseXY);

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
      game.start(0);
    }

    if (Input.getKey("w")) {
      player.moveUp();
      player.animate("walk up");
    }

    if (Input.getKey("s")) {
      player.moveDown();
      player.animate("walk down");
    }

    if (Input.getKey("a")) {
      player.moveLeft();
      player.animate("walk left");
    }

    if (Input.getKey("d")) {
      player.moveRight();
      player.animate("walk right");
    }
  };

  level1.addGameObject(world);
  level1.addGameObject(player);
  level1.addGameObject(fps);
  level1.addGameObject(mouseXY);

  game.addScene(menu);
  game.addScene(level1);
  game.start("Main Menu");
};
