var crypto = require('crypto');
var Server = require('./server');
var Route = require('./route');

function Service(id, addresses) {
  this.id = id;
  this.servers = [];
  this.routes = {};
  this.connect(addresses);
}

Service.prototype.connect = function(addresses) {
  addresses = typeof addresses == 'string' ? [ addresses ] : addresses;
  for (var i = 0; i < addresses.length; i++) {
    this.servers.push(this.connectServer(addresses[i]));
  }
};

Service.prototype.connectServer = function(address) {
  var server = new Server(address);
  server.on('message', this.onMessage.bind(this));
  return server;
};

Service.prototype.route = function(resourceId, clientId, clientData) {
  var num = parseInt(crypto.createHash('md5').update(resourceId).digest('hex').substr(0, 8), 16);
  var server = this.servers[num % this.servers.length];
  this.routes[clientId] = new Route(server, resourceId, clientId, clientData);
  return this.routes[clientId];
};

Service.prototype.onMessage = function(clientId /* , arg1, ..., argN */) {
  if (!this.routes[clientId]) return;
  var args = Array.prototype.slice.call(arguments, 1);
  this.routes[clientId].onMessage.apply(this.routes[clientId], args);
};

module.exports = Service;