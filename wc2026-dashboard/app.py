import streamlit as st
import pandas as pd
import numpy as np
import statsmodels.api as sm
from scipy.stats import poisson
from collections import defaultdict
import urllib.request, io, warnings
warnings.filterwarnings('ignore')

# ── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="WC 2026 Predictor",
    page_icon="⚽",
    layout="centered"
)

# ── Name resolution ───────────────────────────────────────────────────────────
PLAYOFF_NAME_MAP = {
    'UEFA Playoff A': 'Bosnia and Herzegovina',
    'UEFA Playoff B': 'Sweden',
    'UEFA Playoff C': 'Turkey',
    'UEFA Playoff D': 'Czech Republic',
    'FIFA Playoff 1': 'DR Congo',
    'FIFA Playoff 2': 'Iraq',
    "Cote d'Ivoire": 'Ivory Coast',
    "Côte d'Ivoire": 'Ivory Coast',
    'Cabo Verde': 'Cape Verde',
    'USA': 'United States',
}
def resolve(name): return PLAYOFF_NAME_MAP.get(name, name)

# ── Load + train (cached so it only runs once per session) ────────────────────
@st.cache_resource(show_spinner="Setting up prediction model...")
def load_model():
    URL = "https://raw.githubusercontent.com/martj42/international_results/master/results.csv"
    with urllib.request.urlopen(URL, timeout=20) as r:
        df = pd.read_csv(io.BytesIO(r.read()), parse_dates=['date'])

    df = df[~df['tournament'].str.contains('CONIFA', case=False, na=False)]
    df = df.dropna(subset=['home_score','away_score']).sort_values('date')

    K_MAP = {
        'FIFA World Cup': 60, 'UEFA Euro': 50, 'Copa América': 50,
        'African Cup of Nations': 50, 'AFC Asian Cup': 50,
        'Confederations Cup': 50, 'Gold Cup': 50,
        'FIFA World Cup qualification': 40, 'UEFA Nations League': 40,
        'UEFA Euro qualification': 40,
    }
    elo = defaultdict(lambda: 1500.0)
    for row in df.itertuples(index=False):
        h, a = row.home_team, row.away_team
        h_elo, a_elo = elo[h], elo[a]
        h_adv = 0 if row.neutral else 100
        exp_h = 1 / (1 + 10 ** (-((h_elo + h_adv) - a_elo) / 400))
        act_h = 1.0 if row.home_score > row.away_score else (0.0 if row.home_score < row.away_score else 0.5)
        gd = abs(row.home_score - row.away_score)
        g = 1.0 if gd <= 1 else (1.5 if gd == 2 else (11 + gd) / 8)
        K = K_MAP.get(row.tournament, 20)
        elo[h] = h_elo + K * g * (act_h - exp_h)
        elo[a] = a_elo + K * g * ((1 - act_h) - (1 - exp_h))

    team_to_elo = dict(elo)

    team_to_conf = {
        'Spain':'UEFA','Argentina':'CONMEBOL','France':'UEFA','England':'UEFA',
        'Brazil':'CONMEBOL','Colombia':'CONMEBOL','Portugal':'UEFA','Ecuador':'CONMEBOL',
        'Netherlands':'UEFA','Germany':'UEFA','Croatia':'UEFA','Morocco':'CAF',
        'Japan':'AFC','Uruguay':'CONMEBOL','Norway':'UEFA','Turkey':'UEFA',
        'Switzerland':'UEFA','Denmark':'UEFA','Italy':'UEFA','Mexico':'CONCACAF',
        'United States':'CONCACAF','Australia':'AFC','South Korea':'AFC','Senegal':'CAF',
        'Algeria':'CAF','Egypt':'CAF','Canada':'CONCACAF','Qatar':'AFC',
        'Sweden':'UEFA','Paraguay':'CONMEBOL','Scotland':'UEFA','Austria':'UEFA',
        'Tunisia':'CAF','South Africa':'CAF','Bosnia and Herzegovina':'UEFA',
        'Cape Verde':'CAF','Ghana':'CAF','Curaçao':'CONCACAF','Haiti':'CONCACAF',
        'New Zealand':'OFC','Czech Republic':'UEFA','DR Congo':'CAF',
        'Uzbekistan':'AFC','Iraq':'AFC','Ivory Coast':'CAF','Panama':'CONCACAF',
        'Jordan':'AFC','Saudi Arabia':'AFC',
    }

    TWEIGHT = {
        'FIFA World Cup': 5, 'UEFA Euro': 4, 'Copa América': 4,
        'African Cup of Nations': 4, 'AFC Asian Cup': 4,
        'FIFA World Cup qualification': 3, 'UEFA Nations League': 3,
    }
    train = df[
        (df['date'] >= '2000-01-01') &
        (df['date'] < '2024-01-01') &
        (df['tournament'] != 'Friendly')
    ].copy().reset_index(drop=True)

    train['home_elo_pre']       = train['home_team'].map(team_to_elo).fillna(1500)
    train['away_elo_pre']       = train['away_team'].map(team_to_elo).fillna(1500)
    train['elo_diff']           = train['home_elo_pre'] - train['away_elo_pre']
    train['tournament_weight']  = train['tournament'].map(TWEIGHT).fillna(1).astype(int)
    train['neutral']            = train['neutral'].astype(int)
    train['home_confederation'] = train['home_team'].map(team_to_conf).fillna('Unknown')
    train['away_confederation'] = train['away_team'].map(team_to_conf).fillna('Unknown')

    def build_X(df):
        X = df[['home_elo_pre','away_elo_pre','elo_diff','tournament_weight']].copy()
        X['neutral'] = df['neutral'].values
        cats = pd.get_dummies(df[['home_confederation','away_confederation']], drop_first=True).astype(int)
        return sm.add_constant(
            pd.concat([X.reset_index(drop=True), cats.reset_index(drop=True)], axis=1),
            has_constant='add'
        )

    X_train = build_X(train)
    feature_columns = X_train.columns.tolist()
    model_home = sm.GLM(train['home_score'], X_train, family=sm.families.Poisson()).fit()
    model_away = sm.GLM(train['away_score'], X_train, family=sm.families.Poisson()).fit()

    return model_home, model_away, feature_columns, team_to_elo, team_to_conf, build_X

