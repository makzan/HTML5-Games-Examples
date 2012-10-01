var debug = {};
debug.log = function (message) {
  document.getElementById('debug-output').innerHTML += message + '<br>';
}

// window/global scope
var tombrush = {};

tombrush.Utils = (function() {
  function Utils(){}
  // return a random integer from a to b. 
  // Including a, excluding b
  Utils.randomInt = function(a, b) {
    return Math.floor(Math.random() * (b-a)) + a;
  };
  return Utils;
})();

tombrush.CommonShapes = (function() {
  function CommonShapes(){}
  CommonShapes.rectangle = function(rect) {   
    rect.strokeColor = rect.strokeColor || "#000";    
    rect.fillColor = rect.fillColor || "#000";
    rect.x = rect.x || 0;
    rect.y = rect.y || 0;
    rect.width = rect.width || 0;
    rect.height = rect.height || 0;
    
    var shape = new createjs.Shape();
    if (rect.strokeThickness > 0)
    {
      shape.graphics.setStrokeStyle(rect.strokeThickness);
      shape.graphics.beginStroke(rect.strokeColor);  
    }    
    shape.graphics.beginFill(rect.fillColor);
    shape.graphics.rect(rect.x, rect.y, rect.width, rect.height);
    shape.graphics.endFill();
    return shape;
  };
  
  return CommonShapes;
})();

tombrush.Tile = (function(){  
  function Tile(number){       
    this.initialize();    

    this.number = number;

    this.width = 80;
    this.height = this.width;

    var shape = tombrush.CommonShapes.rectangle({
      width: this.width,
      height: this.height, 
      fillColor: "#999",     
    });    
    this.addChild(shape); 
  };
  var p = Tile.prototype = new createjs.Container();

  return Tile;
})();

tombrush.Hero = (function(){
  function Hero() {
    this.initialize();
  };
  var p = Hero.prototype = new gameUtils.GameObject();

  // Public properties
  p.dropSpeed = 1;
  p.velocity = new createjs.Point(0, 0);
  p.onGround = false;
  
  // super initialize
  p.super_initialize = p.initialize;
  p.initialize = function() {
    this.super_initialize();

    this.name = 'hero';
    this.width = 10;
    this.height = 20;

    var shape = tombrush.CommonShapes.rectangle({
      width: this.width,
      height: this.height,
      fillColor: "#f00",
    });
    this.addChild(shape);

    // Give heartbeat to Hero
    createjs.Ticker.addListener(this, /*pausable=*/ true);
  };
  
  

  p.tick = function(timeElapsed) {      
    this.velocity.y += this.dropSpeed;
    this.velocity.x = 3;
        
    var maxVelocity = this.maxVelocityUntilHit();
                
    this.y += maxVelocity.y;
    this.x += maxVelocity.x;    

    this.onGround = (maxVelocity.y === 0);

    // check if hit obstacle.  
    var hitObstacle = false;  
    for (var i in tombrush.game.gameObjects) {      
      var gameObj = tombrush.game.gameObjects[i];

      // ignore this object itself
      if (this.name === gameObj.name) continue;   

      var delta = this.hitGameObject(gameObj);
      if(delta != null) {
        delta.gameObj = gameObj;
        return delta;
      }
    }      
    
  };

  p.jump = function() {
    if (this.onGround)
      this.velocity.y = -10;
  };

  return Hero;
})();

tombrush.Obstacle = (function(){
  function Obstacle() {
    this.initialize();    
  }
  var p = Obstacle.prototype = new gameUtils.GameObject();

  p.super_initialize = p.initialize;
  p.initialize = function() {
    this.super_initialize();
    this.name = 'obstacle';
    this.width = 20;
    this.height = 20;

    var shape = tombrush.CommonShapes.rectangle({
      width: this.width,
      height: this.height,      
    });
    this.addChild(shape);
  }
})();

tombrush.Platform = (function(){
  function Platform(){
    this.initialize();
  }
  var p = Platform.prototype = new gameUtils.GameObject();

  p.super_initialize = p.initialize;
  p.initialize = function() {
    this.super_initialize();

    this.name = 'platform';
    this.width = 80;
    this.height = 10;

    var shape = tombrush.CommonShapes.rectangle({
      width: this.width,
      height: this.height,      
    });
    this.addChild(shape);
  }

  return Platform;
})();


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

var test = (function() {
  var game = new tombrush.Game();
  var platform = new tombrush.Platform();
  platform.x = 10; 
  platform.y = 10;
  platform.width = 10;
  platform.height = 10;
  var platform2 = new tombrush.Platform();
  platform2.x = 10; 
  platform2.y = 10;
  platform2.width = 10;
  platform2.height = 10;
  if (platform.hitGameObject(platform2) === true) {
    console.log ('passed');
  }else {
    console.log ('FAILED');
  }

  platform2.x = 30;
  platform2.y = 30;
  if (platform.hitGameObject(platform2) === false) {
    console.log ('passed');
  }else{
    console.log ('FAILED');
  }

  platform2.x = 10;
  platform2.y = 30;
  if (platform.hitGameObject(platform2) === false) {
    console.log ('passed');
  }else{
    console.log ('FAILED');
  }

  platform2.x = 30;
  platform2.y = 10;
  if (platform.hitGameObject(platform2) === false) {
    console.log ('passed');
  }else{
    console.log ('FAILED');
  }
})();

window.onload = function() {
  // entry point
  tombrush.game = new tombrush.Game();
};
