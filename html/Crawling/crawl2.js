var request = require('request'),
	cheerio = require('cheerio');

var url = "http://blog.saltfactory.net/web-scraping-using-with-node-and-phantomjs/";


request(url, function (err, res, html) {
	if (!err) {
		var $ = cheerio.load(html);
		var data='';
		$('.post-content p').each(function(){
			data+=$(this).text();
		})
		console.log(data);
	}
});



