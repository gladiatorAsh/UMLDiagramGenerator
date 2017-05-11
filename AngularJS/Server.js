var express = require('express');
var server = express();
var request= require('request');
var fs=require('fs');

server.use(express.bodyParser());
server.use(server.router);

server.use('/public', express.static(__dirname + '/public'));



server.post('/api/1/file', function(req, res) {
  //console.log(req);
if(!req.files){
  return res.status(400).send("No file received");
}
 
 
 var receivedFile=req.files.file;
 
  console.log(req.body);
  console.log(req.body.selectedName);
 
request.post({
  url:"http://ec2-54-202-212-137.us-west-2.compute.amazonaws.com:3000/api/1/file",
  file: receivedFile
},
function optionalCallBack(error,httpResponse,body){
  if(error){
    return res.status(500).send(error);
  }

  return res.status(200).send(body);
});
   
 
 
 // res.end("1");

});

/*
server.get('/*', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
*/

var port = 8000;
server.listen(port, function() {
  console.log('server listening on port ' + port);
});

