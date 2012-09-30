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

tombrush.GameObject = (function(){
  function GameObject(width, height) {    
    this.width = width || 0;
    this.height = height || 0;
    this.projectedX = 0;
    this.projectedY = 0;
    
    // collision status
    this.touching = 0x0000; // four bits for top, right, bottom, left collision. Learn from Flixel source code.
//    this.wasTouching = 0x0000;
  };
  var p = GameObject.prototype = new createjs.Container();

  // rectangle bounding box collision checking
  p.hitGameObject = function(gameObj) {
    if (this.x >= gameObj.x + gameObj.width
     || this.x + this.width <= gameObj.x
     || this.y >= gameObj.y + gameObj.height
     || this.y + this.height <= gameObj.y)
      return false;
    return true;
  };
  
  // TODO: this method should detect which side the game object hits the other object.
  p.hitGameObjectOnSide = function(gameObj) {
    if (!this.hitGameObj(gameObj)) return undefined;
    
    // must hit somewhere after this line.
    this.touching = 0x0000; // reset first
    
    // top    
    if (this.y <= gameObj.y + gameObj.height && this.y + this.height > gameObj.y) {
      this.touching += 0x1000;
     // gameObj.touching
    }
    
    // bottom
//    if (this.y < gameObj.y + gameObj.height && this.y + this.height > gameObj.y)
  }  

  p.willHitGameObject = function(gameObj) {
    if (this.projectedX >= gameObj.projectedX + gameObj.width
     || this.projectedX + this.width <= gameObj.projectedX
     || this.projectedY >= gameObj.projectedY + gameObj.height
     || this.projectedY + this.height <= gameObj.projectedY)
      return false;
    return true;
  };

  // TODO: there are two types of platform, 
  //       platform that can be jumped through from bottom and
  //       platform that cannot be jumped through from bottom.
  //       this hitPlatform method handles platform that can be jumped through bottom.
  // p.hitPlatform = function(gameObj) {
    // if (this.)
  // }

  p.hitAnyGameObject = function() {
    for (var i in tombrush.game.gameObjects) {      
      var gameObj = tombrush.game.gameObjects[i];

      // ignore this object itself
      if (this.name === gameObj.name) continue;      

      if(this.hitGameObject(gameObj)) {
        return gameObj;
      }
    }
    return undefined;
  }

  p.willHitAnyGameObject = function() {
    for (var i in tombrush.game.gameObjects) {      
      var gameObj = tombrush.game.gameObjects[i];

      // ignore this object itself
      if (this.name === gameObj.name) continue;      

      if(this.willHitGameObject(gameObj)) {
        return gameObj;
      }
    }
    return undefined;
  }

  return GameObject;
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
  var p = Hero.prototype = new tombrush.GameObject();

  // Public properties
  p.dropSpeed = 1;
  p.velocity = new createjs.Point(0, 0);
  
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
    
  };

  p.maxVelocityUntilHit = function () {
    var maxVelocity = this.velocity.clone();
    
    // Y axis
    if (this.velocity.y > 0) {
      for (var i=1;i<=this.velocity.y;i++) {      
        maxVelocity.y = i;
        this.projectedY = this.y + maxVelocity.y;
        var hit = this.willHitAnyGameObject();
        if (hit !== undefined) {
          maxVelocity.y -= 1; 
          this.velocity.y = maxVelocity.y;
          break;
        }
      }  
    } else {
      for (var i=-1;i>=this.velocity.y;i--) {
        maxVelocity.y = i;
        this.projectedY = this.y + maxVelocity.y;
        var hit = this.willHitAnyGameObject();
        if (hit !== undefined) { 
          maxVelocity.y += 1;
          this.velocity.y = maxVelocity.y;
          break;
        }
      }
    }
    
    // X axis
    if (this.velocity.x > 0) {
      for (var i=1;i<=this.velocity.x; i++) {
        maxVelocity.x = i;
        this.projectedX = this.x + maxVelocity.x;
        var hit = this.willHitAnyGameObject();
        if (hit !== undefined) {
          maxVelocity.x -= 1;
          this.velocity.x = maxVelocity.x;
          break;
        }
      }
    } else {
      for (var i=-1;i>=this.velocity.x;i--) {
        maxVelocity.y = i;
        this.projectedX = this.x + maxVelocity.x;
        var hit = this.willHitAnyGameObject();
        if (this !== undefined) {
          maxVelocity.x += 1;
          this.velocity.x = maxVelocity.x;
          break;
        }
      }
    }
    
    return maxVelocity;
  }

  p.jump = function() {
    this.velocity.y = -10;
  };

  return Hero;
})();

tombrush.Platform = (function(){
  function Platform(){
    this.initialize();
  }
  var p = Platform.prototype = new tombrush.GameObject();

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
      this.stage.removeChild(gameObj);
    }    
    this.gameObjects.length = 0; // reset array

    // TODO: make the platform creation much more easier please.
    var platform = new tombrush.Platform();
    platform.x = platform.projectedX = 50;
    platform.y = platform.projectedY = 150;
    this.stage.addChild(platform);
    this.gameObjects.push(platform);

    var platform2 = new tombrush.Platform();
    platform2.x = platform2.projectedX = 170;
    platform2.y = platform2.projectedY = 130;
    this.stage.addChild(platform2);
    this.gameObjects.push(platform2);

    var platform3 = new tombrush.Platform();
    platform3.x = platform3.projectedX = 300;
    platform3.y = platform3.projectedY = 180;
    this.stage.addChild(platform3);
    this.gameObjects.push(platform3);
    
    var hero = this.hero = new tombrush.Hero();
    hero.x = hero.projectedX = 50;
    hero.y = hero.projectedY = 100;
    this.stage.addChild(hero);

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
      this.initGame();
    }
    this.updateView();

    // TODO: move the DOM finding method out of the tick loop
    var div = document.getElementById('fps');
    div.innerHTML = Math.round(createjs.Ticker.getMeasuredFPS());
  }

  p.updateView = function() {
    this.stage.update();
  };
  
  p.gameOver = function() {
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
