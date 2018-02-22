
//express 모듈 설치
var express=require('express');
//bodyParser 모듈 설치
var bodyParser=require('body-parser');
//database 모듈 설치
var mysql=require('mysql');
//데이터베이스 연결
var client=mysql.createConnection({
	user:'root',
	password:'1234'
});

//데이터베이스 쿼리 사용
client.query('use Company');
client.query('select name from products where id=?',[
	1
],function(error,result,fields){
	console.log(result);
});

//웹 서버를 생성
var app=express();

var items=[ //JSON 형식
	{name:'milk',price:2000},
	{name:'blackTea',price:30453234},
	{name:'Coffee',price:100}
];



app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended:false}));


//-----------------라우트-----------------//
app.all('/data.html', function(request, response) {
	var output = '';
	output += '<!DOCTYPE html>';
	output += '<html>';
	output += '<head>';
	output += ' <title>Data HTML</title>';
	output += '</head>';
	output += '<body>';
	items.forEach(function(item) {
		output += '<div>';
		output += ' <h1>' + item.name + '</h1>';
		output += ' <h2>' + item.price + '</h2>';
		output += '</div>';
	});
	output += '</body>';
	output += '</html>';
	response.send(output);
});

app.all('/data.json',function(request,response){
	response.send(items);
});

app.all('/data.xml', function(request, response){
	var output ='';
	output +='<?xml version ="1.0" encoding ="UTF-8" ?>';
	output +='<products>';
	items.forEach(function(item){
		output+='<product>';
		output +=' <name>'+item.name+'</name>';
		output +='  <price>'+item.price+'</price>';
		output +='</product>'
	});
	output +='</products>';
	response.type('text/xml');
	response.send(output);

});

app.all('/parameter',function(request, response){
	var name = request.body.name;
	var region = request.body.region;
	console.log(name+" "+region);
	response.send('<h1>' + name + ':' + region + '</h1>');
});

//동적라우트
app.all('/parameter/:id', function(request, response){
	var id = request.params.id;

	response.send('<h1>' + id + '</h1>');
});

//--------------------------------------//


//---------RESTful방식------------------//
app.get('/products',function(request,response){
	response.send(items);
});
app.get('/products/:id',function(request,response){
	var id=Number(request.params.id);

	if(isNaN(id)){
		console.log('잘못된 경로');
		response.send({
			error:'숫자를 입력하세요'
		});
	}
	else if(items[id]){
		console.log('정상');
		response.send(items[id]);
	}
	else{
		console.log('요소가 없을 경우');
		response.send({
			error:'존재하지 않는 데이터 입니다.'
		});
	}
});


app.post('/products',function(request,response){
	var name=request.body.name; //post방식이므로 body에 객체를 담아서
	var price=request.body.price;

	var item={
		name:name,
		price:price
	};

	items.push(item); //이전 객체 배열에 추가

	response.send({
		message:'데이터를 추가합니다.',
		data:item
	});
});
app.put('/products/:id',function(request,response){
	var id=Number(request.params.id);
	var name=request.body.name;
	var price=request.body.price;

	if(items[id]){
		if(name)
			{items[id].name=name};
		if(price)
			{items[id].price=price};

		response.send({
			message:'데이터를 수정하였습니다.',
			data:items[id]
		});
	}else{ //요소가 없을 경우
		response.send({
			message:'데이터가 존재 하지 않습니다.'
		});
	}
});
app.delete('/products/:id',function(request,response){
	var id=Number(request.params.id);

	if(isNaN(id)){ //숫자가 아닌경우
		response.send({
			message:'숫자를 입력하세요'
		});
	}else if(items[id]){ //정상적으로 데이터가 있으면
		items.splice(id,1);
		response.send({
			message:'메시지를 삭제하였습니다.'
		});
	}else{
		//요소가 아예 없을 경우
		response.send({
			message:'요소가 존재하지 않습니다.'
		});
	}
});

//-------------------------------------//

//웹 서버를 실행

app.listen(30013,function(){
	console.log('서버가 실행되고 있습니다. at http://127.0.0.1:30013');
})
