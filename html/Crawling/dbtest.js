/**
 * @date 2017-11-24
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
	host:'bitbit.crs5c29tqcjd.ap-northeast-2.rds.amazonaws.com',
	port:'3306',
	user:'bit01',
	password:'1q2w3e4r!',
	database:'bitbit',
	debug:false
});


//===== 라우팅 함수 등록 =====//

//라우터 객체 참조
var router = express.Router();

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
var ss='';

var db=function(idNum,url,parameter){
	// url is the web address to import, parameter is the query value
	client.fetch(url,parameter,function(err,$,res,body){

		// Search for <a> tags within <storng class = title> in <div class = 'subject'>
		var aList=$('p.tit').find('a.stit');
		console.log($(aList[0]).find('b').first().text()); // output the first tag of them
		console.log($(aList[0]).attr('href')); // Output the url of the first tag
		var search_url=$(aList[0]).attr('href');
		//썸네일 이미지 가져오기
		var imgList=$('dt.thumImg').find('a').find('img');
		var resultImg=$(imgList[0]).attr('src');
		var recipeName=$(aList[0]).find('b').first().text();
		var userId='admin2@amin.com';
		var likeCount=0;
		var searchTest=$(imgList[0]).attr('src');
		ss=searchTest;

		//간단 설명 가져오기
		var summary=$(aList[0]).html();
		scrapContent(search_url,function(content,resultImg){
			var JString={'recipeId': idNum, 'recipeName': recipeName, 'recipeUrl': search_url,
				'recipeImg':resultImg,'recipeText':summary,'userId':userId,
				'likeCount':likeCount,'recipeContent':content};

			//getIngredient(recipeName,text);
			//pool 객체가 초기화 된 경우, insertRecipe 함수 호춣하여 재료 추가
			if(pool) {
				// insertRecipe(JString.recipeId,JString.recipeName, JString.recipeUrl,JString.recipeImg,
				// 	JString.recipeText,JString.userId,JString.likeCount,JString.recipeContent,
				// 	function(err,inserted){
				//
				// 		//오류면
				// 		if(err){
				// 			console.log('사용자 추가 중 오류 발생');
				// 			return;
				// 		}
				// 		//객체 결과가 있으면 성공 응답 전송
				// 		if(inserted){
				// 			console.log('추가 성공');
				// 		}
				// 		else{
				// 			console.log('추가 실패');
				// 		}
				// 	});
			}
			else{ //데이터베이스가 초기화 도지 않은 경우 실패 응답
				console.log('데이터 베이스 연결 실패');
			}

		});
	});
}


//검색한 url 내용 스크랩 하기
var scrapContent=function(url,callback){
	client.fetch(url,function(err,$,body){

		var content=$('div.body_center').find('.recipe_top_main').find('.tx-content-container')
			.find('table');
		console.log($(content[0]).html());

		var realContent=$(content[0]).html();

		//대표사진 가져오기
		var primaryImg=$(realContent).find('img').attr('src');
		console.log('대표사진 : '+primaryImg);

		//재료 설명 가져오기
		var ingredient=$('dd.stuff').first().text();
		callback(realContent,primaryImg);

		console.log('서치서치서치'+ss);
	});
}





//레서피 삽입 함수
var insertRecipe=function(recipeId,recipeName,recipeUrl,recipeImg,recipeText,userId,likeCount,recipeContent
                          ,callback) {
	console.log(recipeName+'확인');

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
		var data = {recipeId:recipeId,recipeName:recipeName,recipeURL:recipeUrl,recipeImg:recipeImg,
		recipeText:recipeText,userId:'admin2@admin.com',likeCount:0,recipeContent:recipeContent};

		//sql문 실행
		var exec = conn.query('insert into recipe set ?', data, function(err, result) {

		 	conn.release();
		 	console.log('실행 대상 SQL : ' + exec.sql);

		 	if (err) {
		 		console.log('SQL 실행 시 오류 발생함');
		 		console.log(err);
		 		callback(err, null);
				return;
			}
			console.log(result);
		 	callback(null, result);
		 });

		// pool.connect(function(err){
		// 	if(err) throw err;
		// 	console.log('connected');
		// 	var sql='insert into recipe(recipeId,recipeName,recipeURL) values('
		// })
	});
}

var recipeList=[
	'달걀밥',
	'비빔밥',
	'볶음밥',
	'주먹밥',
	'카레볶음밥',
	'팥죽',
	'호박죽',
	'계란국',
	'김치찌개',
	'떡국',
	'무국',
	'몸국',
	'미역국',
	'부대찌개',
	'사골',
	'쇠고깃국',
	'시래기국',
	'아욱국',
	'홍합탕',
	'떡볶이',
	'라면',
	'돈가스',
	'샤브샤브',
	'야키소바',
	'야키우동',
	'유부초밥',
	'카레라이스',
	'타코야키',
	'하이라이스',
	'갈비찜',
	'계란후라이',
	'꽁치조림',
	'달걀말이',
	'닭가슴살 볶음',
	'참치 동그랑땡',
	'낙지볶음',
	'닭강정',
	'닭볶음탕',
	'돼지불고기',
	'수육',
	'오징어볶음',
	'장조림',
	'비빔국수',
	'냉면',
	'잔치국수',
	'동치미',
	'잡채',
	'설렁탕',
	'갈비탕',
	'까르보나라',
	'샤브샤브',
	'월날쌈',
	'곰탕',
	'냉면'
]
var idNum=1;
//web crwaling 함수 호출!
// for(var keyword of recipeList) {
	db(idNum,'http://cook.miznet.daum.net/search.do', {q: '샤브샤브'});
	idNum++;
// }

// //pool 객체가 초기화 된 경우, insertRecipe 함수 호춣하여 재료 추가
// 	if(pool) {
// 		insertRecipe(JString.recipeId,JString.recipeName, JString.recipeUrl,function(err,inserted){
//
// 			//오류면
// 			if(err){
// 				console.log('사용자 추가 충 오류 발생');
// 				return;
// 			}
// 			//객체 결과가 있으면 성공 응답 전송
// 			if(inserted){
// 				console.log(inserted);
//
// 				var recipeId=result.recipeId;
// 				console.log('추가한 레코드의 아이디:'+recipeId);
// 			}
// 			else{
// 				console.log('추가 실패');
// 			}
// 		});
// 	}
// 	else{ //데이터베이스가 초기화 도지 않은 경우 실패 응답
// 		console.log('데이터 베이스 연결 실패');
// 	}



// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
	console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));
	// 데이터베이스 연결을 위한 함수 호출
});
