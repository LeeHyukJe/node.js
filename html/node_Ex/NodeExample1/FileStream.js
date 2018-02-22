var fs=require('fs');

var inname='./pic1.jpg';
var outname='.pic_copy.jpg';

fs.exists(outname,function(exist){
	if(exist){
		fs.unlink(outname,function(err){
			if(err) throw err;
			console.log('기존 파일을 삭제함');
		});
	}

	var infile=fs.createReadStream(inname,{flags:'r'});
	var outfile=fs.createWriteStream(outname,{flags:'w'});
	infile.pipe(outfile);
	console.log('파일 복사');
});