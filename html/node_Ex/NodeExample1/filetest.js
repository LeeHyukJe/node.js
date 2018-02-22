/**
 * 5장 Test 5
 *
 * http 모듈로 웹 서버 만들기
 *
 * 이미지 파일 읽어 응답으로 전송하기
 */

var http = require('http');
var fs = require('fs');

// 웹서버 객체를 만듭니다.
var server = http.createServer();

// 웹서버를 시작하여 3000번 포트에서 대기하도록 합니다.
var port = 3000;
server.listen(port, function() {
	console.log('웹서버가 시작되었습니다. : %d', port);
});

// 클라이언트 연결 이벤트 처리
server.on('connection', function(socket) {
	console.log('클라이언트가 접속했습니다. : %s, %d', socket.remoteAddress, socket.remotePort);
});

// 클라이언트 요청 이벤트 처리
server.on('request', function(req, res) {
	console.log('클라이언트 요청이 들어왔습니다.');

	var filename='house.png';
	var infile=fs.createReadStream(filename,{flags:'r'}); //스트림으로 읽어서
	var filelength=0;
	var curlength=0;
	fs.stat(filename,function(err,stats){
		filelength=stats.size;
	});

	//헤더쓰기
	res.writeHead(200,{'Content-Type':'image/png'});

	infile.on('readable',function(){
		var chunk;
		while(null!==(chunk=infile.read())){
			console.log('읽어들인 데이터 크기:%d byte',chunk.length);
			curlength+=chunk.length;
			res.write(chunk,'utf-8',function(err){
				console.log('파일 부분 쓰기 완료 : %d, filesize :%d',curlength,filelength);
				if(curlength>=filelength){
					res.end();
				}
			});
		}
	});
});

// 서버 종료 이벤트 처리
server.on('close', function() {
	console.log('서버가 종료됩니다.');
});

