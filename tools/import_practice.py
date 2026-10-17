"""Import your own practice hands into Bridge Trainer.

Reads the text files in practice/ (one per drill), checks every hand, and writes js/practice-data.js,
which the app loads. Run it from the project folder after editing the files:

    python tools/import_practice.py

Nothing is written if any hand has a problem; each problem is reported with its file and line.
The format is described at the top of each file in practice/.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# File name, key used by the app, and whether each hand needs an auction ending in "?".
DRILLS = [
    ('count-points.txt', 'points', 'none'),
    ('opening.txt', 'opening', 'optional'),
    ('responding.txt', 'responding', 'required'),
    ('opener-rebid.txt', 'openerRebid', 'required'),
    ('responder-rebid.txt', 'responderRebid', 'required'),
    ('overcalls.txt', 'overcalls', 'required'),
]

FIELD = re.compile(r'^\s*(hand|dealer|auction|answer|explanation|note|הסבר|הערה)\s*:\s*(.*)$', re.I)
FIELD_KEY = {'hand': 'hand', 'dealer': 'dealer', 'auction': 'auction', 'answer': 'answer',
             'explanation': 'why_en', 'הסבר': 'why_he', 'note': 'note_en', 'הערה': 'note_he'}
SUIT_SYMBOLS = {'♠': 'S', '♥': 'H', '♦': 'D', '♣': 'C'}
RANK_ORDER = 'AKQJT98765432'
STRAINS = 'CDHSN'


class Problem(Exception):
    pass


def clean(text):
    for sym, letter in SUIT_SYMBOLS.items():
        text = text.replace(sym, ' ' + letter + ' ')
    return text.replace('︎', '').replace('️', '')


def parse_hand(text):
    """'S AKJ52 H K74 D Q3 C J82' (also S:AKJ52, ♠AKJ52, 10 or T, - for a void) -> 'S:AKJ52 H:K74 D:Q3 C:J82'."""
    suits, current = {}, None
    for token in clean(text).upper().replace(':', ' ').split():
        # Ranks never use the letters S, H, D or C, so a word starting with one of them starts a suit.
        if token[0] in 'SHDC':
            current, token = token[0], token[1:]
            if current in suits:
                raise Problem(f'the suit {current} appears twice')
            suits[current] = ''
            if not token:
                continue
        if current is None:
            raise Problem(f'"{token}" comes before any suit letter (S, H, D or C)')
        if token in ('-', '—', '–'):
            continue
        ranks = token.replace('10', 'T')
        bad = [c for c in ranks if c not in RANK_ORDER]
        if bad:
            raise Problem(f'"{token}" is not a valid list of cards')
        suits[current] += ranks
    missing = [s for s in 'SHDC' if s not in suits]
    if missing:
        raise Problem('the hand has no ' + ', '.join(missing) + ' suit (write - for a void)')
    cards = [s + r for s in 'SHDC' for r in suits[s]]
    duplicates = sorted({c for c in cards if cards.count(c) > 1})
    if duplicates:
        raise Problem('these cards appear twice: ' + ', '.join(duplicates))
    if len(cards) != 13:
        raise Problem(f'the hand has {len(cards)} cards, not 13')
    return ' '.join(f'{s}:' + ''.join(sorted(suits[s], key=RANK_ORDER.index)) for s in 'SHDC' if suits[s])


def parse_call(token):
    t = clean(token).upper().replace(' ', '')
    if t in ('P', 'PASS', 'פאס'):
        return 'P'
    if t in ('X', 'DBL', 'DOUBLE', 'כפל', 'דאבל'):
        return 'X'
    if t in ('XX', 'RDBL', 'REDOUBLE', 'רידאבל'):
        return 'XX'
    if t == '?':
        return '?'
    m = re.fullmatch(r'([1-7])(NT|N|C|D|H|S)', t)
    if m:
        return m.group(1) + m.group(2)[0]
    raise Problem(f'"{token}" is not a call (use bids like 1S or 2NT, P for pass, X for double, XX for redouble)')


def bid_rank(bid):
    return (int(bid[0]) - 1) * 5 + STRAINS.index(bid[1])


def check_next_call(calls, call):
    """Raise if `call` can't legally follow `calls` (all made in turn)."""
    i = len(calls)
    last_bid = max((j for j, c in enumerate(calls) if c not in ('P', 'X', 'XX')), default=None)
    if last_bid is not None and calls[-3:] == ['P', 'P', 'P']:
        raise Problem('the auction has already ended with three passes')
    if last_bid is None and len(calls) >= 4:
        raise Problem('the auction has already ended (four passes)')
    if call == 'P':
        return
    last_action = max((j for j, c in enumerate(calls) if c != 'P'), default=None)
    if call == 'X':
        if last_action is None or calls[last_action] in ('X', 'XX') or (i - last_action) % 2 == 0:
            raise Problem('a double needs an opponent\'s bid to double')
        return
    if call == 'XX':
        if last_action is None or calls[last_action] != 'X' or (i - last_action) % 2 == 0:
            raise Problem('a redouble needs an opponent\'s double')
        return
    if last_bid is not None and bid_rank(call) <= bid_rank(calls[last_bid]):
        raise Problem(f'{call} is not higher than {calls[last_bid]}')


