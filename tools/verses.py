# Puts the KJV text of every Bible reference in types.src.html into the page, so tapping a
# reference shows its verses. Run after adding or changing a reference, then encrypt again:
#   python3 tools/verses.py        (fetches from BibleGateway, rewrites the kjv block at the end)
import re, json, time, urllib.request, urllib.parse
from html.parser import HTMLParser
from pathlib import Path

SOURCE = Path(__file__).resolve().parent.parent / 'types.src.html'
BLOCK = re.compile(r'\n?<script type="application/json" id="kjv">.*?</script>\n?', re.S)


class Passage(HTMLParser):
    """Collects each verse's words from BibleGateway's passage HTML, minus verse numbers and notes."""
    def __init__(self):
        super().__init__()
        self.stack, self.verses = [], {}

    def handle_starttag(self, tag, attrs):
        self.stack.append((tag, dict(attrs).get('class') or ''))

    def handle_endtag(self, tag):
        while self.stack and self.stack.pop()[0] != tag:
            pass

    def handle_data(self, data):
        verse, skip, caps = None, False, False
        for tag, cls in self.stack:
            m = re.match(r'text \w+-(\d+)-(\d+)$', cls)
            if tag == 'span' and m:
                verse = (int(m.group(1)), int(m.group(2)))
            skip |= tag in ('sup', 'h3') or 'chapternum' in cls
            caps |= 'small-caps' in cls
        if verse and not skip:
            self.verses[verse] = self.verses.get(verse, '') + (data.upper() if caps else data)


def fetch(search):
    url = 'https://www.biblegateway.com/passage/?search=' + urllib.parse.quote(search) + '&version=KJV'
    page = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=20).read().decode('utf8')
    body = page.split('class="passage-text"', 1)[1].split('class="footnotes"', 1)[0].split('class="crossrefs', 1)[0]
    p = Passage()
    p.feed(body)
    # [verse number, text]; the page's apostrophes are curly, so these are too.
    return [[v, re.sub(r'\s+', ' ', text).strip().replace("'", '’')] for (_, v), text in p.verses.items()]


src = SOURCE.read_text()
searches = sorted({urllib.parse.unquote(s) for s in re.findall(r'search=([^&"]+)&amp;version=KJV', src)})
verses = {}
for s in searches:
    verses[s] = fetch(s)
    print(f'{s}: {len(verses[s])} verses')
    time.sleep(0.4)
block = '\n<script type="application/json" id="kjv">' + json.dumps(verses, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/') + '</script>\n'
SOURCE.write_text(BLOCK.sub('', src).rstrip('\n') + '\n' + block)
print('types.src.html: kjv block written. Now encrypt.')
