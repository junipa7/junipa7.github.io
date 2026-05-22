var stream = new ActiveXObject("ADODB.Stream");
stream.Open();
stream.Type = 2; // Text
stream.Charset = "utf-8";
stream.LoadFromFile("c:\\Users\\junipa7\\Documents\\myhomepage\\contents\\MES\\diagrams\\dfd_level_0.html");
var content = stream.ReadText();
stream.Close();

var match = content.match(/data-mxgraph="([^"]+)"/);
if (!match) {
    WScript.Echo("data-mxgraph not found!");
    WScript.Quit(1);
}

var val = match[1];

// Manual HTML decode
var decoded = val
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'");

WScript.Echo("Decoded string length: " + decoded.length);

// Global htmlfile reference to prevent garbage collection
var gHtml = new ActiveXObject("htmlfile");
gHtml.write("<meta http-equiv='X-UA-Compatible' content='IE=9' />");
var gWin = gHtml.parentWindow;

// We will use standard JSON.parse below


try {
    var parsed = gWin.JSON.parse(decoded);
    WScript.Echo("JSON.parse parsed JSON successfully!");
} catch (e) {
    WScript.Echo("JSON.parse INVALID! Error: " + e.description);
    
    // Find where the parsing failed in JSON.parse by trying prefixes
    WScript.Echo("Checking prefixes to find failure transition...");
    for (var len = 50; len <= decoded.length; len++) {
        var prefix = decoded.substring(0, len);
        
        try {
            var testStr = prefix + '"}';
            gWin.JSON.parse(testStr);
        } catch (err) {
            var msg = err.description || err.message || "";
            // We want to skip standard incomplete JSON errors
            var isExpectedBracket = (msg.indexOf("\uac00 \ud544\uc694\ud569\ub2c8\ub2e4") >= 0 && msg.indexOf("\uc27d\ud45c") < 0);
            var isUnclosedString = (msg.indexOf("\ub2eb\ub294") >= 0);
            
            if (!isExpectedBracket && !isUnclosedString) {
                WScript.Echo("First syntax error at length " + len + ": " + msg);
                WScript.Echo("Last few characters of prefix: " + decoded.substring(len - 15, len));
                WScript.Echo("Character at length " + len + " (index " + (len-1) + "): '" + decoded.charAt(len-1) + "' (code: " + decoded.charCodeAt(len-1) + ")");
                break;
            }
        }
    }
}

