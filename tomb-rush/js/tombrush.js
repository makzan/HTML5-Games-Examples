var debug = {};
debug.log = function (message) {
  document.getElementById('debug-output').innerHTML += message + '<br>';
}

// window/global scope
var tombrush = tombrush || {};


window.onload = function() {
  // entry point
  tombrush.game = new tombrush.Game();
};
