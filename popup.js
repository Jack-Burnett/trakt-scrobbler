let changeColor = document.getElementById('changeColor');
let progress = document.getElementById('progress');
let logout = document.getElementById('logout');

let init_section = document.getElementById('init_section');

let login_section = document.getElementById('login_section');
let login_button = document.getElementById('login_button');

let status_section = document.getElementById('status_section');


init_section.style.display = "block";
login_section.style.display = "none";
status_section.style.display = "none";

chrome.storage.sync.get('token', function(data) {
  if (!data.token) {
    login_section.style.display = "block";
  } else {
    status_section.style.display = "block";
    progress.innerHTML = data.token;
  }
  // changeColor.setAttribute('value', data.color);
  init_section.style.display = "none";
});

login_button.onclick = function(element) {
  login()
}

const login = function() {
  const redirectUrl = "https://www.amazon.co.uk/"
  const url = `https://trakt.tv/oauth/authorize?client_id=${apiKey}&redirect_uri=${redirectUrl}&response_type=code&state=multi-trakt`
  chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
      chrome.tabs.update(tab.id, {url: url});
  });
  
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