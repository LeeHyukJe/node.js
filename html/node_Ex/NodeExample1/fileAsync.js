var fs=require('fs');

fs.readFile('./source_code','utf-8',function(err,data){
	console.log(data);
});

console.log('파일 읽기가 완료되었습니다.');