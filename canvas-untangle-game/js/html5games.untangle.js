function clear(ctx) {	
	ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height); 
}

function Circle(x,y,radius){
	this.x = x;
	this.y = y;
	this.radius = radius;
}

function Line(startPoint,endPoint, thickness) {
	this.startPoint = startPoint;
	this.endPoint = endPoint;
	this.thickness = thickness;
}

var untangleGame = {
	circles: [],
	thinLineThickness: 1,
	boldLineThickness: 5,
	lines: [],
	currentLevel: 0,
	progressPercentage: 0,
	layers: []
};

untangleGame.levels = 
[
	{
		"level" : 0,
		"circles" : [{"x" : 400, "y" : 156},
					{"x" : 381, "y" : 241},
					{"x" : 84, "y" : 233},
					{"x" : 88, "y" : 73}],
		"relationship" : {
							"0" : {"connectedPoints" : [1,2]},
							"1" : {"connectedPoints" : [0,3]},
							"2" : {"connectedPoints" : [0,3]},
							"3" : {"connectedPoints" : [1,2]}
						  }				  
	},
	{
		"level" : 1,
		"circles" : [{"x" : 415, "y" : 117},
					{"x" : 400, "y" : 240},
					{"x" : 88, "y" : 241},
					{"x" : 84, "y" : 72}],
		"relationship" : {
							"0" : {"connectedPoints" : [1,2,3]},
							"1" : {"connectedPoints" : [0,2,3]},
							"2" : {"connectedPoints" : [0,1,3]},
							"3" : {"connectedPoints" : [0,1,2]}
						  }				  
	},
	{
		"level" : 2,
		"circles" : [{"x" : 192, "y" : 155},
					{"x" : 353, "y" : 109},
					{"x" : 493, "y" : 156},
					{"x" : 490, "y" : 236},
					{"x" : 348, "y" : 276},
					{"x" : 195, "y" : 228}],
		"relationship" : {
							"0" : {"connectedPoints" : [2,3,4]},
							"1" : {"connectedPoints" : [3,5]},
							"2" : {"connectedPoints" : [0,4,5]},
							"3" : {"connectedPoints" : [0,1,5]},
							"4" : {"connectedPoints" : [0,2]},
							"5" : {"connectedPoints" : [1,2,3]}
						  }				  
	}
];

function setupCurrentLevel() {
	untangleGame.circles = [];
	var level = untangleGame.levels[untangleGame.currentLevel];
	for (var i=0; i<level.circles.length; i++) {
		untangleGame.circles.push(new Circle(level.circles[i].x, level.circles[i].y, 10));
	}
	
	connectCircles();
	updateLineIntersection();
}

function checkLevelCompleteness() {
	if ($("#progress").html() == "100") {
		if (untangleGame.currentLevel+1 < untangleGame.levels.length)
			untangleGame.currentLevel++;
		setupCurrentLevel();
	}
}

function drawLine(ctx, x1, y1, x2, y2, thickness) {		
	ctx.beginPath();
	ctx.moveTo(x1,y1);
	ctx.lineTo(x2,y2);
	ctx.lineWidth = thickness;
	ctx.strokeStyle = "#cfc";
	ctx.stroke();
}

function drawCircle(ctx, x, y, radius) {
	// prepare the radial gradients fill style
	var circle_gradient = ctx.createRadialGradient(x-3,y-3,1,x,y,radius);
	circle_gradient.addColorStop(0, "#fff");
	circle_gradient.addColorStop(1, "#cc0");
	ctx.fillStyle = circle_gradient;
	
	// draw the path
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI*2, true); 
	ctx.closePath();
	
	// actually fill the circle path
	ctx.fill();
}

