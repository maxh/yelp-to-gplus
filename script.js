var $ = require('cheerio');
var cp = require('child_process');
var fs = require('fs');
var open = require('open');
var request = require('request');

var stdin = process.stdin, stdout = process.stdout;


// Crawls {username}'s Yelp reviews, saves them in JSON in $PWD/{OUTFILE}.
function scrapeReviewsFromYelp() {
  var DOMAIN = 'yelp.com';
  var OUTFILE = 'reviews.out';

  var reviews = [];

  // JavaScript class representing a review and its metadata.
  function ScrapedReview(rawDiv) {
    this.businessAddress = clean($(rawDiv).find('.biz_info address').html());
    this.businessName = clean($(rawDiv).find('.biz_info h4 a').html());;
    this.rating = clean($(rawDiv).find(
                        '.review-meta .rating-container .rating i')
                        .attr('title')[0]);
    this.reviewText = clean($(rawDiv).find('.review_comment').html());
  }

  // Helper function to clean crawled HTML.
  function clean(inputString) {
    return inputString.replace(/<br>/g,' \n ').replace(/(\n|\t|<.*?>)/g,'').trim();
  }

  // Callback called when response from Yelp is received.
  callback = function (error, response, body) {
    if (error || response.statusCode != 200)
      return console.log(error);
    var parsedHTML = $.load(body);
    
    // The review text and metadata are within divs with this class.
    parsedHTML('.review.clearfix').map(function (i, rawDiv) {
      // For each review, create an associated ScrapedReview JS object.
      reviews.push(new ScrapedReview(rawDiv));
    });
    console.log('== We now have ' + reviews.length + ' reviews!');

    // Find the link to the next page of reviews.
    var nextPath = parsedHTML('#user_reviews_list p .ybtn.ybtn-secondary.ybtn-small')
      .first().attr('href');
    if (!nextPath)
      nextPath = parsedHTML('#pager_page_next').first().attr('href');

    if (nextPath) {
      // Request the next page of reviews.
      promptUserToSendReviewPageRequest('http://' + DOMAIN + nextPath);
    }
    else { // No next page, stop crawling.
      console.log('== All reviews scraped!');
      fs.writeFileSync(OUTFILE, JSON.stringify(reviews), {encoding: 'utf8'});
      promptForGoogle(); // Weird place to move to next part of execution...
    }
  }

  // Sends a request to Yelp, with the user's permission.
  promptUserToSendReviewPageRequest = function (URL) {
    stdin.resume();
    stdout.write('== Now sending request to: ' + URL + '\n');
    stdout.write('== OK? (y/n/q) > ');

    stdin.once('data', function(data) {
      stdin.pause();
      data = data.toString().trim();
      if (data == 'y') {
        request(URL, callback);
      }
      else if (data == 'q') {
        promptForGoogle(); // Weird place to move to next part of execution...
      }
      else {
        console.log('== Data so far:');
        console.log(reviews);
        sendReviewPageRequest(URL);
      }
    });
  }

  // Send the first request.
  stdin.resume();
  stdout.write('== What is your Yelp username? > ');
  stdin.once('data', function(username) {
    stdin.pause();
    username = username.toString().trim();
    promptUserToSendReviewPageRequest('http://' + username + '.' + DOMAIN);
  });
}

// Opens the G+ Local page for each review and prompts the user to manually 
// enter their review through the web interface.
function addReviewstoGooglePlus(startIndex) {
  var INFILE = 'reviews.out';
  var URL = 'http://plus.google.com/local/';
  var reviews;

  reviews = JSON.parse(fs.readFileSync(INFILE, 'utf-8'));

  function loadGooglePlusPageForAction(i) {
    if (i == reviews.length)
      return;

    cp.exec('pbcopy << EOF\n' + reviews[i].reviewText + '\nEOF',
      function(err, sout, serr) {
        stdin.resume();
        console.log('== Please paste the review for ' + reviews[i].businessName + 
                    ' in your browser.');
        console.log('Rating: ' + reviews[i].rating);
        console.log('Review (copied to clipboard): ' + reviews[i].reviewText);
        console.log('Only ' + (reviews.length - i) + ' reviews left!');
        stdout.write('== Press enter when done. > ');
        open(URL + reviews[i].businessAddress + '/s/' + reviews[i].businessName);
        stdin.once('data', function (data) {
          stdin.pause();
          loadGooglePlusPageForAction(i+1);
          // No unoptimized tail recursion problem here because the original call to 
          // loadGooglePlusPageForAction(i) was removed from memory when its synchr-
          // onous part finished. (At least, I think that's the case.)
        });
      }
    );
  }

  loadGooglePlusPageForAction(startIndex || 0);
}

function promptForYelp() {
  stdin.resume();
  stdout.write('== Would you like to scrape Yelp? (y/n) > ');
  stdin.once('data', function(data) {
    stdin.pause();
    data = data.toString().trim();
    if (data == 'y') {
      scrapeReviewsFromYelp(); // Async, so instead of returning, it calls
                               // promptForGoogle() inside its code.
    }
    else {
      promptForGoogle();
    }
  });
}

function promptForGoogle() {
  stdin.resume();
  stdout.write('== Would you like to add reviews G+? (y/n) > ');
  stdin.once('data', function(data) {
    stdin.pause();
    data = data.toString().trim();
    if (data == 'y') {
      stdin.resume();
      stdout.write('== Would you like to start at a specific review ' + 
                   'number (default=0)? > ');
      stdin.once('data', function(data) {
        stdin.pause();
        data = data.toString().trim();
        addReviewstoGooglePlus(parseInt(data));
      });
    }
  });
}

promptForYelp();