# Trakt Scrobbler

[trakt.tv](https://trakt.tv/) is a site to track what tv and films you watch.

This is a third-party scrobbler that automatically records plays made on amazon - implemented as a Chrome plugin.

I intend to expand this to, at minimum, Disney Plus.

Note that Netflix is already well supported by traktflix, so it does not cover that.

# Getting Started

1) Pull the repo locally.
2) Go to https://trakt.tv/oauth/applications and create a new application. You will need to set the redirect uri to https://www.amazon.co.uk/ and add the cors origin https://www.amazon.co.uk
3) Create a copy of 'config-template.js' and name it 'config.js'. Enter your Client ID and Client Secret there.
4) Open chrome://extensions/ and hit 'Load unpacked', and select this folder. This will locally install the plugin!

# Overview

The two main flows are authorisation and amazon scrobbling, currently.

## Authorisation

If the plugin is not logged in, trying to interact with it will prompt you to login.
This is done by redirecting to the appropriate trakt endpoint which will ask for an OAuth login.

This then redirects back to a page of our choice - which we configured as https://www.amazon.co.uk/. Our plugin runs on that page, so will grab the url parameters and use those to grab a token from trakt that can be used to identify as that user.

## Scrobbling

The basic idea is to do this by grabbing relevant HTML elements and analysing them.
This mostly means working out what is being watched from header elements and what the progress is from the progress bar.