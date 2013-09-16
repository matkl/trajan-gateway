var crypto = require('crypto');
var Socket = require('./socket');
var Route = require('./route');

function Service(id, addresses) {
  this.id = id;
  this.sockets = [];
  this.routes = {};
  this.connect(addresses);
}

Service.prototype.connect = function(addresses) {
  addresses = typeof addresses == 'string' ? [ addresses ] : addresses;
  for (var i = 0; i < addresses.length; i++) {
    this.sockets.push(this.createSocket(addresses[i]));
  }
};

Service.prototype.createSocket = function(address) {
  var socket = new Socket(address);
  socket.on('message', this.onMessage.bind(this));
  return socket;
};

Service.prototype.route = function(gameId, clientId, userData) {
  var num = parseInt(crypto.createHash('md5').update(gameId).digest('hex').substr(0, 8), 16);
  var socket = this.sockets[num % this.sockets.length];
  this.routes[clientId] = new Route(socket, gameId, clientId, userData);
  return this.routes[clientId];
};

Service.prototype.onMessage = function(clientId /* , arg1, ..., argN */) {
  if (!this.routes[clientId]) return;
  var args = Array.prototype.slice.call(arguments, 1);
  this.routes[clientId].onMessage.apply(this.routes[clientId], args);
};

module.exports = Service;