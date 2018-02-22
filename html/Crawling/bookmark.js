/**
 * @date 2017-11-28
 * @author Lee Hyuk Je
 */

// Express 기본 모듈 불러오기
var express = require('express')
	, http = require('http')
	, path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
	, cookieParser = require('cookie-parser')
	, static = require('serve-static')
	, errorHandler = require('errorhandler');

// 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
var expressSession = require('express-session');

//mysql 모듈 불러오기
var mysql=require('mysql');

var client=require('cheerio-httpcli');

// 익스프레스 객체 생성
var app = express();


// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));



//===== 데이터베이스 연결 =====//

var pool=mysql.createPool({
	connectionLimit:10,
	host:'localhost',
	port:'3306',
	user:'root',
	password:'1234',
	database:'bitbit',
	debug:false
});

//라우터 설정
var router=express.Router();

router.route('/mypage/bookmark').post(function(req,res){
	console.log('호출됨');

	//요청 파라미터 확인
	var param=req.body;
	console.dir(param);
	var clientId='a';

	console.log('요청 파라미터'+param);

	if(pool){
		showBookmark(clientId,param,function(err,rows){
			if(err){
				console.error('오류 발생'+err.stack);
				res.writeHead('200',{'Content-Type':'text/html;charset=utf-8'});
				res.write('<h2> 요청 오류</h2>');
				res.write('<p>err.stack</p>');
				res.end();
				return;
			}
			if(rows){
				console.log('요청 확인!');
				var recipeName=rows[0].recipeName;
				var recipeURL=rows[0].recipeURL;
				var recipeImg=rows[0].recipeImg;

				res.writeHead('200',{'Content-Type':'text/html;charset=utf-8'});
				res.write('<h1>전송 성공</h1>');
				res.write('<h1>'+recipeName+'</h1>');
				res.write('<a href="'+recipeURL+'">recipeName</a>');
				res.write('<img src="'+recipeImg+'">');
				res.end();
			}
		});
	}
});

app.use('/',router);

function showBookmark(clientId,recipeObj,callback){
	console.log('showBookmark 호출됨');

	pool.getConnection(function(err,conn){
		if(err){
			if(conn){
				conn.release();
			}
			callback(err,null);
			return;
		}

		var columns=['recipeName','recipeURL','recipeImg'];
		var tablename=['bookmark','recipe'];

		//sql문 실행
		var exec=conn.query('select ?? from ?? where clientId =? and bookmark.recipeId=recipe.recipeId ' +
			'and bookmark.recipeId=?',[columns,tablename,clientId,recipeObj],function(err,result){
			conn.release();
			console.log('sql문 실행'+exec.sql);
			console.log(result);
			if(result.length>0){
				console.log('결과 찾음!!');
				callback(null,result);
			}
			else{
				console.log('찾지 못함');
				callback(err,null);
			}
		});
	});
}

http.createServer(app).listen(app.get('port'),function(){
	console.log('서버 시작!');
});

