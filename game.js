onload = function () {
  const game = new Game();

  const mainMenu = new Scene(game);
  const mainMenuBg = new Img(game, "center", 0, 1418, 766, "images/bg.png");

  const button = new Button(game, "center", "middle", 300, 80, "Start Game", "red");
  button.onClick = function () {
    game.start(1);
  };

  const fps = new TextField(game, 10, 10, 200, 25, "red");
  fps.onUpdate = function () {
    this.label.text = "FPS: " + game.fps;
  }

  const mouseXY = new TextField(game, 10, 45, 200, 25, "blue");
  mouseXY.onUpdate = function () {
    this.label.text = "Mouse: " + Input.mouse.x + ":" + Input.mouse.y;
  }

  mainMenu.addGameObject(mainMenuBg);
  mainMenu.addGameObject(button);
  mainMenu.addGameObject(fps);
  mainMenu.addGameObject(mouseXY);

  const level1 = new Scene(game);
  level1.onUpdate = function () {
    if (Input.getKey("Escape")) {
      game.start(0);
    }
  }

  const world = new TileMap(game, 60, 40, "images/terrain_and_objects.png", 32, 32);

  const player = new Character(
    game,
    200,
    200,
    80,
    100,
    "images/skeleton_walk.png",
    9,
    4
  );
  player.onUpdate = function () {
    if (Input.getKey("w")) {
      this.moveUp();
      this.animate(1);
    }

    if (Input.getKey("s")) {
      this.moveDown();
      this.animate(3);
    }

    if (Input.getKey("a")) {
      this.moveLeft();
      this.animate(2);
    }

    if (Input.getKey("d")) {
      this.moveRight();
      this.animate(4);
    }
  };

  level1.addGameObject(world);
  level1.addGameObject(player);
  level1.addGameObject(fps);
  level1.addGameObject(mouseXY);

  game.addScene(mainMenu);
  game.addScene(level1);
  game.start(0);
};
