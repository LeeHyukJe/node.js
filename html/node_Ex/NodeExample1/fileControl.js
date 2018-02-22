var fs=require('fs');

fs.open('./source_code','r',function(err,filedata){
	if(err) throw err;

	var buf=new Buffer(10);
	console.log('버퍼 타입 %s',Buffer.isBuffer(buf));

	fs.read(filedata,buf,0,buf.length,null,function(err,bytesRead,buffer){
		if(err) throw err;

		var inStr=buffer.toString('utf-8',0,bytesRead);
		console.log('파일에서 읽은 데이터 %s',inStr);

		console.log(err,bytesRead,buffer);

		fs.close(filedata,function(){
			console.log('source_code 열고 읽기 완료!');
		});
	});
});