def parse_auction(text, need):
    tokens = clean(text).replace(',', ' ').split()
    calls = [parse_call(t) for t in tokens]
    if '?' in calls[:-1] or calls.count('?') > 1:
        raise Problem('"?" must be the last call: it marks your turn')
    if calls and calls[-1] != '?':
        raise Problem('the auction must end with "?" to mark your turn')
    for i, c in enumerate(calls[:-1]):
        check_next_call(calls[:i], c)
    if need == 'optional' and any(c != 'P' for c in calls[:-1]):
        raise Problem('an opening-bid hand can only have passes before your turn')
    return calls


def read_blocks(path):
    """Split a file into hands. Each hand starts with a "Hand:" line; lines without a field name continue the previous field."""
    blocks, block, field = [], None, None
    with open(path, encoding='utf-8-sig') as f:
        for n, raw in enumerate(f, 1):
            line = raw.rstrip('\n')
            if not line.strip() or line.lstrip().startswith('#') or line.startswith('==='):
                field = None if not line.strip() else field
                continue
            m = FIELD.match(line)
            if m:
                key = FIELD_KEY[m.group(1).lower() if m.group(1).isascii() else m.group(1)]
                if key == 'hand':
                    block = {'line': n}
                    blocks.append(block)
                elif block is None:
                    raise Problem(f'line {n}: "{m.group(1)}:" comes before the first "Hand:" line')
                if key in block:
                    block.setdefault('errors', []).append(f'"{m.group(1)}:" appears twice (line {n})')
                block[key], field = m.group(2).strip(), key
            elif block is not None and field:
                block[field] = (block[field] + ' ' + line.strip()).strip()
            else:
                raise Problem(f'line {n}: "{line.strip()}" doesn\'t belong to any field (start hands with "Hand:")')
    return blocks


def convert(block, need, key):
    if block.get('errors'):
        raise Problem('; '.join(block['errors']))
    out = {'hand': parse_hand(block.get('hand', ''))}
    auction = block.get('auction', '')
    if need == 'required' and not auction:
        raise Problem('this drill needs an "Auction:" line ending with "?"')
    if need == 'none' and auction:
        raise Problem('this drill doesn\'t use an auction')
    out['auction'] = parse_auction(auction, need) if auction else []
    if block.get('dealer') and block['dealer'].strip().upper()[:1] not in 'NESW':
        raise Problem('"Dealer:" must be N, E, S or W')
    answer = block.get('answer', '')
    if key == 'points':
        if answer:
            if not answer.isdigit():
                raise Problem('the answer for Count Points must be a number')
            out['points'] = int(answer)
    else:
        if not answer:
            raise Problem('the hand has no "Answer:" line')
        call = parse_call(answer)
        if call == '?':
            raise Problem('the answer must be a call, not "?"')
        try:
            check_next_call(out['auction'][:-1], call)
        except Problem as e:
            raise Problem(f'the answer {answer} isn\'t legal here: {e}')
        out['answer'] = call
    for part in ('why', 'note'):
        en, he = block.get(part + '_en', ''), block.get(part + '_he', '')
        if en or he:
            out[part] = {'en': en, 'he': he}
    return out


def main():
    practice_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'practice')
    output = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'js', 'practice-data.js')
    data, problems, summary = {}, [], []
    for name, key, need in DRILLS:
        path = os.path.join(practice_dir, name)
        if not os.path.exists(path):
            summary.append(f'  {name}: no file, random hands')
            continue
        rel = os.path.relpath(path, ROOT) if path.startswith(ROOT) else path
        try:
            blocks = read_blocks(path)
        except Problem as e:
            problems.append(f'{rel}: {e}')
            continue
        hands = []
        for b in blocks:
            try:
                hands.append(convert(b, need, key))
            except Problem as e:
                problems.append(f'{rel}, hand starting on line {b["line"]}: {e}')
        if hands:
            data[key] = hands
        summary.append(f'  {name}: {len(hands)} hand(s)' if hands else f'  {name}: no hands yet, random hands')

    if problems:
        print('Nothing was written. Please fix these problems and run the script again:\n')
        for p in problems:
            print('  - ' + p)
        sys.exit(1)

    with open(output, 'w', encoding='utf-8', newline='\n') as f:
        f.write('// Generated by tools/import_practice.py from the files in practice/. Don\'t edit this file:\n')
        f.write('// edit the text files and run the script again.\n')
        f.write('const PRACTICE = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    print('Wrote ' + os.path.relpath(output, ROOT) + ':')
    print('\n'.join(summary))


if __name__ == '__main__':
    main()
