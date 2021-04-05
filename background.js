chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostEquals: 'www.amazon.co.uk'},
        })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
  });


  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.type == "checkUrl") {
          const url = new URL(sender.tab.url)
          var code = url.searchParams.get("code");
          var state = url.searchParams.get("state");
          if (state == "multi-trakt" && code) {
              sendResponse({code: code});
          }
          
      }
  });
  // https://developer.chrome.com/docs/extensions/mv3/messaging/
