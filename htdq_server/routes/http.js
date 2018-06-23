/**
 * Dependencies
 */
var config = require('../config');
var protocol = require('../protocol/index');

module.exports = function (req, res) {
  // disable `Host` check
  if (/*req.header('Host') !== config.host ||*/
    req.header('Content-Type') !== 'application/json') {
    res.status(400).end();
    return;
  }
  console.log('\nHTTP REQUEST');
  protocol.postRequest(req.body, function (resBody) {
    res.send(resBody);
  });
};
