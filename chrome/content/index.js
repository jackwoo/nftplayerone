
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log('----------');
        if( request.message === "clicked_browser_action" ) {
            var firstHref = $("a[href^='http']").eq(0).attr("href");  
            console.log(firstHref);

            // This line is new!
            chrome.runtime.sendMessage({"message": "open_new_tab", "url": firstHref});
        }
    }
);
alert("22");
