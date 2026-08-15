const fs = require("fs");

const targets = [
    ["contents/MES/MES_Developer_Education.html", "mes-education"],
    ["contents/MES/MES_Website.html", "mes-standards"]
];

function extractBody(html) {
    const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return match ? match[1] : html;
}

for (const [file, className] of targets) {
    const html = fs.readFileSync(file, "utf8");
    let content = extractBody(html)
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<div class="bottom-nav"[\s\S]*?<\/div>\s*$/i, "")
        .replace(/\sstyle="[^"]*"/gi, "")
        .replace(/<small[^>]*>/gi, '<span class="text-desc">')
        .replace(/<\/small>/gi, "</span>")
        .trim();

    content = `<article class="mes-document ${className}">\n${content}\n</article>\n`;
    fs.writeFileSync(file, content, "utf8");
    console.log(`${file}: ${content.length} chars`);
}
