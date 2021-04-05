// Could maybe listen for updates with https://developer.chrome.com/docs/extensions/reference/storage/#examples
var token = null;
chrome.storage.sync.get('token', function(data) {
    if (data.token) {
        token = data.token;
        const interval = setInterval(update, 1000);
    }
});

// Map of media to promise of trakt media object
const medias = new Map();

async function lookupMedia(media) {
    if (!medias.has(media.hash)) {
        const traktMedia = doLookup(media.title, media.movie, media.season, media.episode)
        medias.set(media.hash, traktMedia);
    }
    return await medias.get(media.hash);
}


const previousState = {
    media: null,
    percent: null,
    playing: false,
    finished: false
};

function stop(state) {
    // Need to store outside the future as the state will change
    const media = state.media;
    const percent = state.percent;
    lookupMedia(state.media).then(mediaObject => {
        scrobble(mediaObject, media.movie, States.STOP, percent, token).then(response => {
            const finishedState = {
                media: media,
                percent: percent,
                playing: false,
                finished: true
            }
            // Only stops at 80% or more should return as scrobbles
            if (response.action == "scrobble") {
                chrome.storage.sync.set({state: finishedState});
            // It will 409 on attempts to scrobble one thing twice in an hour or so window - still display as finished
            } else if(response.alreadyScrobbled) {
                console.log("ALREAYD SCROBBLED")
                chrome.storage.sync.set({state: finishedState});
            }
        });
    });
}

function update() {
    const media = checkMedia();
    const percent = checkProgress(); 
    var playing = true;

    // If the media has changed (including to null)
    if (previousState.media != null && !previousState.media.equals(media)) {
        stop(previousState);
    } else if (media != null && previousState.percent != null) {
        var playing = true;
        if (percent === previousState.percent) {
            playing = false;
        }
        
        // console.log ("percents: " + previousState.percent + "   " + percent);

        if (!previousState.playing && playing) {
            lookupMedia(media).then(mediaObject => {
                scrobble(mediaObject, media.movie, States.START, percent, token);
            });
        }
        if (previousState.playing && !playing) {
            lookupMedia(media).then(mediaObject => {
                scrobble(mediaObject, media.movie, States.PAUSE, percent, token);
            });
        }
        previousState.playing = playing;
    }

    previousState.media = media;
    previousState.percent = percent;
    
    chrome.storage.sync.set({state: previousState});
}

function checkProgress() {
    const bar = getProgressBar();
    if (bar == null) {
        return null;
    }
    const min = bar.getAttribute("min")
    const max = bar.getAttribute("max")
    const value = bar.getAttribute("value")
    
    // Normalise between 0 and 100 (this is not really neccesary in practice)
    const percent = remap(value, {bottom: min, top: max}, {bottom: 0, top: 100})
    return percent;
}

function remap(old_value, old_range, new_range) {
    const new_value = (old_value - old_range.bottom) / (old_range.top - old_range.bottom) * (new_range.top - new_range.bottom) + new_range.bottom;
    return new_value;
}

function getProgressBar() {
    
    let inputs = document.getElementsByTagName("input")
    for (var i = 0; i < inputs.length; i++) {
        
        if (inputs[i].getAttribute("aria-label") == "Seek") {
            return inputs[i];
        }

    }
}

class Media {
    constructor(movie, title, season, episode) {
        this.movie = movie;
        this.title = title;
        this.season = season;
        this.episode = episode;
        this.hash = movie + title + season + ":" + episode;
    }
    equals(other) {
        if (other == null) {
            return false;
        }
        return other.movie == this.movie &&
            other.title == this.title &&
            other.season == this.season &&
            other.episode == this.episode;
    };
}

function checkMedia() {
    //The Season X, ep. X structure is consistent!
    //For a film the subtitle exists but is blank
    let h1 = document.getElementsByClassName("atvwebplayersdk-title-text")[0]
    let h2 = document.getElementsByClassName("atvwebplayersdk-subtitle-text")[0]
    if (h1 == null || h1.innerHTML === "") {
        return null;
    }
    const title = h1.innerHTML;
    if (h2 == null || h2.innerHTML === "") {
        return new Media(true, title);
    }
    const regex = /Season (\d+), Ep. (\d+)/;
    var match = regex.exec(h2.innerHTML);
    if (match !== null) {
        const season = match[1];
        const episode = match[2];
        return new Media(false, title, season, episode);
    } else {
        console.error("Fatal, could not scrape episode");
        return null;
    }
}
