var crypto = require('crypto');
var Socket = require('./socket');
var Route = require('./route');

function Service(id, addresses) {
  this.id = id;
  this.sockets = [];
  this.connect(addresses);
}

Service.prototype.connect = function(addresses) {
  addresses = typeof addresses == 'string' ? [ addresses ] : addresses;
  for (var i = 0; i < addresses.length; i++) {
    this.sockets.push(new Socket(addresses[i]));
  }
};

Service.prototype.route = function(gameId, clientId, userData) {
  var num = parseInt(crypto.createHash('md5').update(gameId).digest('hex').substr(0, 8), 16);
  var socket = this.sockets[num % this.sockets.length];
  return new Route(socket, gameId, clientId, userData);
};

module.exports = Service;