# ── Prediction function ───────────────────────────────────────────────────────
def predict(home, away, model_home, model_away, feature_columns, team_to_elo, team_to_conf, build_X):
    home, away = resolve(home), resolve(away)
    h_elo = team_to_elo.get(home, 1500)
    a_elo = team_to_elo.get(away, 1500)
    h_conf = team_to_conf.get(home, 'Unknown')
    a_conf = team_to_conf.get(away, 'Unknown')

    row = pd.DataFrame([{
        'home_elo_pre': h_elo, 'away_elo_pre': a_elo, 'elo_diff': h_elo - a_elo,
        'tournament_weight': 5, 'neutral': 1,
        'home_confederation': h_conf, 'away_confederation': a_conf
    }])
    row['neutral'] = 1
    X = build_X(row).reindex(columns=feature_columns, fill_value=0)
    if 'const' in X.columns: X['const'] = 1.0

    hxg = model_home.predict(X)[0]
    axg = model_away.predict(X)[0]

    best_p, best_s, hw, dp, aw = 0, (1, 0), 0, 0, 0
    score_grid = {}
    for hg in range(9):
        for ag in range(9):
            p = poisson.pmf(hg, hxg) * poisson.pmf(ag, axg)
            score_grid[f"{hg}–{ag}"] = round(p * 100, 1)
            if hg > ag:   hw += p
            elif hg < ag: aw += p
            else:         dp += p
            if p > best_p: best_p = p; best_s = (hg, ag)

    corners = int(round(9.5 + min(abs(h_elo - a_elo) / 400.0, 1.5)))
    return {
        'home': home, 'away': away,
        'score': f"{best_s[0]}–{best_s[1]}",
        'hxg': round(hxg, 2), 'axg': round(axg, 2),
        'hw': round(hw * 100, 1), 'dp': round(dp * 100, 1), 'aw': round(aw * 100, 1),
        'corners': corners, 'yellow_cards': 4, 'red_cards': 0,
        'score_grid': score_grid,
        'h_elo': round(h_elo), 'a_elo': round(a_elo),
    }

