# Performance Dashboard Demo Guide

## Prerequisites

Ensure both services are running before starting:

```bash
# Terminal 1 – Backend
cd badminton-backend
docker-compose up -d

# Terminal 2 – Frontend
cd badminton-frontend
npm start
```

Open the app at **http://localhost:3000**

---

## Demo Credentials

| Field    | Value              |
|----------|--------------------|
| Email    | `demo@gmail.com`   |
| Password | `demo1234`         |

> Alternatively, use any existing coach account. The demo data is tied to athlete **"Demo Player"** and is visible to all coaches.

---

## Demo Walkthrough

### 1. Log In and Navigate

1. Log in with your coach credentials
2. Click **Performance Dashboard** in the navigation bar

---

### 2. Select the Demo Athlete

- In the **Athlete** dropdown, select **Demo Player** (intermediate)
- The page will load **13 completed sessions** across 3 templates

**Talk point:** All overview stats (sessions, shots, accuracy, velocity) reflect the filtered dataset.

---

### 3. Session Filter – Focus the View

The **All / Latest 5 / Latest 10 / Latest 20** toggle controls what all panels show.

| Filter    | What you see |
|-----------|--------------|
| **All**   | All 13 sessions – full history |
| **Latest 10** | The 10 most recent sessions |
| **Latest 5**  | Only the 5 most recent – highest performance |

**Demo:** Switch between All and Latest 5 and watch the overview accuracy stat jump — this shows the athlete's recent improvement vs overall average.

---

### 4. Template Performance – Template-001

Template-001 has **6 sessions** showing a clear improvement arc.

#### Per-Position Cards

Three zones cycle during every training session:

| Card | Zone | Difficulty |
|------|------|------------|
| Position 1 | Baseline corner | Hardest |
| Position 2 | Mid-court right | Medium |
| Position 3 | Net right | Easiest |
| Overall | All shots combined | — |

Each card shows:
- **Accuracy %** – average shot accuracy for that zone
- **In-Box %** – percentage of shots that landed inside the target box
- **Score** – shot score (if available)

**Expect to see:** Position 3 (net) has the highest in-box %, Position 1 (baseline) the lowest — this reflects realistic difficulty.

#### Accuracy Trend Chart

The line chart shows accuracy per session over time, one line per position plus an Overall line.

**Demo:** Point to the upward trend on all lines from 8 weeks ago → 1 week ago. The athlete went from ~10% accuracy to ~58% on this template.

---

### 5. Template Performance – Template-002

Template-002 has **4 sessions** showing a **consistent ~40% performance plateau**.

- The trend chart shows flatter lines compared to Template-001
- Position 3 (net left) remains the strongest zone

**Talk point:** Compare to Template-001 — the athlete has trained Template-002 for less total time, but performance is already stable. This is where you'd decide: push harder, or add difficulty?

---

### 6. Template Performance – Template-003

Template-003 has **3 sessions** — the newest pattern with **4 rotating positions**.

- Earliest session: ~18% accuracy (still learning the 4-position cycle)
- Latest session: ~50% accuracy (rapid improvement in just 3 sessions)
- The trend chart shows the steepest improvement curve of all three templates

**Talk point:** 4-position templates are harder but the athlete adapts quickly. The trend chart is your early warning system — if the line were flat or declining, you'd know to slow down.

---

### 7. No-Data Template Message

If you switch athlete to someone with **no template sessions**, each Template Performance section shows:

> *"No sessions found with this template for the selected athlete and filter."*

This prevents confusion — the dashboard never shows empty charts or zeroes.

---

### 8. Training History Table

At the bottom, the **Training History** table lists all sessions in the current filter.

- Click any row (or **View**) to open the full **Session Detail** page — court visualization, shot-by-shot table, and timeline
- Table auto-updates when you change the session filter

---

## Key Talking Points Summary

| Feature | What it demonstrates |
|---------|----------------------|
| Session filter | Coaches can focus on recent form vs long-term history |
| Per-position accuracy | Identifies weak zones that need drilling |
| In-Box % | Measures precision, not just proximity |
| Trend chart | Visualizes improvement over time, per zone |
| 3 templates shown together | Holistic view of multi-pattern training progress |
| Empty state messages | Graceful handling of missing data |

---

## Seeded Data Summary

The following data was inserted for **Demo Player** (coach: `demo@gmail.com`):

| Template | Sessions | Date Range | Trend |
|----------|----------|------------|-------|
| template-001 | 6 | 8 weeks ago → 1 week ago | Strong improvement: 12% → 58% |
| template-002 | 4 | 7 weeks ago → 1 week ago | Stable: 32% → 51% |
| template-003 | 3 | 4 weeks ago → this week | Fast learner: 18% → 50% |

Each session contains **12 shots** cycling through all template positions. Shot data includes landing positions, accuracy, in-box detection, and velocity.

---

## Re-seeding Data

If you need to reset the demo data:

```bash
cd badminton-backend
python3 scripts/demo_seed.py | docker exec -i badminton_postgres psql -U badminton_user -d badminton_training
```

The script deletes and re-inserts all Demo Player data cleanly.
