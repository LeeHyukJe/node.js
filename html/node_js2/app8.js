var express=require('express'),
	http=require('http'),
	path=require('path');

var bodyParser=require('body-parser'),
	//static=require(express.static('public')),
	static=require('serve-static');

var app=express();

//라우터 객체 참조
var router=express.Router();

//기본 포트 설정
app.set('port',process.env.PORT||3000);

//body-parser를 통해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());

app.use('/public',static(path.join(__dirname,'public')));



router.route('/process/login').post(function(req,res){
	console.log('/process/login 처리함.');

	var paramId = req.body.id || req.query.id;
	var paramPassword = req.body.password || req.query.password;

	res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
	res.write('<h1>Express 서버에서 응답한 결과입니다.</h1>');
	res.write('<div><p>Param id : ' + paramId + '</p></div>');
	res.write('<div><p>Param password : ' + paramPassword + '</p></div>');
	res.write("<br><br><a href='/public/login2.html'>로그인 페이지로 돌아가기</a>");
	res.end();
});

app.use('/',router);


app.listen(app.get('port'),'127.0.0.1',function(){
	console.log('서버가 열렸습니다.');
});

//http.createServer(app).listend(app.get('port'),function(){
//console.log('서버가 열렸습니다.');
//});