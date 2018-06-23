/**
 * Private variables and functions
 */
var interceptors = [];

/**
 * Exports
 */
module.exports = exports = function (req, res) {
  interceptors.forEach(function (interceptor) {
    interceptor(req, res);
  });

  return res;
};