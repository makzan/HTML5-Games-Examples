// window/global scope
var gameUtils = {};

gameUtils.GameObject = (function(){
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
    var halfW1 = this.width/2;    
    var halfH1 = this.height/2;
    var centerX1 = this.x + halfW1;
    var centerY1 = this.y + halfH1;

    var halfW2 = gameObj.width/2;
    var halfH2 = gameObj.height/2;
    var centerX2 = gameObj.x + halfW2;
    var centerY2 = gameObj.y + halfH2;

    var deltaX = Math.abs(centerX1 - centerX2) - (halfW1 + halfW2);
    var deltaY = Math.abs(centerY1 - centerY2) - (halfH1 + halfH2);

    if (deltaX < 0 && deltaY < 0) {
      return {deltaX:deltaX, deltaY:deltaY};
    }
    return null;
  };
  
  // TODO: this method should detect which side the game object hits the other object.
  p.hitGameObjectOnSide = function(gameObj) {
    if (!this.hitGameObj(gameObj)) return undefined;
    
    // must hit somewhere after this line.
    this.touching = 0x0000; // reset first
    
    // top    
   //  if (this.y <= gameObj.y + gameObj.height && this.y + this.height > gameObj.y) {
   //    this.touching = this.touching | 0x1000;
   //    gameObj.touching = gameObj.touching | 0x0010;
   //  }
    
   //  // bottom
   // if (this.y < gameObj.y + gameObj.height && this.y + this.height > gameObj.y)
  }  

  // p.willHitGameObject = function(gameObj) {
  //   if (this.projectedX >= gameObj.projectedX + gameObj.width
  //    || this.projectedX + this.width <= gameObj.projectedX
  //    || this.projectedY >= gameObj.projectedY + gameObj.height
  //    || this.projectedY + this.height <= gameObj.projectedY)
  //     return false;
  //   return true;
  // };
  p.willHitGameObject = function(gameObj) {
    var halfW1 = this.width/2;    
    var halfH1 = this.height/2;
    var centerX1 = this.projectedX + halfW1;
    var centerY1 = this.projectedY + halfH1;

    var halfW2 = gameObj.width/2;
    var halfH2 = gameObj.height/2;
    var centerX2 = gameObj.projectedX + halfW2;
    var centerY2 = gameObj.projectedY + halfH2;

    var deltaX = Math.abs(centerX1 - centerX2) - (halfW1 + halfW2);
    var deltaY = Math.abs(centerY1 - centerY2) - (halfH1 + halfH2);

    if (deltaX < 0 && deltaY < 0) {
      return {deltaX:deltaX, deltaY:deltaY};
    }
    return null;
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

      var delta = this.hitGameObject(gameObj);
      if(delta != null) {
        delta.gameObj = gameObj;
        return delta;
      }
    }
    return null;
  }

  p.willHitAnyGameObject = function() {
    for (var i in tombrush.game.gameObjects) {      
      var gameObj = tombrush.game.gameObjects[i];

      // ignore this object itself
      if (this.name === gameObj.name) continue;      

      var delta = this.willHitGameObject(gameObj)
      if(delta != null) {
        delta.gameObj = gameObj;
        return delta;
      }
    }
    return null;
  }

  p.maxVelocityUntilHit = function () {
    var maxVelocity = this.velocity.clone();

    
    this.projectedX = this.x + maxVelocity.x;
    this.projectedY = this.y + maxVelocity.y;
    var hit = this.willHitAnyGameObject();
    if (hit !== null) {
      if (hit.deltaY !== 0)
      {
        maxVelocity.y -= -hit.deltaY;      
        this.velocity.y = 0;  
      }      
      if (hit.deltaX !== 0)
      {
        // maxVelocity.x -= -hit.deltaX;
        // this.velocity.x = 0;
        // console.log (hit.deltaX);
      }
    }       
    
    return maxVelocity;
  }

  return GameObject;
})();