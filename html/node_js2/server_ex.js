var express=require('express'),
	http=require('http'),
	path=require('path');

var bodyParser=require('body-parser'),
	static=require('serve-static');

//익스프레스 객체 생성
var app=express();

app.set('port',process.env.PORT||3000);

app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());

app.use('/public',static(path.join(__dirname,'public')));

var router=express.Router();

router.route('/process/login').post(function(req,res){
	var paramId=req.body.id;
	var paramPassword=req.body.password;

	res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
	res.write('<h1>'+paramId+':'+paramPassword+'</h1>');
	res.end();
});

app.use('/',router);
//express 서버 시작
http.createServer(app).listen(app.get('port'),function(){
	console.log('익스프레스 서버를 시작하였습니다.',app.get('port'));
});


// var server=http.createServer(app);
// server.listen(app.get('port'),function(){
// 	console.log('서버를 열었습니다.');
// })