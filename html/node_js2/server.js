var http=require('http');
var fs=require('fs');

//웹 서버 객체를 만듭니다.
var server=http.createServer(function(req,res){

});

var port=3000;
server.listen(port,function(req,res){
	console.log('웹 서버가 실행 중..... %d',port);
});

//크라이언트 연결 이벤트
server.on('connection',function(socket){
	var addr=socket.address();
	console.log('클라이언트가 접속하였습니다. %s : %d',addr.address,addr.port);

});

//클라이언트 요청 이벤트
server.on('request',function(req,res){
	console.log('클라이언트로부터 요청이 들어왔습니다.');
	var filename='pic1.jpg';
	// fs.readFile(filename,function(err,data){
	// 	res.writeHead(200,{'Content-Type':'image/jpg'});
	// 	res.write(data);
	// 	res.end();
	// });

	// var infile=fs.createReadStream(filename,{flags:'r'});
	// infile.pipe(res);

	var infile=fs.createReadStream(filename,{flags:'r'});
	var filelengh=0;
	var curlength=0;

	fs.stat(filename,function(err,stats){
		filelengh=stats.size;
	});

	//헤더쓰기
	res.writeHead(200,{'Content-Type':'image/jpg'});

	//파일 내용을 스트림에서 읽어 본문 쓰기
	infile.on('readable',function(){
		var chunck;
		while(null!=(chunck=infile.read())){ //조금씩 읽어들이기
			console.log('읽어들인 데이터 크기: %d 바이트',chunck.length);
			curlength+=chunck.length;
			res.write(chunck,'utf-8',function(err){
				console.log('파일 부분 쓰기 완료 :%d, 파일크기:%d',curlength,filelengh);
				if(curlength>=filelengh){
					res.end();
				}
			});
		}
	});

});

//클라이언트 종료
server.on('close',function(req,res){
	console.log('서버가 종료되었습니다.');
});