$(function(){
	// prepare layer 0 (bg)
	var canvas_bg = document.getElementById("bg");
	untangleGame.layers[0] = canvas_bg.getContext("2d");	 			
	
	// prepare layer 1 (guide)
	var canvas_guide = document.getElementById("guide");
	untangleGame.layers[1] = canvas_guide.getContext("2d");
	
	// prepare layer 2 (game)
	var canvas = document.getElementById("game");  
	var ctx = canvas.getContext("2d");
	untangleGame.layers[2] = ctx;
	
	// prepare layer 3 (ui)
	var canvas_ui = document.getElementById("ui");
	untangleGame.layers[3] = canvas_ui.getContext("2d");
	
	// draw a splash screen when loading the game background
	// draw gradients background
	var bg_gradient = ctx.createLinearGradient(0,0,0,ctx.canvas.height);
	bg_gradient.addColorStop(0, "#cccccc");
	bg_gradient.addColorStop(1, "#efefef");
	ctx.fillStyle = bg_gradient;
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	
	// draw the loading text
	ctx.font = "34px 'Arial'";
	ctx.textAlign = "center";
	ctx.fillStyle = "#333333";
	ctx.fillText("loading...",ctx.canvas.width/2,canvas.height/2);


	// load the background image
	untangleGame.background = new Image();	
	untangleGame.background.onload = function() {
		drawLayerBG();

		// setup an interval to loop the game loop
	    setInterval(gameloop, 30);
	}
	untangleGame.background.onerror = function() {
		console.log("Error loading the image.");
	}
	untangleGame.background.src = "images/board.png";
	
	// load the guide sprite image
	untangleGame.guide = new Image();
	untangleGame.guide.src = "images/guide_sprite.png";
	untangleGame.guide.onload = function() {
		untangleGame.guideReady = true;
		
		// setup timer to switch the display frame of the guide sprite
		untangleGame.guideFrame = 0;
		setInterval(guideNextFrame, 500);
	}
	
	// setup current level
	setupCurrentLevel();	
	updateLevelProgress();
	
	// Add Mouse Event Listener to canvas
	    // we find if the mouse down position is on any circle 
	    // and set that circle as target dragging circle.
	    $("#layers").mousedown(function(e) {
	    	var canvasPosition = $(this).offset();
	    	var mouseX = e.layerX || 0;
	    	var mouseY = e.layerY || 0;
	    	
			for(var i=0;i<untangleGame.circles.length;i++)
			{
				var circleX = untangleGame.circles[i].x;
				var circleY = untangleGame.circles[i].y;
				var radius = untangleGame.circles[i].radius;
				if (Math.pow(mouseX-circleX,2) + Math.pow(mouseY-circleY,2) < Math.pow(radius,2))
				{
					untangleGame.targetCircle = i;
					break;
				}
			}
	    });
	    
	    // we move the target dragging circle when the mouse is moving
	    $("#layers").mousemove(function(e) {
	    	if (untangleGame.targetCircle != undefined)
	    	{
				var canvasPosition = $(this).offset();
				var mouseX = e.layerX || 0;
				var mouseY = e.layerY || 0;
				var radius = untangleGame.circles[untangleGame.targetCircle].radius;
				untangleGame.circles[untangleGame.targetCircle] = new Circle(mouseX, mouseY, radius);	
				
				connectCircles();
				updateLineIntersection();
				updateLevelProgress();				    	
	    	}
	    });
	    
	    // We clear the dragging circle data when mouse is up
	    $("#layers").mouseup(function(e) {    	
	       	untangleGame.targetCircle = undefined;    	
	       	
	       	// on every mouse up, check if the untangle puzzle is solved.
	       	checkLevelCompleteness();
	    });	
});

function gameloop() {	
	drawLayerGuide();
	drawLayerGame();
	drawLayerUI();	
}

// draw graphics that related to the bg canvas
function drawLayerBG()
{
	var ctx = untangleGame.layers[0];

	clear(ctx);
	// draw the image background
	ctx.drawImage(untangleGame.background, 0, 0);
}

// draw graphics that related to the guide canvas
function drawLayerGuide()
{
	var ctx = untangleGame.layers[1];
	
	clear(ctx);
	
	// draw the guide animation
	if (untangleGame.guideReady)
	{
		// the dimension of each frame is 80x130.
		var nextFrameX = untangleGame.guideFrame * 80;
		ctx.drawImage(untangleGame.guide, nextFrameX, 0, 80, 130, 325, 130, 80, 130);
	}
	
	// fade out the guideline after level 0
	if (untangleGame.currentLevel == 1)
	{
		$("#guide").addClass('fadeout');
	}
}

// draw graphics that related to the game canvas
function drawLayerGame()
{
	// get the reference of the canvas element and the drawing context.
	var ctx = untangleGame.layers[2];				
	
	// draw the game state visually
	// clear the canvas before drawing.
	clear(ctx);
	
	// draw all remembered line
	for(var i=0;i<untangleGame.lines.length;i++) {
		var line = untangleGame.lines[i];
		var startPoint = line.startPoint;
		var endPoint = line.endPoint;
		var thickness = line.thickness;
		drawLine(ctx, startPoint.x, startPoint.y, endPoint.x, endPoint.y, thickness);
	}
	
	// draw all remembered circles
	for(var i=0;i<untangleGame.circles.length;i++) {
		var circle = untangleGame.circles[i];
		drawCircle(ctx, circle.x, circle.y, circle.radius);
	}
}

