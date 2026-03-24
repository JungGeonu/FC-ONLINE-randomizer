import json
import urllib.request
import urllib.parse
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
# We will read data.js, extract the TEAMS array via regex
with open('data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract TEAMS array
match = re.search(r'const TEAMS = \[(.*?)\];', content, re.DOTALL)
if not match:
    print("Failed to find TEAMS array")
    exit(1)

teams_str = match.group(1)
# Crude regex to extract id and name/engName
teams = []
for line in teams_str.split('\n'):
    if '{' in line:
        id_match = re.search(r'id:\s*(\d+)', line)
        name_match = re.search(r"name:\s*'([^']+)'", line)
        eng_match = re.search(r"engName:\s*'([^']+)'", line)
        if id_match and name_match and eng_match:
            teams.append({
                'id': id_match.group(1),
                'name': name_match.group(1),
                'engName': eng_match.group(1)
            })

os.makedirs('img/logos', exist_ok=True)

def fetch_wiki_logo(team_name, fallback_name, team_id):
    # Try Korean wiki first
    url = f"https://ko.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(team_name + ' FC')}&prop=pageimages&format=json&pithumbsize=300"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            pages = data['query']['pages']
            page_id = list(pages.keys())[0]
            if page_id != '-1' and 'thumbnail' in pages[page_id]:
                img_url = pages[page_id]['thumbnail']['source']
                # Download
                ext = img_url.split('.')[-1]
                if ext not in ['png', 'svg', 'jpg', 'jpeg']: ext = 'png'
                out_path = f"img/logos/{team_id}.png"
                req_img = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req_img) as img_resp:
                    with open(out_path, 'wb') as img_f:
                        img_f.write(img_resp.read())
                print(f"Downloaded {team_name} (ko)")
                return True
    except Exception as e:
        pass

    # Try English wiki
    url_en = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(fallback_name)}&prop=pageimages&format=json&pithumbsize=300"
    try:
        req = urllib.request.Request(url_en, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            pages = data['query']['pages']
            page_id = list(pages.keys())[0]
            if page_id != '-1' and 'thumbnail' in pages[page_id]:
                img_url = pages[page_id]['thumbnail']['source']
                out_path = f"img/logos/{team_id}.png"
                req_img = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req_img) as img_resp:
                    with open(out_path, 'wb') as img_f:
                        img_f.write(img_resp.read())
                print(f"Downloaded {fallback_name} (en)")
                return True
    except Exception as e:
        pass

    print(f"Failed to find logo for {team_name} / {fallback_name}")
    return False

for t in teams:
    fetch_wiki_logo(t['name'], t['engName'], t['id'])
    
print("Done scraping.")
