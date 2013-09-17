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
  this.buffer = '';
  this.payloadLength = null;
}

Socket.prototype.__proto__ = EventEmitter.prototype;

/**
 * Send a message to the game server.
 */
Socket.prototype.send = function() {
  var msg = Array.prototype.slice.call(arguments);
  var payload = JSON.stringify(msg);
  var str = payload.length + '#' + payload;
  this.connection.write(str);
};

Socket.prototype.onConnect = function() {
  this.emit('connect');
};

Socket.prototype.onData = function(data) {
  this.buffer += data;
  var n = this.buffer.indexOf('#');
  if (n >= 0) {
    this.payloadLength = parseInt(this.buffer.substring(0, n));
    if (isNaN(this.payloadLength)) return console.error('protocol error');
    this.buffer = this.buffer.substring(n + 1);
  }
  if (this.payloadLength) {
    if (this.buffer.length == this.payloadLength) {
      this.handleData(this.buffer);
    } else if (this.buffer.length > this.payloadLength) {
      var buffer = this.buffer.substring(0, this.payloadLength);
      var rest = this.buffer.substring(this.payloadLength);
      this.handleData(buffer),
      this.onData(rest);
    }
  }
  this.emit('data', data);
};

Socket.prototype.handleData = function(data) {
  this.payloadLength = null;
  this.buffer = '';
  var msg = JSON.parse(data);
  this.onMessage.apply(this, msg);
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

Socket.prototype.onMessage = function(clientId /* , arg1, ..., argN */) {
  Array.prototype.unshift.call(arguments, 'message');
  this.emit.apply(this, arguments);
};

module.exports = Socket;