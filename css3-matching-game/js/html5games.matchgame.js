/*!
 * CSS3 Card Games Example
 * http://gamedesign.cc/html5games/CSS3-matching-game/
 * 
 * This is an example game for the book HTML5 Games Development: A Beginning Guide.
 * 
 * Copyright 2010, Thomas Seng Hin Mak
 * makzan@gmail.com
 *   
 * All Right Reserved.
 */
 
// a global object to hold all global variables related to the game.
var matchingGame = {};

// all possible values for each card in deck
matchingGame.deck = [
	'cardAK', 'cardAK',
	'cardAQ', 'cardAQ',
	'cardAJ', 'cardAJ',
	'cardBK', 'cardBK',
	'cardBQ', 'cardBQ',
	'cardBJ', 'cardBJ',	
];

// every code inside $(function(){}) will be run 
// after the DOM is loaded and ready.
$(function(){
	// shuffling the deck
	matchingGame.deck.sort(shuffle);
	
	// clone 12 copies of the card
	for(var i=0;i<11;i++){
		$(".card:first-child").clone().appendTo("#cards");
	}
	
	// initialize each card
	$("#cards").children().each(function(index) {		
		// align the cards to be 4x4 ourselves.
		$(this).css({
			"left" : ($(this).width()  + 20) * (index % 4),
			"top"  : ($(this).height() + 20) * Math.floor(index / 4)
		});
		
		// get a pattern from the shuffled deck
		var pattern = matchingGame.deck.pop();
		
		// visually apply the pattern on the card's back side.
		// the pattern value is actually a CSS class with the
		// corrisponding playing card graphic.
		$(this).find(".back").addClass(pattern);
		
		// embed the pattern data into the DOM element.
		$(this).attr("data-pattern",pattern);
						
		// listen the click event on each card DIV element.
		$(this).click(selectCard);				
	});	
});

function selectCard() {
	// we do nothing if there are already two card flipped.
	if ($(".card-flipped").size() > 1)
	{
		return;
	}
	
	// add the class "card-flipped".
	// the browser will animate the styles between current state and card-flipped state.
	$(this).addClass("card-flipped");
	
	// check the pattern of both flipped card 0.7s later.
	if ($(".card-flipped").size() == 2)
	{
		setTimeout(checkPattern,700);
	}
}

// a function to return random number between -0.5 to 0.5
function shuffle()
{
	// returning a random number in sort function.
	// the sort function determine by eiter possitive number and negative number.
	// Math.random() range from 0 - 1, 0.5 - Math.random() results eiter possitive or negative number.	
	return 0.5 - Math.random();
}

// a function to do action when both cards match
function checkPattern()
{
	if (isMatchPattern())
	{
		$(".card-flipped").removeClass("card-flipped").addClass("card-removed");
		
		// delete the card DOM node after the transition finished.
		$(".card-removed").bind("webkitTransitionEnd", removeTookCards);
	}
	else
	{
		$(".card-flipped").removeClass("card-flipped");
	}
}

// a function to delete all removed cards
function removeTookCards()
{
	$(".card-removed").remove();
}

// a function to check if the flipped card match the pattern.
function isMatchPattern()
{
	var cards = $(".card-flipped");
	var pattern = $(cards[0]).data("pattern");
	var anotherPattern = $(cards[1]).data("pattern");
	return (pattern == anotherPattern);
}

