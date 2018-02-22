var express=require('express'),
	http=require('http'),
	path=require('path');

var bodyParser=require('body-parser'),
	//static=require(express.static('public')),
	static=require('serve-static');

var expressErrorHandler=require('express-error-handler');
var cookieParser=require('cookie-parser');

var app=express();



//기본 포트 설정
app.set('port',process.env.PORT||3000);

//body-parser를 통해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());

app.use('/public',static(path.join(__dirname,'public')));

app.use(express.cookieParser());

//라우터 객체 참조
var router=express.Router();


router.route('process/showCookie').get(function(req,res){
	console.log('/process/showCookie 호출됨');

	res.send(req.cookie);
});

router.route('/process/setUserCookie').get(function(req,res){
	console.log('/process/setUse/Cookie 호출 됨');

	//쿠키 설정
	res.cookie('user',{
		id:'hyukje',
		name:'소녀시대',
		authorized:true
	});

	res.redirect('/process/showCookie');
});


app.use('/',router);

var errorHandler=expressErrorHandler({
	static:{
		'404':'./public/404.html'
	}
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);


// app.listen(app.get('port'),'127.0.0.1',function(){
// 	console.log('서버가 열렸습니다.');
// });

http.createServer(app).listen(app.get('port'),function(){
	console.log('서버가 열렸습니다. 포트번호 :',app.get('port'));
});