function connectCircles()
{
	// setup all lines based on the circles relationship
	var level = untangleGame.levels[untangleGame.currentLevel];
	untangleGame.lines.length = 0;
	for (var i in level.relationship) {
		var connectedPoints = level.relationship[i].connectedPoints;
		var startPoint = untangleGame.circles[i];
		for (var j in connectedPoints) {
			var endPoint = untangleGame.circles[connectedPoints[j]];
			untangleGame.lines.push(new Line(startPoint, endPoint));
		}
	}
}

function updateLineIntersection()
{
	// check lines intersection
	for (var i=0;i<untangleGame.lines.length;i++) {
		var line1 = untangleGame.lines[i];
		line1.thickness = untangleGame.thinLineThickness;
		for(var j=0;j<i;j++) {	
			var line2 = untangleGame.lines[j];
			
			// we check if two lines are interseted, 
			// and bold the line if they are.
			if (isIntersect(line1, line2)) {
				line1.thickness = untangleGame.boldLineThickness;
				line2.thickness = untangleGame.boldLineThickness;
			}			
		}
	}
}

function updateLevelProgress()
{
	// check the untangle progress of the level
	var progress = 0;
	for (var i=0;i<untangleGame.lines.length;i++) {
		if (untangleGame.lines[i].thickness == untangleGame.thinLineThickness) {
			progress++;
		}
	}
	untangleGame.progressPercentage = Math.floor(progress/untangleGame.lines.length*100);
	$("#progress").html(untangleGame.progressPercentage);
	
	// display the current level
	$("#level").html(untangleGame.currentLevel);
	
	
}

// draw graphics that related to the ui canvas
function drawLayerUI()
{
	var ctx = untangleGame.layers[3];
	
	clear(ctx);
	
	// draw the level progress text
	ctx.font = "26px 'Rock Salt'";
	ctx.fillStyle = "#dddddd";
	ctx.textAlign = "left";
	ctx.textBaseline = "bottom";
	ctx.fillText("Puzzle "+untangleGame.currentLevel+", Completeness: " + untangleGame.progressPercentage + "%", 60,ctx.canvas.height-80);
		
	
	// get all circles, check if the ui overlap with the game objects
	var isOverlappedWithCircle = false;
	for(var i in untangleGame.circles) {
		var point = untangleGame.circles[i];
		if (point.y > 310)
		{
			isOverlappedWithCircle = true;
		}		
	}
	if (isOverlappedWithCircle)
	{
		$("#ui").addClass('dim');
	}
	else
	{
		$("#ui").removeClass('dim');
	}
}

function guideNextFrame()
{
	untangleGame.guideFrame++;
	// there are only 6 frames (0-5) in the guide animation.
	// we loop back the frame number to frame 0 after frame 5.
	if (untangleGame.guideFrame > 5)
	{
		untangleGame.guideFrame = 0;
	}
}

function isIntersect(line1, line2)
{
	// convert line1 to general form of line: Ax+By = C
	var a1 = line1.endPoint.y - line1.startPoint.y;
	var b1 = line1.startPoint.x - line1.endPoint.x;
	var c1 = a1 * line1.startPoint.x + b1 * line1.startPoint.y;
	
	// convert line2 to general form of line: Ax+By = C
	var a2 = line2.endPoint.y - line2.startPoint.y;
	var b2 = line2.startPoint.x - line2.endPoint.x;
	var c2 = a2 * line2.startPoint.x + b2 * line2.startPoint.y;
	
	// calculate the intersection point		
	var d = a1*b2 - a2*b1;
	
	// parallel when d is 0
	if (d == 0) {
		return false;
	}else {
		var x = (b2*c1 - b1*c2) / d;
		var y = (a1*c2 - a2*c1) / d;
					
		// check if the interception point is on both line segments
		if ((isInBetween(line1.startPoint.x, x, line1.endPoint.x) || isInBetween(line1.startPoint.y, y, line1.endPoint.y)) &&
			(isInBetween(line2.startPoint.x, x, line2.endPoint.x) || isInBetween(line2.startPoint.y, y, line2.endPoint.y))) 
		{
			return true;	
		}
	}
	
	return false;
}

// return true if b is between a and c,
// we exclude the result when a==b or b==c
function isInBetween(a, b, c) {
	// return false if b is almost equal to a or c.
	// this is to elmiate some floating point when
	// two value is equal to each other but different with 0.00000...0001
	if (Math.abs(a-b) < 0.000001 || Math.abs(b-c) < 0.000001) {
		return false;
	}
	
	// true when b is in between a and c
	return (a < b && b < c) || (c < b && b < a);
}

