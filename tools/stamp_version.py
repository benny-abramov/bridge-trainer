"""Give the app a new version stamp, so browsers notice an update.

Writes the same stamp (the current UTC time) to:
  - version.json, which open pages check to see whether a newer version has been published;
  - the <meta name="app-version"> tag in index.html, the version of the page that's loaded;
  - a ?v=<stamp> on every script and stylesheet link in index.html and mockup.html, so a reload
    fetches the new files instead of the browser's saved copies.

The git pre-commit hook in .githooks/ runs this whenever a commit changes the app. To run it by hand:

    python tools/stamp_version.py
"""
import datetime
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = ['index.html', 'mockup.html']


def main():
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d-%H%M%S')
    for name in PAGES:
        path = os.path.join(ROOT, name)
        with open(path, encoding='utf-8', newline='') as f:
            html = f.read()
        html = re.sub(r'((?:src|href)="(?:js|css)/[^"?]+\.(?:js|css))(?:\?v=[^"]*)?"', rf'\1?v={stamp}"', html)
        html = re.sub(r'<meta name="app-version" content="[^"]*">', f'<meta name="app-version" content="{stamp}">', html)
        with open(path, 'w', encoding='utf-8', newline='') as f:
            f.write(html)
    with open(os.path.join(ROOT, 'version.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump({'version': stamp}, f)
        f.write('\n')
    print('Version ' + stamp)


if __name__ == '__main__':
    main()