# ── UI ────────────────────────────────────────────────────────────────────────
st.title("⚽ FIFA World Cup 2026 Predictor")
st.caption("Poisson GLM trained on 49,000+ international matches · Elo-rated team strength")

with st.expander("How to use (quick guide)", expanded=True):
    st.markdown(
        "- Select Home and Away teams from the dropdowns.\n"
        "- If both teams are the same, you'll see a warning and the app will stop.\n"
        "- View predicted score, win probabilities, xG, and the top scorelines below."
    )

model_home, model_away, feature_columns, team_to_elo, team_to_conf, build_X = load_model()

ALL_TEAMS = sorted([
    'Algeria','Argentina','Australia','Austria','Bosnia and Herzegovina',
    'Brazil','Canada','Cape Verde','Colombia','Croatia','Czech Republic',
    'DR Congo','Ecuador','Egypt','England','France','Germany','Ghana',
    'Haiti','Iran','Iraq','Ivory Coast','Japan','Jordan','Mexico',
    'Morocco','Netherlands','New Zealand','Norway','Panama','Paraguay',
    'Portugal','Qatar','Saudi Arabia','Scotland','Senegal','South Africa',
    'South Korea','Spain','Sweden','Switzerland','Tunisia','Turkey',
    'United States','Uruguay','Uzbekistan',
])

col1, col2 = st.columns(2)
with col1:
    home_team = st.selectbox("Home team", ALL_TEAMS, index=ALL_TEAMS.index("Brazil"))
with col2:
    away_team = st.selectbox("Away team", ALL_TEAMS, index=ALL_TEAMS.index("Argentina"))

if home_team == away_team:
    st.warning("Pick two different teams.")
    st.stop()

result = predict(home_team, away_team, model_home, model_away, feature_columns, team_to_elo, team_to_conf, build_X)

# Result header
st.markdown("---")
c1, c2, c3 = st.columns([2, 1, 2])
with c1:
    st.metric(result['home'], f"Elo {result['h_elo']}")
with c2:
    st.markdown(f"<h2 style='text-align:center;margin-top:12px'>{result['score']}</h2>", unsafe_allow_html=True)
with c3:
    st.metric(result['away'], f"Elo {result['a_elo']}", delta_color="off")

# Win probabilities
st.markdown("#### Win probabilities")
p1, p2, p3 = st.columns(3)
p1.metric(f"{result['home']} win", f"{result['hw']}%")
p2.metric("Draw", f"{result['dp']}%")
p3.metric(f"{result['away']} win", f"{result['aw']}%")

# xG + match stats
st.markdown("#### Match stats")
m1, m2, m3, m4 = st.columns(4)
m1.metric("xG " + result['home'], result['hxg'])
m2.metric("xG " + result['away'], result['axg'])
m3.metric("Corners", result['corners'])
m4.metric("Yellow cards", result['yellow_cards'])

# Score probability grid (top 9 most likely)
st.markdown("#### Most likely scorelines")
grid_df = (
    pd.DataFrame(result['score_grid'].items(), columns=['Scoreline', 'Probability (%)'])
    .sort_values('Probability (%)', ascending=False)
    .head(9)
    .reset_index(drop=True)
)
st.dataframe(grid_df, use_container_width=True, hide_index=True)

st.markdown("---")
st.caption("Built by Phenny Mwaisaka · DataCamp WC 2026 Prediction Competition · Model: Poisson GLM + Elo ratings")