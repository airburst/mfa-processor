const express = require('express');
const bodyParser = require('body-parser');
const config = require('config');

module.exports = class RestService {

    constructor() {
        this.app = express();
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.port = config.get('couchdb.restPort') || 6000;
        this.router = express.Router();
    }
    
    handleError(res, reason, message, code) {
        console.log('ERROR: ' + reason);
        res.status(code || 500).json({ 'error': message });
    }

    start() {
        // Allow CORS (Testing only)
        this.router.use(function (req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });

        this.router.route('/up')
            .get(function (req, res) {
                res.send({ status: 'ok' });
            })

        // this.router.route('/up').get(function (req, res) {
        //     if (!(req.body.to)) { this.handleError(res, 'Invalid user input', 'Must provide an address to send to.', 400); }
        //     var to = req.body.to;
        //     res.json({ message: 'Email sent to ' + req.body.to });
        // });

        this.app.use('/', this.router);

        // Start the server
        this.app.listen(this.port);
        console.log('REST API listening on port ' + this.port);
    }

}