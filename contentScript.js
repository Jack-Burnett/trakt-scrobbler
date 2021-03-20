console.log("YO YO YO")

const interval = setInterval(function() {
    let inputs = document.getElementsByTagName("input")
    
    for (var i = 0; i < inputs.length; i++) {
        
        if (inputs[i].getAttribute("aria-label") == "Seek") {
            var min = inputs[i].getAttribute("min")
            var max = inputs[i].getAttribute("max")
            var value = inputs[i].getAttribute("value")
            chrome.storage.sync.set({progress: value}, function() {
                console.log(min + " " + max + " " + value);
            })
        }

    }
  }, 5000);


  <h1 class="_2IIDsE _3I-nQy" data-automation-id="title">Futurama</h1>

  <h2 class="atvwebplayersdk-subtitle-text f15586js f1iodedr fdm7v fva8997">Season 2, Ep. 11  The Lesser of Two Evils</h2>
  Ahh this is from the episode list :/


  <a href="/gp/video/detail/B00HUIFGRW/ref=atv_dp_bb_v0_b0w_cr_ep_qh_te_rgb_pwr?autoplay=1&amp;t=37" aria-label="Episode 11 , Continue watching" class="dvui-playButton _2UD9Ud _2t5M7h _2AWcdS"><span class="Gpyvwj _18GlHj _1aRTKf"></span></a>


SEARCH
  https://trakt.docs.apiary.io/#reference/search/text-query/get-text-query-results?console=1
  https://api.trakt.tv/search/movie,show?query=futurama&field=title


  client id 
  a983852934035793fbbdb313d7d130e2e1ad511699da6498fae048144062dad2

EPISODE
  https://trakt.docs.apiary.io/#reference/episodes/summary/get-a-single-episode-for-a-show?console=1
  https://api.trakt.tv/shows/futurama/seasons/2/episodes/11