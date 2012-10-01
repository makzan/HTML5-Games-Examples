var tombrush = tombrush || {};
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