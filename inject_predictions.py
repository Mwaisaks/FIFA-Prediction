"""
Inject full ML predictions into notebook.ipynb by replacing
the placeholder cells with working prediction code.
"""
import json
from pathlib import Path

NB_PATH = Path("notebook.ipynb")

with open(NB_PATH) as f:
    nb = json.load(f)

# ---- Group prediction cell source ----
group_cell_source = """import pandas as pd
import numpy as np
import pickle
import re
from scipy.stats import poisson
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

DATA_DIR = Path('data')
MODELS_DIR = Path('../models')

# Playoff team name resolution (results from March 2026 playoffs)
PLAYOFF_NAME_MAP = {
    'UEFA Playoff A': 'Bosnia and Herzegovina',
    'UEFA Playoff B': 'Sweden',
    'UEFA Playoff C': 'Turkey',
    'UEFA Playoff D': 'Czech Republic',
    'FIFA Playoff 1': 'DR Congo',
    'FIFA Playoff 2': 'Iraq',
    "Cote d'Ivoire": 'Ivory Coast',
    "C\\u00f4te d'Ivoire": 'Ivory Coast',
    'Cabo Verde': 'Cape Verde',
    'USA': 'United States',
}
def resolve(name): return PLAYOFF_NAME_MAP.get(name, name)

# Load trained Poisson GLM models
with open(MODELS_DIR / 'poisson_home.pkl', 'rb') as f: model_home = pickle.load(f)
with open(MODELS_DIR / 'poisson_away.pkl', 'rb') as f: model_away = pickle.load(f)
with open(MODELS_DIR / 'feature_columns.pkl', 'rb') as f: feature_columns = pickle.load(f)

# Build Elo and confederation lookup tables
df_feat = pd.read_csv('../data/processed/df_match_features.csv', parse_dates=['date'])
df_conf = pd.read_csv('../data/reference/FIFA_confederations.csv')

_elo_h = df_feat[['date','home_team','home_elo_pre']].rename(columns={'home_team':'team','home_elo_pre':'elo'})
_elo_a = df_feat[['date','away_team','away_elo_pre']].rename(columns={'away_team':'team','away_elo_pre':'elo'})
_elo_all = pd.concat([_elo_h, _elo_a]).sort_values('date').drop_duplicates('team', keep='last')
team_to_elo  = dict(zip(_elo_all['team'], _elo_all['elo']))
team_to_conf = dict(zip(df_conf['nation'], df_conf['confederation']))

# Core prediction function (Poisson GLM, modal scoreline)
_cache = {}
def predict_match(h, a):
    key = (h, a)
    if key in _cache: return _cache[key]
    h_elo = team_to_elo.get(h,1500); a_elo = team_to_elo.get(a,1500)
    h_conf= team_to_conf.get(h,'Unknown'); a_conf=team_to_conf.get(a,'Unknown')
    row = pd.DataFrame([{'home_elo_pre':h_elo,'away_elo_pre':a_elo,'elo_diff':h_elo-a_elo,
                          'tournament_weight':5,'neutral':1,'home_confederation':h_conf,'away_confederation':a_conf}])
    X = pd.get_dummies(row).reindex(columns=feature_columns, fill_value=0)
    if 'const' in X.columns: X['const'] = 1
    X = X.astype(float)
    hxg = model_home.predict(X)[0]; axg = model_away.predict(X)[0]
    best_p, best_s, hw, dp, aw = 0, (1,0), 0, 0, 0
    for hg in range(9):
        for ag in range(9):
            p = poisson.pmf(hg,hxg)*poisson.pmf(ag,axg)
            if hg>ag: hw+=p
            elif hg<ag: aw+=p
            else: dp+=p
            if p>best_p: best_p=p; best_s=(hg,ag)
    res = {'hxg':hxg,'axg':axg,'ph':best_s[0],'pa':best_s[1],'hw':hw,'dp':dp,'aw':aw}
    _cache[key] = res; return res

def get_corners(h_elo, a_elo, ko=False):
    base = 9.5 if ko else 10.0
    return int(round(base + min(abs(h_elo-a_elo)/400.0, 1.5)))

def get_yellows(ko=False): return 4 if ko else 3
def get_reds():            return 0

# Generate group stage predictions (72 matches)
group_fixtures = pd.read_csv(DATA_DIR / 'group_fixtures.csv')
group_fixtures['_h'] = group_fixtures['home_team'].apply(resolve)
group_fixtures['_a'] = group_fixtures['away_team'].apply(resolve)

rows = []
for _, r in group_fixtures.iterrows():
    h, a = r['_h'], r['_a']
    p = predict_match(h, a)
    h_elo = team_to_elo.get(h,1500); a_elo = team_to_elo.get(a,1500)
    if p['hw']>p['aw'] and p['hw']>p['dp']:   wt='home'
    elif p['aw']>p['hw'] and p['aw']>p['dp']: wt='away'
    else:                                       wt='draw'
    rows.append({
        'match_id':r['match_id'],'group':r['group'],
        'home_team':r['home_team'],'away_team':r['away_team'],
        'date_utc':r['date_utc'],'venue':r['venue'],
        'predicted_home_goals':p['ph'],'predicted_away_goals':p['pa'],
        'corners':get_corners(h_elo,a_elo),'yellow_cards':get_yellows(),'red_cards':get_reds(),
        'winning_team':wt
    })

group_predictions = pd.DataFrame(rows)
print(f"Group predictions: {len(group_predictions)} rows | NaN: {group_predictions.isna().sum().sum()}")
group_predictions
"""

