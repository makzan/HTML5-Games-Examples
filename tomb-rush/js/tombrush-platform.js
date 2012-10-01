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