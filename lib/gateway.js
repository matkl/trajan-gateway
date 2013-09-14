var Service = require('./service');

function Gateway() {
  if (!(this instanceof Gateway)) return new Gateway();
  this.services = {};
}

Gateway.prototype.addService = function(id, addresses) {
  this.services[id] = new Service(id, addresses);
};

Gateway.prototype.route = function(serviceId, gameId, clientId, userData) {
  if (!this.services[serviceId]) return null;
  return this.services[serviceId].route(gameId, clientId, userData);
};

module.exports = Gateway;