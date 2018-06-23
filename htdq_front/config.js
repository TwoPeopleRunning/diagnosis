module.exports = {
  host: 'htdq.ansi.space',        // Hostname of IoTgo platform
  // HTDQ_BACK:'210.40.49.66:9966',
  // BACK:{
  //   HOST:'htdq_b.mekhub.cn',
  //   PORT:'80',
  // },
  // FRONT:{
  //   HOST:'htdq_f.mekhub.cn',
  //   PORT:'80',
  // },
  BACK: {
    HOST: '127.0.0.1',
    PORT: '9988',
  },
  FRONT: {
    HOST: '127.0.0.1',
    PORT: '9999',
  },
  db: {
    uri: 'mongodb://127.0.0.1/DNC',   // MongoDB database address
    options: {
      //  user: 'iotgo',                    // MongoDB database username
      //  pass: 'iotgo'                     // MongoDB database password
    }
  },
  jwt: {
    secret: 'jwt_secret_qingtian'                // Shared secret to encrypt JSON Web Token
  },
  admin: {
    'zhangansi@yeah.net': 'admin' // Administrator account of IoTgo platform
  },
  page: {
    limit: 50,                          // Default query page limit
    sort: -1                            // Default query sort order
  },
  recaptcha: {
    secret: '',                       // Google reCAPTCHA serect
    url: 'https://www.google.com/recaptcha/api/siteverify'
  },
  pendingRequestTimeout: 3000
};
