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

addEventListener("unload", function (event) {
    stop (previousState);
}, true);

function stop(state) {
    // Need to store outside the future as the state will change
    const media = state.media;
    const percent = state.percent;

    previousState.finished = true;
    chrome.storage.local.set({'state': previousState});
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
                previousState.finished = true;
                previousState.playing = false;
                chrome.storage.local.set({'state': finishedState});
            // It will 409 on attempts to scrobble one thing twice in an hour or so window - still display as finished
            } else if(response.alreadyScrobbled) {
                previousState.finished = true;
                previousState.playing = false;
                console.log("ALREAYD SCROBBLED")
                chrome.storage.local.set({'state': finishedState});
            } else {
                previousState.finished = false;
                previousState.playing = false;
            }
        });
    });
}

function update() {
    // We track this or else when you exit the active player it will then log a play and a pause as the progress bar is reset
    const playerOpen = isPlayerOpen();
    const media = checkMedia();
    const percent = checkProgress(); 
    var playing = true;

    // If the media has changed (including to null)
    if (previousState.media != null && !previousState.media.equals(media)) {
        stop(previousState);
    } else if(playerOpen) {
        if (media != null && previousState.percent != null) {
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
            previousState.finished = false;
        }

        previousState.media = media;
        previousState.percent = percent;
        
        chrome.storage.local.set({'state': previousState}, function() {
            console.log('Stored state: ');
            console.log(previousState);
        });
    }
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

function isPlayerOpen() {
    // This is the element that contains the player
    let player = document.getElementById("dv-web-player");
    // If you are on a watch page but not in the player itself, it will be hidden by missing the following class
    if (player != undefined && player.className == 'dv-player-fullscreen') {
        return true;
    }
    return false;
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
