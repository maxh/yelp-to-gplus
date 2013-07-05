Yelp to Google Plus
===================

I really like the new version of Google Maps.  One of my favorite features is that subtly shows the local places I've reviewed before.  I like the idea of building a mental model of my environment and **my** view of San Francisco.

So I decided to port all of my Yelp reviews to Google Plus.  This is a short
script that helped me do it.

It has two main functions:

1) Yelp.com scraper (not sure if that a violation of TOS, but it's my data anyway).
2) G+ review assistant.

I tried to make #2 fully programmatic, but there are some slight differences between Yelp and G+ so I wanted to manually submit each review into G+.  In particular, Yelp has a generic 5 star review system, whereas G+ breaks out the ratings in "Food," "Decor," "Service," etc.  To make the manual process as easy as possible, the script copies your actual review text to the clipboard so that you don't need select it, etc.