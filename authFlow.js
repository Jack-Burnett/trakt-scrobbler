message = {
    "type": "checkUrl"
}

console.log("Running auth flow")

chrome.runtime.sendMessage(message, function(response) {
    console.log(response.code)
    getToken(response.code).then(
        res => {
            chrome.storage.sync.set({token: res.access_token}, function() {
                console.log('Stored token: ' + res.access_token);
            });
        }
    )
});