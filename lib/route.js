var DISCONNECT = 0;
var CONNECT = 1;
var ACTION = 2;

function Route(socket, gameId, clientId, userData) {
  this.socket = socket;
  this.gameId = gameId;
  this.clientId = clientId;
  this.connect(userData);
}

/**
 * Connect a client to a game.
 * @param {data} userData any data associated with this client.
 * @api private
 */
Route.prototype.connect = function(userData) {
  this.socket.send(CONNECT, this.clientId, this.gameId, this.userData);
};

/**
 * Send an action to the game.
 * @param {...} action arguments
 * @api public
 */
Route.prototype.send = function() {
  Array.prototype.arguments.unshift.call(arguments, ACTION, this.clientId);
  this.socket.send.apply(this.socket, arguments);
};

/**
 * Disconnect the client from the game.
 * @api public
 */
Route.prototype.disconnect = function() {
  this.socket.send(DISCONNECT, this.clientId);
};

module.exports = Route;