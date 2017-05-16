var express = require("express");
var async = require("async");
var multer = require('multer');
var extract = require('extract-zip');
var base64Img = require('base64-img');
var fs= require('fs');
var originalName='';
var newFolder='';
var fileName='uml.png';
var port=3000;
var uploadDir= "/home/ec2-user/Project/CMPE281-Personal/uploads/Tenant1";
var app = express();

var tempFilePath = '';

var storage = multer.diskStorage({
	destination : function(req, file, callback) {
		callback(null,uploadDir);
	},
	filename : function(req, file, callback) {
		originalName=file.originalname;
		newFolder=uploadDir+'/' + originalName.split('.')[0];
		tempFilePath = uploadDir + "/" + file.originalname;
		callback(null,file.originalname);
	}
});

var upload = multer({
	storage : storage
}).single('file');

//Get Latest file generated in dir
function getNewestFile(dir, regexp) {
    var newest = null;
    var files = fs.readdirSync(dir);
    var one_matched = 0;

    for (var i = 0; i < files.length; i++) {

        if (regexp.test(files[i]) === false){
            continue;
        }
        else if (one_matched === 0) {
            newest = files[i];
            one_matched = 1;
            continue;
        }

        var f1_time = fs.statSync(dir+files[i]).mtime.getTime();
        var f2_time = fs.statSync(dir+newest).mtime.getTime();
        if (f1_time > f2_time) {
            newest[i] = files[i]  ;
        }
    }

    if (newest !== null){
        return (dir + newest);
      }
    return null;
}

//Return static
app.get('/', function(req, res) {
	res.sendfile(__dirname + "/index.html");
});

//Upload file
app.post('/api/1/file', function(req, res) {
	async.waterfall([
			//Upload using multer
			function(callback) {
				upload(req, res, function(err) {
					if (err) {
						console.log(err);
						callback(err);
					}
					callback(null);
				});
			},
			//Extract zip file
			function(callback) {
			 	extract(tempFilePath,{
				        dir: newFolder
				}, function(err) {

					if (err === typeof(undefined)){
						callback(err);
						}

					callback(null);

				});

			},
			//Execute java command to generate UML
			function(callback) {

				var child = require('child_process').spawn('java',
							[ '-jar', uploadDir+ '/umlparser.jar',newFolder , uploadDir+'/'+fileName]);

				callback(null);

			},
			//Return Base-64 encoded image
			function(callback){
				var file=getNewestFile(newFolder+"/", new RegExp('.*\.png'));
				var data = base64Img.base64Sync(file);
			    res.setHeader('Content-Type', 'application/json');
			    res.jsonp(data);
			}

	],
		//Return Error
	 function(err, result) {
		if(err!==null){
			console.log(err);
			res.end(err);
		}});
});

app.listen(port, function() {
	console.log("Working on port " +port);
});
