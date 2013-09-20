var Socket = require('net').Socket;
var debug = require('debug')('trajan-gateway:socket');
var EventEmitter = require('events').EventEmitter;

function Server(address) {
  var pieces = address.split(':');
  this.host = pieces[0];
  this.port = pieces[1];
  this.socket = new Socket();
  this.socket.on('connect', this.onConnect.bind(this));
  this.socket.on('data', this.onData.bind(this));
  this.socket.on('end', this.onEnd.bind(this));
  this.socket.on('timeout', this.onTimeout.bind(this));
  this.socket.on('drain', this.onDrain.bind(this));
  this.socket.on('error', this.onError.bind(this));
  this.socket.on('close', this.onClose.bind(this));
  this.buffer = '';
  this.payloadLength = null;
  this.connect();
}

Server.prototype.__proto__ = EventEmitter.prototype;

/**
 * Send a message to the game server.
 */
Server.prototype.send = function() {
  var msg = Array.prototype.slice.call(arguments);
  var payload = JSON.stringify(msg);
  var str = payload.length + '#' + payload;
  this.socket.write(str);
};

Server.prototype.connect = function() {
  this.socket.connect({ host: this.host, port: this.port });
};

Server.prototype.onConnect = function() {
  debug('Connected to server ' + this.socket.remoteAddress + ':' + this.socket.remotePort);
  this.emit('connect');
};

Server.prototype.onData = function(data) {
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

Server.prototype.handleData = function(data) {
  this.payloadLength = null;
  this.buffer = '';
  var msg = JSON.parse(data);
  this.onMessage.apply(this, msg);
};

Server.prototype.onEnd = function() {
  debug('end');
  this.emit('end');
};

Server.prototype.onTimeout = function() {
  debug('timeout');
  this.emit('timeout');
};

Server.prototype.onDrain = function() {
  this.emit('drain');
};

Server.prototype.onError = function(err) {
  console.error(err);
  debug('error');
};

Server.prototype.onClose = function(hadError) {
  setTimeout(this.connect.bind(this), 5000);
  debug('close');
  this.emit('close', hadError);
};

Server.prototype.onMessage = function(clientId /* , arg1, ..., argN */) {
  Array.prototype.unshift.call(arguments, 'message');
  this.emit.apply(this, arguments);
};

module.exports = Server;