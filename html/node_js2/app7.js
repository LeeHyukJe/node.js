var express=require('express'),
	http=require('http'),
	path=require('path');

var bodyParser=require('body-parser'),
	//static=require(express.static('public')),
	static=require('serve-static');

var app=express();

//기본 포트 설정
app.set('port',process.env.PORT||3000);

//body-parser를 통해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());

app.use(static(path.join(__dirname,'public')));

//미들웨어로 파리미터 확인하기
app.use(function(req,res){
	console.log('첫번 째 미들웨어에서 요청을 처리함.');

	var paramId=req.body.id|| req.query.id; //get방식이나 post 방식이나 둘다 처리함
	var paramPassword=req.body.password||req.query.password;

	res.writeHead('200',{'Content-Type':'text/html;charset=utf-8'});
	res.write('<h1>Express 서버에서 응답한 결과입니다.</h1>');
	res.write('<div><p>Param ID:'+paramId+'</p></div>');
	res.write('<div><p>Param Password:'+paramPassword+'</p></div>');
	res.end();

});

// app.listen(app.get('port'),function(){
// 	console.log('서버가 열렸습니다.'+app.get('port'));
// });

http.createServer(app).listen(app.get('port'),function(){
	console.log('서버가 열렸습니다.');
});