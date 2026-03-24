import json
import urllib.request
import urllib.parse
import os
import re
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

with open('data.js', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'const TEAMS = \[(.*?)\];', content, re.DOTALL)
if not match:
    print("Failed to find TEAMS array")
    exit(1)

teams_str = match.group(1)
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

def fetch_image_from_title(title, team_id, lang='en'):
    url = f"https://{lang}.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=pageimages&format=json&pithumbsize=300"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
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
                return True
    except Exception as e:
        pass
    return False

def search_wiki_and_download(search_term, team_id, lang='en'):
    search_url = f"https://{lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(search_term)}&utf8=&format=json"
    try:
        req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            search_results = data['query']['search']
            if len(search_results) > 0:
                exact_title = search_results[0]['title']
                return fetch_image_from_title(exact_title, team_id, lang)
    except Exception as e:
        pass
    return False

for t in teams:
    team_id = t['id']
    # Skip if already exists
    if os.path.exists(f"img/logos/{team_id}.png"):
        continue

    # Try English exact search
    if search_wiki_and_download(t['engName'] + " football club", team_id, 'en'):
        print(f"Downloaded {t['engName']} (en sr)")
        time.sleep(0.5)
        continue

    # Try Korean exact search
    if search_wiki_and_download(t['name'] + " FC", team_id, 'ko'):
        print(f"Downloaded {t['name']} (ko sr)")
        time.sleep(0.5)
        continue
    
    # Try generic English search
    if search_wiki_and_download(t['engName'], team_id, 'en'):
        print(f"Downloaded {t['engName']} (en fallback)")
        time.sleep(0.5)
        continue

    print(f"Failed to find logo for {t['name']} / {t['engName']}")

print("Done scraping newly missing logos.")
