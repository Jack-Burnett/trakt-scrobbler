const getToken = async (code) => {
    const address = `https://api.trakt.tv/oauth/token`
    const response = await fetch(address,
    {
        method: 'POST',
        body: JSON.stringify({
            "code": code,
            "client_id": apiKey,
            "client_secret": apiSecret,
            "redirect_uri": "https://www.amazon.co.uk/",
            "grant_type": "authorization_code"
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    console.log(response)
    const myJson = await response.json(); //extract JSON from the http response
    console.log(myJson)
    return myJson
}   

const getMedia = async (name, isFilm) => {
    const query = "\"" + name + "\""
    const type = isFilm ? "movie" : "show"
    const address = `https://api.trakt.tv/search/${type}?query=${query}&field=title`
    const response = await fetch(address,
    {
        method: 'GET',
        //body: myBody, // string or object
        headers: {
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': apiKey
        }
    });
    const myJson = await response.json(); //extract JSON from the http response
    console.log("GET MEDIA RESPONSE");
    console.log(myJson);
    if (isFilm) {
        return myJson[0].movie
    } else {
        return myJson[0].show
    }
}

const getEpisode = async(trakt_id, series, episode) => {
    const response = await fetch(`https://api.trakt.tv/shows/${trakt_id}/seasons/${series}/episodes/${episode}`,
    {
        method: 'GET',
        //body: myBody, // string or object
        headers: {
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': apiKey
        }
    });
    const myJson = await response.json(); //extract JSON from the http response
    return myJson
}

const States = {
    STOP: "stop",
    START: "start",
    PAUSE: "pause"
}

const scrobble = async(media, isMovie, state, percent, token) => {
    if (true) {
        console.log(state);
        console.log(media);
        return;
    }
    var body = {
        "progress": percent,
        //"app_version": "1.0",
        //"app_date": "2014-09-22"
    }
    if (isMovie) {
        body["movie"] = media;
    } else {
        body["episode"] = media;
    }

    const response = await fetch(`https://api.trakt.tv/scrobble/${state}`,
    {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': apiKey
        }
    });
    const myJson = await response.json(); //extract JSON from the http response
    return myJson
}

const doLookup = async(name, isFilm, series, episode) => {
    const media_promise = getMedia(name, isFilm)
    if (series && episode) {
        return media_promise.then(async show => {
            const media_id = show.ids.slug
            const episode = await getEpisode(media_id, 2, 13)
            return episode
        })
    } else {
        return media_promise
    }
}
