var request = require('request');
var $ = require('cheerio');

var options = {
    uri: 'http://maxheinritz.yelp.com',
};

callback = function (error, response, body) {
    if (error || response.statusCode != 200) {
	return console.log(error);
    }
    var parsedHTML, reviews;
    parsedHTML = $.load(body);
    reviews = [];
    parsedHTML('.review.clearfix').map(function(i, rawDiv) {
	var review = {};
	review.businessAddress = clean($(rawDiv).find('.biz_info address').html());
	review.businessName = clean($(rawDiv).find('.biz_info h4 a').html());;
	review.rating = clean($(rawDiv).find('.review-meta .rating-container .rating i').attr('title')[0]);
	review.reviewText = clean($(rawDiv).find('.review_comment').html());
	reviews.push(review);
    });

    // TODO: Retrieve the next page in the paginated list of reviews.

    console.log(reviews);
}

function clean (inputString) {
    return inputString.replace(/<br>/g,' ')
	.replace(/(\n|\t|<.*?>| $)/g,'');
}

console.log('sending request');

request(options, callback);

// TODO: Search G+ Local for restaurant ID, programmatically write review.
