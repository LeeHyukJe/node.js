/**
 * 데이터베이스 사용하기
 *
 * 몽고디비에 연결하고 클라이언트에서 로그인할 때 데이터베이스 연결하도록 만들기

 * 웹브라우저에서 아래 주소의 페이지를 열고 웹페이지에서 요청
 *    http://localhost:3000/public/login.html
 *
 * @date 2016-11-10
 * @author Mike
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
	user:'root',
	password:'1234',
	database:'bitbit',
	debug:false
});


//===== 라우팅 함수 등록 =====//

// 라우터 객체 참조
//var router = express.Router();

// 로그인 라우팅 함수 - 데이터베이스의 정보와 비교
// router.route('/process/login').post(function(req, res) {
// 	console.log('/process/login 호출됨.');
//
// 	// 요청 파라미터 확인
// 	var paramId=req.param('id');
// 	var paramPassword=req.param('password');
//
// 	console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword);
//
// 	// 데이터베이스 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
// 	if (database) {
// 		authUser(database, paramId, paramPassword, function(err, docs) {
// 			if (err) {throw err;}
//
// 			// 조회된 레코드가 있으면 성공 응답 전송
// 			if (docs) {
// 				console.dir(docs);
//
// 				// 조회 결과에서 사용자 이름 확인
// 				var username = docs[0].name;
//
// 				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
// 				res.write('<h1>로그인 성공</h1>');
// 				res.write('<div><p>사용자 아이디 : ' + paramId + '</p></div>');
// 				res.write('<div><p>사용자 이름 : ' + username + '</p></div>');
// 				res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
// 				res.end();
//
// 			} else {  // 조회된 레코드가 없는 경우 실패 응답 전송
// 				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
// 				res.write('<h1>로그인  실패</h1>');
// 				res.write('<div><p>아이디와 패스워드를 다시 확인하십시오.</p></div>');
// 				res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
// 				res.end();
// 			}
// 		});
// 	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
// 		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
// 		res.write('<h2>데이터베이스 연결 실패</h2>');
// 		res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
// 		res.end();
// 	}
//
// });
//
// // 라우터 객체 등록
// app.use('/', router);


//웹 스크래핑

var search_url=''; //global variable
var JString='';//global variable

var db=function(idNum,url,parameter,func){
	// url is the web address to import, parameter is the query value
	client.fetch(url,parameter,function(err,$,res,body){

		// Search for <a> tags within <storng class = title> in <div class = 'subject'>
		var aList=$('div.subject').find('strong.title').find('a');
		console.log($(aList[0]).text()); // output the first tag of them
		console.log('http://terms.naver.com/'+$(aList[0]).attr('href')); // Output the url of the first tag
		search_url='http://terms.naver.com/'+$(aList[0]).attr('href');

		//이미지 가져오기
		var imgList=$('div.thumb_area').find('.thumb').find('a').find('img');
		var resultImg=$(imgList[0]).attr('data-src');

		JString={'recipeId': idNum, 'recipeName': $(aList[0]).text(), 'recipeUrl': search_url};
		func(JString,resultImg);
	});
	console.log('함수 호출 직후'+JString.recipeId);
}


// //검색한 url 내용 스크랩 하기
// var scrapContent=function(url){
// 	client.fetch(url,function(err,$,body){
// 		//대표사진 가져오기
// 		var img=$('div.thmb').find('.img_box').find('a').find('img');
// 		console.log('대표사진 : '+$(img[0]).attr('origin_src'));
//
// 		//재료 설명 가져오기
// 		var ingredient=$('p.txt').text();
// 		console.log('재료설명 : '+ingredient);
//
// 		return $(img[0]).attr('origin_src');
// 	})
// }


//재료를 확인하는 함수
var insertRecipe=function(recipeId,recipeName,recipeUrl,recipeImg,callback) {
	console.log('insertRecipe 등록됨');

	//커넥셜 풀에서 연결 객체 가져옴
	pool.getConnection(function (err, conn) {
		if (err) {
			if (conn) {
				conn.release();
			}

			callback(err, null);
			return;
		}

		console.log('데이터베이스 연결 스레드 아이디' + conn.threadId);

		//데이터 객체화
		var data = {recipeId:recipeId,recipeName: recipeName, recipeURL: recipeUrl,recipeImg:recipeImg};

		//sql문 실행
		var exec = conn.query('insert into recipe set ? ',data, function (err, result) {
			conn.release();
			console.log('실행 대상 SQL : ' + exec.sql);

			if (err) {
				console.log('SQL 실행 시 오류 발생함');
				console.dir(err);
				callback(err, null);
				return;
			}

			callback(null, result);
		});
	});
}

var recipeList=[
	'떡 만둣국',
	'갓김치',
	'총각김치',
	'동치미',
	'알리오올리오',
	'리소토'
]

//web crwaling 함수 호출!
for(var keyword of recipeList) {
	db(1,'http://terms.naver.com/search.nhn', {query: keyword}, function (res) {
		JString = res;
	});
}

//pool 객체가 초기화 된 경우, insertRecipe 함수 호춣하여 재료 추가
if (pool) {
	insertRecipe(idNum, JString.recipeName, JString.recipeUrl, function (err, inserted) {

		//오류면
		if (err) {
			console.log('사용자 추가 충 오류 발생');
			return;
		}
		//객체 결과가 있으면 성공 응답 전송
		if (inserted) {
			console.log(inserted);

			var recipeId = inserted.recipeId;
			console.log('추가한 레코드의 아이디:' + recipeId);
			idNum++;
		}
		else {
			console.log('추가 실패');
		}
	});
}
else { //데이터베이스가 초기화 도지 않은 경우 실패 응답
	console.log('데이터 베이스 연결 실패');
}


// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
	console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

	// 데이터베이스 연결을 위한 함수 호출

});
