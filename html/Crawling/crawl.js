var client=require('cheerio-httpcli');

var search_url='';
var databaseJson=new Array();

var printHttpResponse=function(url,parameter){
	//url은 가져올 웹 상 주소, parameter는 쿼리 값
	client.fetch(url,parameter,function(err,$,res,body){

		//<div class='subject'> 내의 <storng class=title>내의 <a>태그 검색
		var aList=$('div.subject').find('strong.title').find('a');
		console.log('제목'+$(aList[0]).text()); //그 중 첫번째 태그 출력
		console.log('http://terms.naver.com/'+$(aList[0]).attr('href')); //첫번째 태그의 url 출력
		search_url='http://terms.naver.com/'+$(aList[0]).attr('href');
		databaseJson.push(search_url);

		console.log('JSON으로 만들기'+JSON.stringify({'recipeName':$(aList[0]).text(),'url':search_url}));
		//검색한 레서피의 사진을 가져오기

		printSearchhttpResponse(search_url);
	});
}

//검색한 url 내용 스크랩 하기
var printSearchhttpResponse=function(url){
	console.log('printSearchHttpResonese 실행!!!!')
	client.fetch(url,function(err,$,body){
		//대표사진 가져오기
		var img=$('div.thmb').find('.img_box').find('a').find('img');
		console.log('대표사진 : '+$(img[0]).attr('origin_src'));

		//재료 설명 가져오기
		var ingredient=$('p.txt').text();
		console.log('재료설명 : '+ingredient);
	})
}

var selectRecipename=function(url){
	client.fetch(url,function(err,$,body){
		var reciptename=$('div.subject').find('.title').find('a');
		for(var i=0;i<reciptename.length;i++){
			console.log($(reciptename[i]).text());
		}
	});
}

//selectRecipename('http://terms.naver.com/list.nhn?cid=48156&categoryId=48156');


//검색어 리스트. 굳이 이렇게 배열로 줄 필요는 없음
var tastyList=[
	//'섹스 온 더 비치'
	'동치미',
	'시금치무침 만드는 법'
	// '알타리김치 만드는 법',
	// '코다리조림 만드는 법',
	// '메추리알장조림 만드는 법',
	// '돼지고기 김치찌개 만드는 법',
	// '굴국 만드는 법',
	// '백김치',
	// '돼지고기장조림',
	// '참치김치찌개 만드는 법',
	// '돼지고기 두루치기 만드는 법',
	// '돼지고기고추장불고기 만드는 법',
	// '유자청 만드는 법',
	// '묵은지김치찜 만드는 법',
	// '무'
]


for(var keyword of tastyList){
	printHttpResponse('http://terms.naver.com/search.nhn',{query:keyword});
}