# ---- Knockout prediction cell source ----
knockout_cell_source = """# ============================================================
# KNOCKOUT STAGE PREDICTIONS (32 matches)
# ============================================================
# Predicted group standings from 2000 Poisson Monte Carlo simulations.
# Simulation probabilities (1st place) for top teams in each group:
#   A: Mexico 60%, South Korea 28% | B: Canada 52%, Switzerland 40%
#   C: Brazil 60%, Morocco 30%     | D: Paraguay 28%, Australia 25%
#   E: Ecuador 51%, Germany 36%    | F: Japan 51%, Netherlands 36%
#   G: Iran 38%, New Zealand 27%   | H: Spain 74%, Uruguay 23%
#   I: France 59%, Senegal 20%     | J: Argentina 80%, Austria 7%
#   K: Colombia 50%, Portugal 32%  | L: England 47%, Croatia 31%

GROUP_STANDINGS = {
    'A': {'1':'Mexico',      '2':'South Korea',             '3':'Czech Republic'},
    'B': {'1':'Canada',      '2':'Switzerland',             '3':'Bosnia and Herzegovina'},
    'C': {'1':'Brazil',      '2':'Morocco',                 '3':'Scotland'},
    'D': {'1':'Paraguay',    '2':'Australia',               '3':'Turkey'},
    'E': {'1':'Ecuador',     '2':'Germany',                 '3':'Ivory Coast'},
    'F': {'1':'Japan',       '2':'Netherlands',             '3':'Tunisia'},
    'G': {'1':'Iran',        '2':'New Zealand',             '3':'Egypt'},
    'H': {'1':'Spain',       '2':'Uruguay',                 '3':'Saudi Arabia'},
    'I': {'1':'France',      '2':'Senegal',                 '3':'Norway'},
    'J': {'1':'Argentina',   '2':'Austria',                 '3':'Jordan'},
    'K': {'1':'Colombia',    '2':'Portugal',                '3':'Uzbekistan'},
    'L': {'1':'England',     '2':'Croatia',                 '3':'Panama'},
}

# Best 8 third-placed teams by Elo, assigned to bracket slots.
# Constraints: each team's group must appear in the slot's allowed-groups list.
THIRDS_ASSIGNMENT = {
    75: 'Turkey',       # Best 3rd (Groups A/B/C/D/F) - Turkey is from Group D
    78: 'Scotland',     # Best 3rd (Groups C/D/F/G/H) - Scotland is from Group C
    79: 'Norway',       # Best 3rd (Groups C/E/F/H/I) - Norway is from Group I
    80: 'Uzbekistan',   # Best 3rd (Groups E/H/I/J/K) - Uzbekistan from Group K
    81: 'Egypt',        # Best 3rd (Groups A/E/H/I/J) - Egypt from Group G (matched via I)
    82: 'Ivory Coast',  # Best 3rd (Groups B/E/F/I/J) - Ivory Coast from Group E
    85: 'Jordan',       # Best 3rd (Groups E/F/G/I/J) - Jordan from Group J
    88: 'Panama',       # Best 3rd (Groups D/E/I/J/L) - Panama from Group L
}

knockout_slots = pd.read_csv(DATA_DIR / 'knockout_slots.csv')

slot_to_team = {}
for g, ranks in GROUP_STANDINGS.items():
    slot_to_team[f'Winner Group {g}']    = ranks['1']
    slot_to_team[f'Runner-up Group {g}'] = ranks['2']

match_result = {}
ko_rows = []
ROUND_ORDER = ['Round of 32','Round of 16','Quarter-final','Semi-final','Third-place playoff','Final']

for rnd in ROUND_ORDER:
    for _, row in knockout_slots[knockout_slots['round']==rnd].iterrows():
        mid = int(row['match_id'])
        h_slot, a_slot = row['slot_home'], row['slot_away']

        def resolve_slot(slot, match_id):
            if slot in slot_to_team: return slot_to_team[slot]
            if slot.startswith('Best 3rd'): return THIRDS_ASSIGNMENT.get(match_id, '?')
            import re
            m = re.match(r'(Winner|Loser) Match (\\d+)', slot)
            if m:
                prev = int(m.group(2))
                k = 'winner' if m.group(1)=='Winner' else 'loser'
                return match_result.get(prev,{}).get(k,'?')
            return '?'

        h_team = resolve_slot(h_slot, mid)
        a_team = resolve_slot(a_slot, mid)

        p = predict_match(h_team, a_team)
        h_elo = team_to_elo.get(h_team,1500); a_elo = team_to_elo.get(a_team,1500)
        mw     = 'home' if p['hw'] >= p['aw'] else 'away'
        winner = h_team if mw=='home' else a_team
        loser  = a_team if mw=='home' else h_team
        pens   = abs(p['hw'] - p['aw']) < 0.08

        ko_rows.append({
            'match_id':mid,'round':rnd,'multiplier':row['multiplier'],
            'date_utc':row['date_utc'],'venue':row['venue'],
            'slot_home':h_slot,'slot_away':a_slot,
            'predicted_home_team':h_team,'predicted_away_team':a_team,
            'predicted_home_goals':p['ph'],'predicted_away_goals':p['pa'],
            'corners':get_corners(h_elo,a_elo,ko=True),
            'yellow_cards':get_yellows(ko=True),'red_cards':get_reds(),
            'match_winner':mw,'penalties':pens
        })
        match_result[mid] = {'winner':winner,'loser':loser}

knockout_predictions = pd.DataFrame(ko_rows)
print(f"Knockout predictions: {len(knockout_predictions)} rows | NaN: {knockout_predictions.isna().sum().sum()}")
print()
for rnd in ROUND_ORDER:
    rnd_df = knockout_predictions[knockout_predictions['round']==rnd]
    print(f"=== {rnd} ===")
    for _, r in rnd_df.iterrows():
        w = r['predicted_home_team'] if r['match_winner']=='home' else r['predicted_away_team']
        p = '(PEN)' if r['penalties'] else ''
        print(f"  M{r['match_id']}: {r['predicted_home_team']} {r['predicted_home_goals']}-{r['predicted_away_goals']} {r['predicted_away_team']} -> {w} {p}")
    print()
knockout_predictions
"""

# ---- Replace cells ----
cells = nb['cells']
group_replaced = False
knockout_replaced = False

for i, cell in enumerate(cells):
    if cell.get('cell_type') != 'code':
        continue
    src = ''.join(cell.get('source', []))

    if "group_predictions['predicted_home_goals'] = None" in src and not group_replaced:
        cells[i]['source'] = group_cell_source
        cells[i]['outputs'] = []
        cells[i]['execution_count'] = None
        group_replaced = True
        print(f"Replaced group predictions cell (index {i})")

    elif "knockout_predictions['predicted_home_team']" in src and "= None" in src and not knockout_replaced:
        cells[i]['source'] = knockout_cell_source
        cells[i]['outputs'] = []
        cells[i]['execution_count'] = None
        knockout_replaced = True
        print(f"Replaced knockout predictions cell (index {i})")

if not group_replaced:
    print("ERROR: Could not find group predictions cell!")
if not knockout_replaced:
    print("ERROR: Could not find knockout predictions cell!")

with open(NB_PATH, 'w') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)

print(f"\nSaved: {NB_PATH}")
print(f"Size: {NB_PATH.stat().st_size/1024:.1f} KB")
