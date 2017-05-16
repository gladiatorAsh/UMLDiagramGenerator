var express = require('express');
var server = express();
var request = require('request');
var fs = require('fs');
var mysql = require('mysql');
var sql_statement = '';
var tenantRecord = '';
var URL = '';
var port = 8000;
var loadBalancerAdd='' // Removed for privacy

//Get MySQL connection
function getConn() {
  var connection = mysql.createConnection({
    host: configuration.getHost(), //Removed for privacy
    user: configuration.getUser(), //Removed for privacy
    password: configuration.getPasswd(), //Removed for privacy
    database: configuration.getDB(), //Removed for privacy
    port: 3306
  });

  return connection;

}

//Get last Inserted ID
function getIndex() {
  return configuration.getIndex(); // Removed for privacy
}

//Execute Query and get ResultSet
function fetchData(callback, sqlQuery) {
  console.log("\nSQL Query::" + sqlQuery);

  var connection = getConn();

  connection.query(sqlQuery, function (err, rows, fields) {

    if (err) {
      console.log("ERROR: " + err.message);
    } else
    {
      console.log("DB Results:" + rows);
      callback(err, rows);
    }

  });

  console.log("\nConnection closed..");

  connection.end();

}


server.use(express.bodyParser());
server.use(server.router);

//Serve static content
server.use('/public', express.static(__dirname + '/public'));

//Post Grade
server.post('/api/1/grade', function (req, res) {
  console.log(req.body.grade);
  console.log(req.body.complete);
  console.log(req.body.comments);
  console.log(req.body.tenant);
  var points = req.body.grade;
  var done = req.body.complete;
  var comments = req.body.comments;
  var tenant_id = req.body.tenant;
  var scale = 10; //ToDO: Change
  recordCount = getIndex();
  console.log("Tenant ID:" + tenant_id);
  //Different tenants have different columns to be inserted
  switch (tenant_id) {
    case "1":

      tenantRecord = recordCount;
      sql_statement = "insert into TENANT_DATA (RECORD_ID, TENANT_ID, TENANT_TABLE, COLUMN_1, COLUMN_2, COLUMN_3 ) values ( " +
        recordCount +
        ", 'T1', 'T1_TABLE',  " +
        tenantRecord +
        ", " + points + ", " + done + ");"
      break;

    case "2":

      tenantRecord = recordCount;
      sql_statement = "insert into TENANT_DATA (RECORD_ID, TENANT_ID, TENANT_TABLE, COLUMN_1, COLUMN_2) values ( " +
        recordCount +
        ", 'T2', 'T2_TABLE', " +
        tenantRecord +
        ", " +
        points + ");"
      break;


    case "3":

      tenantRecord = recordCount;
      sql_statement = "insert into TENANT_DATA (RECORD_ID, TENANT_ID, TENANT_TABLE, COLUMN_1, COLUMN_2, COLUMN_3, COLUMN_4, COLUMN_5) values ( " +
        recordCount +
        ", 'T3', 'T3_TABLE',  " +
        tenantRecord +
        ", " +
        points +
        ", " +
        scale +
        ", " +
        done + ", '" + comments + "' ) ;"
      break;

    case "4":

      tenantRecord = recordCount;
      sql_statement = "insert into TENANT_DATA (RECORD_ID, TENANT_ID, TENANT_TABLE, COLUMN_1, COLUMN_2, COLUMN_3, COLUMN_4) values ( " +
        recordCount +
        ", 'T4', 'T4_TABLE',  " +
        tenantRecord +
        ", '" +
        comments +
        "', " +
        scale +
        ", " +
        done + " ) ;"
      break;

      default:
      break;

  }

  console.log("Dummy:" + sql_statement);

  fetchData(function (err, results) {

    if (!err) {
      console.log("Inserted");
      res.status(200).send('Graded');
    } else {
      res.status(400);
    }
  }, sql_statement);


});

server.post('/api/1/file', function (req, res) {

  if (!req.files) {
    return res.status(400).send("No file received");
  }


  var tenant = req.body.tenant;
  var receivedFile = req.files.file;

  URL = loadBalancerAdd + tenant + '/file';

  console.log('Tenant:' + tenant);
  console.log("File:" + receivedFile);
  console.log("URL:" + URL);

  request.post({
      url: URL,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      file: receivedFile
    },
    function optionalCallBack(error, httpResponse, body) {
      if (error) {
        console.log(error);
        return res.status(500).send(error);
      }
      console.log("Body printed:");
      console.log(body);
      return res.status(200).send(body);
    });

});


server.listen(port, function () {
  console.log('server listening on port ' + port);
});