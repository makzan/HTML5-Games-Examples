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
    if (rect.strokeColor === undefined) rect.strokeColor = "#000";
    if (rect.fillColor === undefined) rect.fillColor = "#000";
    if (rect.x === undefined) rect.x = 0;
    if (rect.y === undefined) rect.y = 0;
    if (rect.width === undefined) rect.width = 0;
    if (rect.height === undefined) rect.height = 0;
    
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
    this.initialize(); // initializing the createjs Container

    this.number = number;

    this.width = 80;
    this.height = this.width;

    var shape = tombrush.CommonShapes.rectangle({
      width: this.width,
      height: this.height, 
      fillColor: "#999",     
    });    
    this.addChild(shape); 
  }  
  var p = Tile.prototype = new createjs.Container();

  return Tile;
})();

tombrush.Hero = (function(){
  function Hero() {
    this.initialize(); // initializing the createjs Container
  };
  var p = Hero.prototype = new createjs.Container();

  // Public properties
  p.dropSpeed = 1;
  p.velocity = new createjs.Point(0, 0);

  
  // super initialize
  p.Container_initialize = p.initialize;
  p.initialize = function() {
    this.Container_initialize(); // super init

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
  }

  p.tick = function(timeElapsed) {
    this.velocity.y += this.dropSpeed;
    this.y += this.velocity.y;
  };

  p.jump = function() {
    this.velocity.y = -10;
  };

  return Hero;
})();

tombrush.Game = (function() {    
  // constructor  
  function TombRushGame() {
    console.log("Tomb Rush game starts.");
    
    this.canvas = document.getElementById('game-canvas');
    
    // EaselJS Stage
    this.stage = new createjs.Stage(this.canvas);
    
    // Enabling the Touches on mobile device
    createjs.Touch.enable(this.stage, /*singleTouch=*/ true, /*allowDefault=*/false);

    // Create heartbreat for our game loop
    createjs.Ticker.setFPS(40);
    createjs.Ticker.addListener(this, /*pausable=*/ true);

    this.initGame();       
  }  

  var p = TombRushGame.prototype;

  p.initGame = function() {
    
    var hero = new tombrush.Hero();
    hero.x = 100;
    hero.y = 100;
    this.stage.addChild(hero);

    this.stage.onMouseUp = function() {      
      hero.jump();
    }

    this.updateView();
  };

  p.tick = function() {
    this.updateView();
  }

  p.updateView = function() {    
    this.stage.update();
  };
  
  p.gameOver = function() {
  };

  return TombRushGame;
})();

window.onload = function() {
  // entry point
  var game = new tombrush.Game();
};
