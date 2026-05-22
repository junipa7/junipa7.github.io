import os
import re
import html
import json

diagrams_dir = r"c:\Users\junipa7\Documents\myhomepage\contents\MES\diagrams"
for filename in os.listdir(diagrams_dir):
    if not filename.endswith(".html"):
        continue
    filepath = os.path.join(diagrams_dir, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Let's extract the value of data-mxgraph
    # It starts with data-mxgraph=" and ends with "
    match = re.search(r'data-mxgraph="([^"]+)"', content)
    if not match:
        print(f"{filename}: data-mxgraph attribute not found!")
        continue
    
    val = match.group(1)
    # unescape html entities like &quot;
    decoded = html.unescape(val)
    
    try:
        json.loads(decoded)
        print(f"{filename}: JSON is VALID!")
    except Exception as e:
        print(f"{filename}: JSON INVALID! Error: {e}")
        # print around the position
        pos_match = re.search(r'char (\d+)', str(e))
        if pos_match:
            pos = int(pos_match.group(1))
            start = max(0, pos - 40)
            end = min(len(decoded), pos + 40)
            print("Snippet around error:")
            print(f"... {decoded[start:pos]} ===> {decoded[pos]} <=== {decoded[pos+1:end]} ...")
        else:
            print("Snippet:")
            print(decoded[:200])
