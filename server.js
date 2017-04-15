#!/bin/env node
// Node.js Application to run a backen API

// import the required modules
var http = require('http');
var mysql = require('mysql');
var querystring = require('querystring');
var url = require('url');

// define constants for credentials to access database
const dbHost = process.env.OPENSHIFT_MYSQL_DB_HOST;
const dbUser = process.env.OPENSHIFT_MYSQL_DB_USERNAME;
const dbPassword = process.env.OPENSHIFT_MYSQL_DB_PASSWORD;;
const dbName = "infisesapitest";

// create connections to mysql server and required database
var dbConfig = {
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName
};
var conn = mysql.createConnection(dbConfig);

// API Part 1 : Stocks List

// function to return a json that stores a list of stocks defining name, current, difference, percentage, sector, profile
var stocksList = function(profileFlag, callback) {
    // defines the name of the sql table
    const tableName = "stocks";
    // sql query
    var sql = "SELECT name, current, difference, percentage, sector FROM " + tableName + ";";
    // if profile of the current stock is required
    if(profileFlag) {
        sql = "SELECT name, current, difference, percentage, sector, profile FROM " + tableName + ";";
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
    var sql = "SELECT time, content FROM " + tableName + ";";
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
    for(var str of query) {
        var parts = str.split("=");
        args[querystring.unescape(parts[0])] = querystring.unescape(parts[1]);
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
        // call the appropriate API function to make the database query and invoke the callback function
        stocksList(profileFlag, cb);
    }
    else if(uri == '/api/headlineslist') {
        // call the appropriate API function to make the database query and invoke the callback function
        headlinesList(cb);
    }
    else if(uri == '/api/fullstock') {
        // call the appropriate API function to make the database query and invoke the callback function
        var stockName = args['name'];
        fullStock(stockName, cb);
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
const port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
const host = process.env.OPENSHIFT_NODEJS_IP;

// start the web server
server.listen(port, host);
console.log("Web server started on http://", host, ":", port);