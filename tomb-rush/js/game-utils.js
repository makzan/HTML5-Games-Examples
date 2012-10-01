// window/global scope
var gameUtils = gameUtils || {};

// Camera is basically a sprite that we put game objects inside it, then we offset this big sprite to simulate camera.
gameUtils.Camera = (function(){
  function Camera() { 
    this.initialize();
  };
  var p = Camera.prototype = new createjs.Container();
  p.super_initialize = p.initialize;
  p.initialize = function() {
    this.super_initialize();    

    this.zoom = 1;
  }

  p.setZoom = function(zoom) {
    this.zoom = zoom;
    this.scaleX = this.scaleY = zoom;
  }

  return Camera;
})();

