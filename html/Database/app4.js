

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

//mongoose 모듈 불러들이기
var mongoose=require('mongoose');

// 익스프레스 객체 생성
var app = express();


// 기본 속성 설정
app.set('port', process.env.PORT || 30013);

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

// 몽고디비 모듈 사용
var MongoClient = require('mongodb').MongoClient;


// 데이터베이스 객체를 위한 변수 선언
var database;

//데이터베이스 스키마 객체를 위한 변수 선언
var UserSchema;

//데이터베이스 모델 객체를 위한 변수 선언
var UserModel;


//데이터베이스에 연결
function connectDB() {
	// 데이터베이스 연결 정보
	var databaseUrl = 'mongodb://localhost:27017/local';

	console.log('데이터베이스 연결을 시도합니다.');
	mongoose.Promise=global.Promise;
	mongoose.connect(databaseUrl);
	database=mongoose.connection;

	database.on('error',console.error.bind(console,'mongoose connection error'));
	database.on('open',function(){
		console.log('데이터베이스에 연결되었습니다.'+databaseUrl);

		//스키마 정의(익덱스 정의)
		UserSchema=mongoose.Schema({
			id:{type:String, required:true, unique:true},
			password:{type:'String', required:true},
			name:{type:String, index:'hashed'},
			age:{type:String, 'default':-1},
			created_at:{type:Date, index:{unique:false},'default':Date.now},
			updated_at:{type:Date, index:{unique:false},'default':Date.now}
		});

		//스키마에 static 메소드 추가
		UserSchema.static('findById',function(id,callback){
			return this.find({id:id},callback);
		});

		//리스트 모두 찾기
		UserSchema.static('findAll',function(callback){
			return this.find({ },callback);
		});

		console.log('USerSchema 정의함');

		//UserModel 모델 정의
		UserModel=mongoose.model('users2',UserSchema);
		console.log('UserModel 정의함');
	});

	//연결 끊어지면 5초후 다시 연결
	database.on('disconnected',function(){
		console.log('연결이 끊어졌습니다. 5초후 다시 연결합니다.');
		setInterval(connectDB,5000);
	});
}


//===== 라우팅 함수 등록 =====//

// 라우터 객체 참조
var router = express.Router();

// 리스트 라우팅 함수 - 데이터베이스의 정보와 비교
router.route('/process/listuser').post(function(req, res) {
	console.log('/process/listuser 호출됨.');

	// 데이터베이스 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
	if (database) {
		//1. 모든 사용자 검색
		UserModel.findAll(function(err,result){
			if(err){
				console.log('사용자 리스트 조회 중 오류 발생'+err);
				res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
				res.write('<h1>오류 발생</h1>');
				res.write('<h2>'+err+'</h2>');
				res.end();

				return;
			}

			if(result){ //결과 객체 있으면 리스트 전송
				console.dir(result);

				res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
				res.write('<h2>사용자 리스트</h2>');
				res.write('<div><ul>');

				for(var i=0;i<result.length;i++){
					var curId=result[i]._doc.id;
					var curName=result[i]._doc.name;
					res.write(' <li># '+i+':'+curId+' ,'+curName+'</li>');
				}
				res.write('</ul></div>');
				res.end();
			}
			else{ //result결과 객체가 없으면 실패 응답 전송
				res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
				res.write('<h2>사용자 조회 실패</h2>');
				res.end();
			}
		})
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
		res.end();
	}

});

// 로그인 라우팅 함수 - 데이터베이스의 정보와 비교
router.route('/process/adduser').post(function(req, res) {
	console.log('/process/adduser 호출됨.');

	// 요청 파라미터 확인
	var paramId=req.body.id||req.query.id;
	var paramPassword=req.body.password||req.query.password;
	var paramName=req.body.name||req.query.name;

	console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword+','+paramName);

	// 데이터베이스 객체가 초기화된 경우, authUser 함수 호출하여 사용자 인증
	if (database) {
		addUser(database,paramId,paramPassword,paramName,function(err,result){
			if(err) throw err;

			if(result&& result.insertedCount>0){
				console.dir(result);

				res.writeHead('200',{'Content-Type':'text/html;charset=utf-8'});
				res.write('<h2>사용자 추가 성공</h2>');
				res.end();
			}else{
				res.writeHead('200',{'Content-Type':'text/html;charset=utf-8'});
				res.write('<h2>사용자 추가 실패</h2>');
				res.end();
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
		res.end();
	}

});

// 라우터 객체 등록
app.use('/', router);


// 사용자를 인증하는 함수
var authUser=function(database,id,password,callback){
	console.log('authUser 호출 됨 :'+id+','+password);

	//1. 아이디를 사용해 검색
	UserModel.findById(id,function(err,result){
		if(err){
			callback(err,null);
			return;
		}
		console.log('아이디 [%s], 비밀번호 [%s]로 사용자 검색',id,password);
		console.dir(result);

		if(result.length>0){
			console.log('일치하는 사용자 찾음',id,password);

			//2. 비밀번호 확인
			if(result[0]._doc.password==password){
				console.log('비밀번호 일치');
				callback(null,result);
			}
			else{
				console.log('비밀번호 일치 하지 않음');
				callback(null,null);
			}
		}
		else{
			console.log('일치하는 사용자를 찾지 못함');
			callback(err,null);
		}
	});
}

//사용자를 추가 하는 함수
var addUser=function(database,id,password,name,callback){
	console.log('addUser 호출 됨:'+id+','+password+','+name);

	//UserModel인스턴스 생성
	var user=new UserModel({'id':id,'password':password,'name':name});
	user.method('show_me',function(){

	})

	//save 저장
	user.save(function(err){
		if(err){
			callback(err,null);
			return;
		}
		console.log('사용자 데이터 추가함');
		callback(null,user);
	});
}


// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
	static: {
		'404': './public/404.html'
	}
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );


// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
	console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

	// 데이터베이스 연결을 위한 함수 호출
	connectDB();

});
