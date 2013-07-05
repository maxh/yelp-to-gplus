Yelp to Google Plus
===================

I really like the new version of Google Maps.  One of my favorite features is that it subtly shows local places I've reviewed.  I like the idea of building a mental model of my environment -- **my** view of San Francisco.

So I decided to port all of my Yelp reviews to Google Plus.  This is a short
script that helped me do it.

It has two main roles:

1. Yelp.com scraper (not sure if that's a violation of TOS, but it's my data anyway).
2. G+ review assistant.

I tried to make #2 fully programmatic, but there are some slight differences between Yelp and G+ so I wanted to manually submit each review into G+.  In particular, Yelp has a generic 5 star review system, whereas G+ breaks out the ratings in "Food," "Decor," "Service," etc.  To make the manual process as easy as possible, the script copies your actual review text to the clipboard so that you don't need select it, etc.

In true hipster fashion, the script is written in node, and you'll need to `npm install` the dependencies listed at the top of the script.