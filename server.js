#!/bin/env node
// Node.js Application to run a backend API

// import the required modules
var http = require('http');
var mysql = require('mysql');
var querystring = require('querystring');
var url = require('url');

// define constants for credentials to access database
const dbHost = process.env.MYSQL_DB_HOST;
const dbUser = process.env.MYSQL_DB_USERNAME;
const dbPassword = process.env.MYSQL_DB_PASSWORD;
const dbPort = process.env.MYSQL_DB_PORT;
const dbName = "infinnovationses";

// create connections to mysql server and required database
var dbConfig = {
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    port: dbPort,
    database: dbName
};
var conn = mysql.createConnection(dbConfig);

// API Part 1 : Stocks List

// function to return a json that stores a list of stocks defining name, current, difference, percentage, sector, profile
var stocksList = function(profileFlag, callback) {
    // defines the name of the sql table
    const tableName = "stocks";
    // sql query
    var sql = "SELECT name, current, difference, percentage, sector FROM " + tableName + " ORDER BY sector, name;";
    // if profile of the current stock is required
    if(profileFlag) {
        sql = "SELECT name, current, difference, percentage, sector, profile FROM " + tableName + " ORDER BY name;";
    }
    conn.query(sql, function(err, rows) {
        if(err) throw err;
        // pass the rows obtained from the database to the callback function      
        callback(rows);
    });
};

// API Part 2 : Headlines List

// function to return a json that stores a list of headlines defining news, time
var headlinesList = function (callback) {
    // defines the name of the sql table
    const tableName = "news";
    // sql query
    var sql = "SELECT time, content FROM " + tableName + " ORDER BY id DESC;";
    conn.query(sql, function(err, rows) {
        if(err) throw err;
        // pass the rows obtained from the database to the callback function      
        callback(rows);
    });
};

// API Part 3 : Full Stock

// function to return a json defining a stock name, current, difference, percentage, sector, profile, pclose, ovalue, lcircuit, ucircuit, dividend, bvalue, updates
var fullStock = function (stockName, callback) {
    // defines the name of the sql table
    const tableName = "stocks";
    // sql query
    var sql = "SELECT name, current, difference, percentage, sector, profile, pclose, ovalue, lcircuit, ucircuit, dividend, bvalue FROM " + tableName + " WHERE name = '" + stockName + "';";
    conn.query(sql, function(err, rows) {
        if(err) throw err;
        // pass the rows obtained from the database to the callback function      
        callback(rows[0]);
    });
};

// API Part 4 : Stock Updates List

// function to return a json that stores a list of updates defining time, current

var updatesList = function(stockName, callback) {
    // defines the name of the sql table
    const tableName = "updates";
    // sql query
    var sql = "SELECT * FROM (SELECT id, time, current FROM " + tableName +" WHERE name='" + stockName +"' ORDER BY id DESC LIMIT 0, 30) AS aliasForLatest ORDER BY id ASC;";
    conn.query(sql, function(err, rows) {
        if(err) throw err;
        // pass the rows obtained to the callback function
        callback(rows);
    });
};

// API Key to access API
const apiKey = process.env.INFI_SES_API_KEY;

// HTTP Web Server

// callback function to handle HTTP requests and pass responses
var handleReq = function (req, res) {
    console.log(req.url, "was requested");
    // path of the requested resource
    var uri = url.parse(req.url).pathname;
    // query string of the request
    var queryStr = url.parse(req.url).query || "";
    var query = queryStr.split("&");
    // store all GET parameters and arguments as an array
    var args = [];
    for(var i in query) {
        var parts = query[i].split("=");
        args[querystring.unescape(parts[0])] = querystring.unescape(parts[1]);
    }

    // test if the API key doesn't match prematurely terminates with 401
    if(args['key'] == undefined || args['key'] != apiKey) {
        res.writeHead(401, {"Content-Type": "text/plain"});
        res.end("401, Unathorised. You do not have permissions to access the API.");
        return;
    }

    // callback function that sends the queried data result as a json HTTP response
    var cb = function(rows) {
        // in case rows is undefined or null prematurely terminate with 404
        if(rows == null || rows == undefined) {
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.end("404, API Error. No such query.");
            return;
        }

        // current date and time
        var date = new Date();
        // adjusts the date object to use UTC + 5:30 IST instead of system time zone provided time
        date = new Date(date.getTime() + (date.getTimezoneOffset() * 60 * 1000) - (-330 * 60 * 1000));
        var day = date.getDate(); var month = date.getMonth() + 1; var year = date.getFullYear(); var hours = date.getHours(); var minutes = date.getMinutes(); var seconds = date.getSeconds();
        // adjust the 0 for date string
        day = (day < 10) ? "0" + day : "" + day; month = (month < 10) ? "0" + month : "" + month; hours = (hours < 10) ? "0" + hours : "" + hours; minutes = (minutes < 10) ? "0" + minutes : "" + minutes; seconds = (seconds < 10) ? "0" + seconds : "" + seconds; 
        // the full date as a string
        var dateStr = day + "/" + month +  "/" + year + " " + hours + ":" + minutes + ":" + seconds;
        // data that is to be passed as JSON object in the HTTP response
        var data = {
            time: dateStr,
            result: rows
        };

        // pass the required HTTP response as a JSON
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(data));
    };

    if(uri == '/api/stockslist') {
        // specify whether profile is required or not
        var profileFlag = (args['profile'] != undefined);
        // call the appropriate API function to make the database query and invoke the callback function for part 1
        stocksList(profileFlag, cb);
    }
    else if(uri == '/api/headlineslist') {
        // call the appropriate API function to make the database query and invoke the callback function for part 2
        headlinesList(cb);
    }
    else if(uri == '/api/fullstock') {
        // call the appropriate API function to make the database query and invoke the callback function for part 3
        var stockName = args['name'];
        fullStock(stockName, cb);
    }
    else if (uri == '/api/updateslist') {
        // call the appropriate API function to make the database query and invoke the callback function for part 4
        var stockName = args['name'];
        updatesList(stockName, cb);
    }
    else if(uri == '/health') {
        res.writeHead(200);
        res.end();
    }
    else {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end("404, API Error. No such resource.");
    }
};

// create an HTTP server with the required callback function
var server = http.createServer(handleReq);

// define the HTTP web server port
const port = process.env.PORT || 8080;

// start the web server
server.listen(port);
console.log("Web server started on http://", host, ":", port);