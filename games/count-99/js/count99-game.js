// window/global scope
var c99 = {}

c99.Utils = (function() {
  function Utils(){}
  // return a random integer from a to b. 
  // Including a, excluding b
  Utils.randomInt = function(a, b) {
    return Math.floor(Math.random() * (b-a)) + a
  }
  return Utils;
})();

c99.CommonShapes = (function() {
  function CommonShapes(){}
  CommonShapes.rectangle = function(rect) {    
    if (rect.strokeColor == undefined) rect.strokeColor = "#000";
    if (rect.fillColor == undefined) rect.fillColor = "#000";
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
  }
  
  return CommonShapes;
})();

c99.Tile = (function(){  
  function Tile(number){       
    this.initialize();

    this.number = number;

    this.width = 80;
    this.height = this.width;

    var shape = c99.CommonShapes.rectangle({
      x: 0,
      y: 0,
      width: this.width,
      height: this.height, 
      fillColor: createjs.Graphics.getRGB(c99.Utils.randomInt(0,256),c99.Utils.randomInt(0,256),c99.Utils.randomInt(0,256)),     
    });    
    this.addChild(shape);

    var numberText = new createjs.Text(number, "24px Helvetica", "#fff");
    // place it at the center of the tile box.
    numberText.x = this.width/2;
    numberText.y = this.height/2;    

    // align cetner, vertically and horizontally.
    numberText.textAlign = "center";    
    numberText.textBaseline = "middle";
    this.addChild(numberText);    
  }  
  var p = Tile.prototype = new createjs.Container();

  return Tile;
})();

c99.Game = (function() {    
  // constructor  
  function Count99Game() {
    console.log("Count99 game starts.");

    this.nextCount = 1;
    this.totalTiles = 10;

    this.nextTileLabel = document.getElementById('next-tile');

    this.canvas = document.getElementById('game-canvas');
    
    // EaselJS Stage
    this.stage = new createjs.Stage(this.canvas);

    this.createTiles();
       
  }  

  var p = Count99Game.prototype;

  p.createTiles = function() {
    // many tiles
    for(var i=this.totalTiles;i>0;i--)
    {
      var tile = new c99.Tile(i); 

      // random position within the canvas
      tile.x = c99.Utils.randomInt(0, this.canvas.width-tile.width);
      tile.y = c99.Utils.randomInt(0, this.canvas.height-tile.height);      

      tile.onClick = (function(event) {                
        if (event.target.number === this.nextCount) {
          var removeResult = this.stage.removeChild(event.target);          
          this.nextCount++;
          this.nextTileLabel.innerText = this.nextCount;
          this.stage.update();
        }
      }).bind(this);
      this.stage.addChild(tile);
    }
    
    // update the stage
    this.stage.update();
  }

  return Count99Game;
})();

window.onload = function() {
  // entry point
  var game = new c99.Game();
}