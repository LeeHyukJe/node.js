var fs=require('fs');
var http=require('http');
var server=http.createServer(function(reqeust,response){
	var infile=fs.createReadStream('./source_code');
	infile.pipe(response);
});


server.listen(30013,'127.0.0.1');