var express = require("express");
var multer = require('multer');
var async = require("async");
var extract = require('extract-zip');
var base64Img = require('base64-img');
var cors = require('cors');

var app = express();
//app.use(cors());		
//app.options('*', cors());	

var tempFile = '';

var storage = multer.diskStorage({
	destination : function(req, file, callback) {
		callback(null, "C:\\281\\CMPE281-Personal\\uploads\\Tenant2");
	},
	filename : function(req, file, callback) {
		// callback(null, file.fieldname + '.' + file.);
		
		tempFile = "C:\\281\\CMPE281-Personal" + "\\uploads\\Tenant2\\" + file.originalname;
		console.log(tempFile);
		callback(null, file.originalname);
	}
});
var upload = multer({
	storage : storage
}).single('file');

app.get('/', function(req, res) {
	res.sendfile(__dirname + "/index.html");
});

app.post('/api/2/file', function(req, res) {
	async.waterfall([
			function(callback) {
				upload(req, res, function(err) {
					if (err) {
						return res.end("Error uploading file.");
					}
					callback(null, tempFile);
					// res.end("File is uploaded");
					// extract();
					console.log('Hit inside 2');
				});
			},
			function(arg1, callback) {
				console.log('Inside Extract');
				console.log(arg1);
			 var file =	extract(arg1, {
					dir : "C:\\281\\CMPE281-Personal\\uploads\\Tenant2"
				}, function(err) {
					// handle err
					if (err == typeof (undefined))
						return res.end("Error extracting file.");
					//else
					//	res.end("File is extracted");
				})

				callback(null, "C:\\281\\CMPE281-Personal\\uploads\\Tenant2\\sequence-10.0.jar");

			},
			function(arg1, callback) {
				console.log("Inside select and run java");
				console.log(arg1);
				
//				var child = require('child_process').spawn('java',
	//					[ '-jar', arg1,'--headless' ,'example.seq']);
		
				//console.log(child);

				var child = require('child_process').spawn('java',
							[ '-jar', 'C:/281/CMPE281-Personal/uploads/Tenant2/CMPE202_v5.jar','class','C:/281/CMPE281-Personal/uploads/Tenant2/resources' ,'C:/281/CMPE281-Personal/uploads/Tenant2/uml.png']);

				
				/*
				
				var exec = require('child_process').exec;
				
				var child=exec(' java -jar C:/281/CMPE281-Personal/uploads/Tenant1/umlparser.jar C:/281/CMPE281-Personal/uploads/Tenant1/cmpe202/resources C:/281/CMPE281-Personal/uploads/Tenant1/cmpe202/uml.png',
				  function (error, stdout, stderr){
				    console.log('Output -> ' + stdout);
				    if(error !== null){
				      console.log("Error -> "+error);
				    }
				});
				*/
				var data = base64Img.base64Sync('C:/281/CMPE281-Personal/uploads/Tenant2/uml.png');

			    res.setHeader('Content-Type', 'application/json');

				
			    //res.send(JSON.stringify({ data: data }));
			    res.jsonp(data);
				res.end("File generated");
			}

	], function(err, result) {
		if(err!==null){
			console.log(err);
		}});
});

app.listen(3000, function() {
	console.log("Working on port 3000");
});
