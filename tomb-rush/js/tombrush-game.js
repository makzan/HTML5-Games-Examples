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

    // World dimension
    this.world= {};
    this.world.size = {
      width: 10000,
      height: 320
    };

    // Quad Tree
    quadTreeBounds = new createjs.Rectangle(0, 0, this.world.size.width, this.world.size.height);
    this.quadTree = new QuadTree(quadTreeBounds, /*pointQuad=*/ false /*false means using bound*/, /*maxDepth=*/ 4, /*maxChildren=*/ 2);

    // Camera
    // TODO IMPROVE: we may use array to store a list of cameras later.
    this.camera = new gameUtils.Camera();
    this.stage.addChild(this.camera);
    this.camera.setZoom(1);

    window.quadDebug = new createjs.Shape();
    this.camera.addChild(window.quadDebug);

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
    for (var i=0;i<100;i++)
    {
      var offsetX = i * 570;
      var platform = new tombrush.Platform();
      platform.x = platform.projectedX = 50 + offsetX;
      platform.y = platform.projectedY = 143;  
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

      var platform4 = new tombrush.Platform();
      platform4.x = platform4.projectedX = 400 + offsetX;
      platform4.y = platform4.projectedY = 140;
      this.camera.addChild(platform4);
      this.gameObjects.push(platform4);

      var platform5 = new tombrush.Platform();
      platform5.x = platform5.projectedX = 530 + offsetX;
      platform5.y = platform5.projectedY = 180;
      this.camera.addChild(platform5);
      this.gameObjects.push(platform5);
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
    // update quadtree
    this.quadTree.clear();
    this.quadTree.insert(this.gameObjects);    

    renderQuad();

    // quadtree testing code
    var items = this.quadTree.retrieve(this.hero);
    // console.log ('items: ', items);
    for (var i in this.gameObjects) {
      this.gameObjects[i].alpha = 1;
    }
    debug.watch(items.length);
    for (var i in items) {
      items[i].alpha = 0.5;
    }
    
    // game over checking
    if (this.hero.y > this.canvas.height)
    {
      this.gameOver();
    }
    this.updateView();

    // TODO: just an experiment code. remove it later.
    this.camera.x -= 3 * this.camera.zoom;

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


function renderQuad()
{
  var g = window.quadDebug.graphics;
  g.clear();
  g.setStrokeStyle(1);
  g.beginStroke("#ff0000");
  
  drawNode(tombrush.game.quadTree.root);
}

function drawNode(node)
{
  var bounds = node._bounds;
  var g = window.quadDebug.graphics;

  g.drawRect(
      Math.abs(bounds.x)  + 0.5,
      Math.abs(bounds.y) + 0.5,
      bounds.width,
      bounds.height
    );
  
  var len = node.nodes.length;
  
  for(var i = 0; i < len; i++)
  {
    drawNode(node.nodes[i]);
  }
  
}
