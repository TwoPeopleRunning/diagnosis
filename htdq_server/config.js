module.exports = {
    host: 'htdq.ansi.space', // Hostname of IoTgo platform
    db: {
        uri: 'mongodb://127.0.0.1/DNC', // MongoDB database address
        options: {
            server: {
                socketOptions: {
                    keepAlive: 300000, connectTimeoutMS: 30000
                }
            },
        }
    },
    apikey: "26c0fed3-7d6e-4102-9d52-9e5826e0f9f3",
    BACK: {
        HOST: '127.0.0.1',
        PORT: '9988'
    },
    jwt: {
        secret: 'jwt_secret' // Shared secret to encrypt JSON Web Token
    },
    admin: {
        'zhangansi@yeah.net': 'admin' // Administrator account of IoTgo platform
    },
    page: {
        limit: 50, // Default query page limit
        sort: -1 // Default query sort order
    },
    recaptcha: {
        secret: '', // Google reCAPTCHA serect
        url: 'https://www.google.com/recaptcha/api/siteverify'
    },
    pendingRequestTimeout: 3000,
    defaultEndtime: new Date('2017-12-23 04:40:00').getTime(),
    defaultStarttime: new Date('2017-10-07 04:40:00'),
    UseEnd: true
};