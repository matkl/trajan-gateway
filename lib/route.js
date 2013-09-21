var EventEmitter = require('events').EventEmitter;

var DISCONNECT = 0;
var CONNECT = 1;
var ACTION = 2;

function Route(server, resourceId, clientId, clientData) {
  this.server = server;
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
  this.server.send(CONNECT, this.clientId, this.resourceId, clientData);
};

/**
 * Send an action to the game.
 * @param {...} action arguments
 * @api public
 */
Route.prototype.send = function() {
  Array.prototype.unshift.call(arguments, ACTION, this.clientId);
  this.server.send.apply(this.server, arguments);
};

/**
 * Disconnect the client from the game.
 * @api public
 */
Route.prototype.disconnect = function() {
  this.server.send(DISCONNECT, this.clientId);
};

Route.prototype.onMessage = function(/* arg1, ..., argN */) {
  Array.prototype.unshift.call(arguments, 'message');
  this.emit.apply(this, arguments);
};

module.exports = Route;