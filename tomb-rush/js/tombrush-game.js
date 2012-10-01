var tombrush = tombrush || {};
tombrush.Game = (function() {    
  // constructor  
  function TombRushGame() {
    this.initialize();      
  }

  var p = TombRushGame.prototype;

  // public properties
  p.gameObjects = [];

  p.initialize = function() {
    console.log("Tomb Rush game starts.");
    
    this.canvas = document.getElementById('game-canvas');
    
    // EaselJS Stage
    this.stage = new createjs.Stage(this.canvas);

    // Camera
    // TODO IMPROVE: we may use array to store a list of cameras later.
    this.camera = new gameUtils.Camera();
    this.stage.addChild(this.camera);

    // Enabling the Touches on mobile device
    createjs.Touch.enable(this.stage, /*singleTouch=*/ true, /*allowDefault=*/false);

    // Create heartbreat for our game loop
    createjs.Ticker.setFPS(40);
    createjs.Ticker.addListener(this, /*pausable=*/ true);

    this.initGame(); 
  }

  p.initGame = function() {
    // remove all game objects from stage
    for (var i in this.gameObjects)
    {      
      var gameObj = this.gameObjects[i];
      createjs.Ticker.removeListener(gameObj)
      this.camera.removeChild(gameObj);
    }    
    this.gameObjects.length = 0; // reset array

    // reset camera
    this.camera.x = this.camera.y = 0;

    // TODO: make the platform creation much more easier please.
    for (var i=0;i<1000;i++)
    {
      var offsetX = i * 570;
      var platform = new tombrush.Platform();
      platform.x = platform.projectedX = 50 + offsetX;
      platform.y = platform.projectedY = 150;  
      this.camera.addChild(platform);
      this.gameObjects.push(platform);

      var platform2 = new tombrush.Platform();
      platform2.x = platform2.projectedX = 170 + offsetX;
      platform2.y = platform2.projectedY = 130;
      this.camera.addChild(platform2);
      this.gameObjects.push(platform2);

      var platform3 = new tombrush.Platform();
      platform3.x = platform3.projectedX = 300 + offsetX;
      platform3.y = platform3.projectedY = 180;
      this.camera.addChild(platform3);
      this.gameObjects.push(platform3);

      platform = new tombrush.Platform();
      platform.x = platform.projectedX = 400 + offsetX;
      platform.y = platform.projectedY = 140;
      this.camera.addChild(platform);
      this.gameObjects.push(platform);

      platform = new tombrush.Platform();
      platform.x = platform.projectedX = 530 + offsetX;
      platform.y = platform.projectedY = 180;
      this.camera.addChild(platform);
      this.gameObjects.push(platform);
    }    
    
    var hero = this.hero = new tombrush.Hero();
    hero.x = hero.projectedX = 50;
    hero.y = hero.projectedY = 100;
    this.camera.addChild(hero);

    this.gameObjects.push(hero);

    this.stage.onMouseUp = function() {      
      hero.jump();
    }

    this.updateView();
  };

  p.tick = function() {
    // game over checking
    if (this.hero.y > this.canvas.height)
    {
      this.gameOver();
    }
    this.updateView();

    // TODO: just an experiment code. remove it later.
    this.camera.x -= 3;

    // TODO: move the DOM finding method out of the tick loop
    var div = document.getElementById('fps');
    div.innerHTML = Math.round(createjs.Ticker.getMeasuredFPS());
  }

  p.updateView = function() {
    this.stage.update();
  };
  
  p.gameOver = function() {
    this.initGame();
  };

  return TombRushGame;
})();

