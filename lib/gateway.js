var Service = require('./service');

function Gateway() {
  if (!(this instanceof Gateway)) return new Gateway();
  this.services = {};
}

Gateway.prototype.addService = function(serviceId, addresses) {
  this.services[serviceId] = new Service(serviceId, addresses);
};

Gateway.prototype.route = function(serviceId, resourceId, clientId, clientData) {
  if (!this.services[serviceId]) return null;
  return this.services[serviceId].route(resourceId, clientId, clientData);
};

module.exports = Gateway;