var net = require('net');
var EventEmitter = require('events').EventEmitter;

function Socket(address) {
  var pieces = address.split(':');
  this.connection = net.connect({ host: pieces[0], port: pieces[1] });
  this.connection.on('connect', this.onConnect.bind(this));
  this.connection.on('data', this.onData.bind(this));
  this.connection.on('end', this.onEnd.bind(this));
  this.connection.on('timeout', this.onTimeout.bind(this));
  this.connection.on('drain', this.onDrain.bind(this));
  this.connection.on('error', this.onError.bind(this));
  this.connection.on('close', this.onClose.bind(this));
}

Socket.prototype.__proto__ = EventEmitter.prototype;

/**
 * Send a message to the game server.
 */
Socket.prototype.send = function() {
  var msg = Array.prototype.slice.call(arguments);
  var str = JSON.stringify(msg);
  this.connection.write(str);
};

Socket.prototype.onConnect = function() {
  this.emit('connect');
};

Socket.prototype.onData = function(data) {
  this.emit('data', data);
};

Socket.prototype.onEnd = function() {
  this.emit('end');
};

Socket.prototype.onTimeout = function() {
  this.emit('timeout');
};

Socket.prototype.onDrain = function() {
  this.emit('drain');
};

Socket.prototype.onError = function(err) {
  this.emit('error', err);
};

Socket.prototype.onClose = function(hadError) {
  this.emit('close', hadError);
};

module.exports = Socket;