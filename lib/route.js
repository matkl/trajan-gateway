var EventEmitter = require('events').EventEmitter;

var DISCONNECT = 0;
var CONNECT = 1;
var ACTION = 2;

function Route(socket, gameId, clientId, userData) {
  this.socket = socket;
  this.gameId = gameId;
  this.clientId = clientId;
  this.connect(userData);
}

Route.prototype.__proto__ = EventEmitter.prototype;

/**
 * Connect a client to a game.
 * @param {data} userData any data associated with this client.
 * @api private
 */
Route.prototype.connect = function(userData) {
  this.socket.send(CONNECT, this.clientId, this.gameId, userData);
};

/**
 * Send an action to the game.
 * @param {...} action arguments
 * @api public
 */
Route.prototype.send = function() {
  Array.prototype.unshift.call(arguments, ACTION, this.clientId);
  this.socket.send.apply(this.socket, arguments);
};

/**
 * Disconnect the client from the game.
 * @api public
 */
Route.prototype.disconnect = function() {
  this.socket.send(DISCONNECT, this.clientId);
};

Route.prototype.onMessage = function(/* arg1, ..., argN */) {
  Array.prototype.unshift.call(arguments, 'message');
  this.emit.apply(this, arguments);
};

module.exports = Route;