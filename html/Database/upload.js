var express=require('express')
	,http=require('http')
	,path=require('path')

var bodyparser=require('body-parser'),
	cookieParser=require('cookie-parser'),
	static=require('serve-static'),
	errorHandler=require('errorhandler');

//오류 핸들러
var expressErrorHandler=require('express-error-handler');

