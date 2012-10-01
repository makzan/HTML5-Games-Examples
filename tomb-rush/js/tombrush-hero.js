var tombrush = tombrush || {};
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