var EventEmitter = require('events').EventEmitter;

var DISCONNECT = 0;
var CONNECT = 1;
var ACTION = 2;

function Route(socket, resourceId, clientId, clientData) {
  this.socket = socket;
  this.resourceId = resourceId;
  this.clientId = clientId;
  this.connect(clientData);
}

Route.prototype.__proto__ = EventEmitter.prototype;

/**
 * Connect a client to a game.
 * @param {data} clientData any data associated with this client.
 * @api private
 */
Route.prototype.connect = function(clientData) {
  this.socket.send(CONNECT, this.clientId, this.resourceId, clientData);
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