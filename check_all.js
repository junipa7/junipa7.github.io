var fso = new ActiveXObject("Scripting.FileSystemObject");
var folder = fso.GetFolder("c:\\Users\\junipa7\\Documents\\myhomepage\\contents\\MES\\diagrams");
var fc = new Enumerator(folder.Files);

var html = new ActiveXObject("htmlfile");
html.write("<meta http-equiv='X-UA-Compatible' content='IE=9' />");
var win = html.parentWindow;

for (; !fc.atEnd(); fc.moveNext()) {
    var file = fc.item();
    if (file.Name.substring(file.Name.length - 5).toLowerCase() !== ".html") {
        continue;
    }
    
    var stream = new ActiveXObject("ADODB.Stream");
    stream.Open();
    stream.Type = 2; // Text
    stream.Charset = "utf-8";
    stream.LoadFromFile(file.Path);
    var content = stream.ReadText();
    stream.Close();
    
    var match = content.match(/data-mxgraph="([^"]+)"/);
    if (!match) {
        WScript.Echo(file.Name + ": data-mxgraph not found!");
        continue;
    }
    
    var decoded = match[1]
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'");
        
    try {
        win.JSON.parse(decoded);
        WScript.Echo(file.Name + ": SUCCESS");
    } catch (e) {
        WScript.Echo(file.Name + ": FAILED - " + e.description);
    }
}
