var request, $, fs;  // Packages.
request = require('request');
$ = require('cheerio');
fs = require('fs');

var domain, username, reviews;  // Global variables.
domain = 'yelp.com';
username = 'maxheinritz';
reviews = [];

callback = function (error, response, body) {
    if (error || response.statusCode != 200) {
	return console.log(error);
    }
    var parsedHTML, nextPath; // Hoist variables.
    parsedHTML = $.load(body);
    // The review text and metadata are within divs with this class.
    parsedHTML('.review.clearfix').map(function(i, rawDiv) {
	// For each review, create an associated Review JS object.
	reviews.push(new Review(rawDiv));
    });
    
    // Find the link to the next page of reviews./
    nextPath = parsedHTML(
	'#user_reviews_list p .ybtn.ybtn-secondary.ybtn-small')
	.first().attr('href');
    if (!nextPath)
	nextPath = parsedHTML('#pager_page_next').first().attr('href');
    if (!nextPath) // No next page, stop crawling.
	return;
    // Request the next page of reviews.
    sendReviewPageRequest('http://' + domain + nextPath);
    console.log(reviews);
}

sendReviewPageRequest = function (URL) {
    var stdin = process.stdin, stdout = process.stdout;
    
    stdin.resume();
    stdout.write('Now sending request to: ' + URL + "\n");
    stdout.write('OK? (y/n) > ');

    stdin.once('data', function(data) {
	data = data.toString().trim();
	if (data == 'y') {
	    request(URL, callback);
	}
    });
}

// JavaScript object representing a review and its metadata.
function Review (rawDiv) {
    this.businessAddress = clean($(rawDiv).find('.biz_info address').html());
    this.businessName = clean($(rawDiv).find('.biz_info h4 a').html());;
    this.rating = clean($(rawDiv).find(
	'.review-meta .rating-container .rating i').attr('title')[0]);
    this.reviewText = clean($(rawDiv).find('.review_comment').html());
}

function clean (inputString) {
    return inputString.replace(/<br>/g,' ').replace(/(\n|\t|<.*?>| $)/g,'');
}

sendReviewPageRequest('http://' + username + '.' + domain);

// TODO: Search G+ Local for restaurant ID, programmatically write review.
