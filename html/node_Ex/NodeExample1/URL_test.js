var url=require('url');
var querystring=require('querystring');

var curURL=url.parse('https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=1&ie=utf8&query=%EB%82%A0%EC%94%A8');

var curStr=url.format(curURL);

var param=querystring.parse(curURL.query);

console.log('현재 주소 문자열 %s',curStr);
console.log('요청 파라미터 중 query value %s',param.query);
console.log('원본 요청 파라미터 %s',querystring.stringify(param));