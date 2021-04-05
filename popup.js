let changeColor = document.getElementById('changeColor');
let progress = document.getElementById('status_text');
let logout_button = document.getElementById('logout_button');

let init_section = document.getElementById('init_section');

let login_section = document.getElementById('login_section');
let login_button = document.getElementById('login_button');

let status_section = document.getElementById('status_section');


init_section.style.display = "block";
login_section.style.display = "none";
status_section.style.display = "none";

chrome.storage.sync.get(['token'], function(data) {
  if (!data.token) {
    login_section.style.display = "block";
  } else {
    status_section.style.display = "block";
    progress.innerHTML = "";
    
    // This is update more frequently and does not really need to be cross-device, so just use local not sync
    chrome.storage.local.get(['state'], function(data) {
      console.log("Render state");
      console.log(data.state);
      if (data.state) {
        const playing = data.state.finished ? "Finished" : (data.state.playing ? "Playing" : "Paused");
        const percent = Math.floor(data.state.percent);
        const media = describeMedia(data.state.media);

        progress.innerHTML = `${playing} ${media} (${percent}%)`
      }
    });
  }
  init_section.style.display = "none";
});

login_button.onclick = function(element) {
  login()
}

logout_button.onclick = function(element) {
  logout()
}

const login = function() {
  const redirectUrl = "https://www.amazon.co.uk/"
  const url = `https://trakt.tv/oauth/authorize?client_id=${apiKey}&redirect_uri=${redirectUrl}&response_type=code&state=multi-trakt`
  chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
      chrome.tabs.update(tab.id, {url: url});
  });
  
}

const logout = function() {
  chrome.storage.sync.remove('token');
  
}

const describeMedia = function(media) {
  if (media.movie) {
      return media.title;
  } else {
      return media.title + " S" + media.season + "E" + media.episode;
  }
}

//chrome.storage.sync.get('progress', function(data) {
//    progress.innerHTML = data.progress;
//});

/*
changeColor.onclick = function(element) {
    let color = element.target.value;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(
          tabs[0].id,
          {code: 'document.body.style.backgroundColor = "' + color + '";'});
    });
  };
  */