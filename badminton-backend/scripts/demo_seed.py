#!/usr/bin/env python3
"""
Generate demo seed SQL for the performance dashboard.
Usage: python3 demo_seed.py | docker exec -i badminton_postgres psql -U badminton_user -d badminton_training
"""
import uuid
import random
from datetime import datetime, timedelta

random.seed(42)  # reproducible

ATHLETE_ID = 'dd000001-dead-beef-0000-000000000001'
COACH_ID = 'ee2c88c0-db8b-4ba1-81a1-19113cf0809f'  # demo@gmail.com

BASE_DATE = datetime(2026, 3, 23, 10, 0, 0)

# Template target dots (meters, from broker.service.ts cm/100)
TEMPLATE_DOTS = {
    'template-001': [(0.46, -6.70), (5.64, -2.36), (5.64, 0.00)],
    'template-002': [(5.64, -6.70), (0.46, -3.21), (0.46, 0.00)],
    'template-003': [(0.46, -6.70), (0.46, 0.00), (5.64, -1.75), (5.64, 0.00)],
}

# Sessions to create: (template_id, weeks_ago, in_box_pattern, rating, notes)
# in_box_pattern: list of True/False per shot (12 shots each session)
# Shot order for 3-pos template: positions 0,1,2,0,1,2,0,1,2,0,1,2
# Shot order for 4-pos template: positions 0,1,2,3,0,1,2,3,0,1,2,3

def make_pattern_3pos(pos0_boxes, pos1_boxes, pos2_boxes):
    """Interleave 3 position patterns into shot sequence."""
    result = []
    for i in range(4):
        result.append(pos0_boxes[i])
        result.append(pos1_boxes[i])
        result.append(pos2_boxes[i])
    return result

def make_pattern_4pos(pos0_boxes, pos1_boxes, pos2_boxes, pos3_boxes):
    """Interleave 4 position patterns into shot sequence."""
    result = []
    for i in range(3):
        result.append(pos0_boxes[i])
        result.append(pos1_boxes[i])
        result.append(pos2_boxes[i])
        result.append(pos3_boxes[i])
    return result

SESSIONS = [
    # --- Template-001: 6 sessions showing clear improvement ---
    {
        'template': 'template-001',
        'weeks_ago': 8,
        'in_box': make_pattern_3pos(
            [False, False, False, False],  # pos0: baseline, hardest
            [False, True,  False, False],  # pos1: mid-court
            [True,  False, False, False],  # pos2: net, easiest
        ),
        'rating': 2,
        'notes': 'First session with template. Still getting familiar with target zones.',
        'in_box_acc_range': (55, 65),
        'out_acc_range': (300, 500),
        'vel_range': (175, 220),
    },
    {
        'template': 'template-001',
        'weeks_ago': 6,
        'in_box': make_pattern_3pos(
            [False, False, False, False],
            [False, True,  False, False],
            [True,  False, True,  False],
        ),
        'rating': 2,
        'notes': 'Net shots improving. Baseline still challenging.',
        'in_box_acc_range': (55, 70),
        'out_acc_range': (250, 450),
        'vel_range': (180, 230),
    },
    {
        'template': 'template-001',
        'weeks_ago': 5,
        'in_box': make_pattern_3pos(
            [False, False, False, False],
            [False, True,  False, True ],
            [True,  False, True,  False],
        ),
        'rating': 3,
        'notes': 'Good progress on mid-court shots.',
        'in_box_acc_range': (40, 65),
        'out_acc_range': (200, 400),
        'vel_range': (185, 240),
    },
    {
        'template': 'template-001',
        'weeks_ago': 3,
        'in_box': make_pattern_3pos(
            [False, False, False, True ],
            [True,  False, False, True ],
            [True,  False, True,  False],
        ),
        'rating': 3,
        'notes': 'First successful baseline hit. Consistency building.',
        'in_box_acc_range': (35, 60),
        'out_acc_range': (180, 350),
        'vel_range': (190, 245),
    },
    {
        'template': 'template-001',
        'weeks_ago': 2,
        'in_box': make_pattern_3pos(
            [False, False, True,  False],
            [True,  False, False, True ],
            [True,  True,  True,  False],
        ),
        'rating': 4,
        'notes': 'Best session so far. Net shots very consistent.',
        'in_box_acc_range': (25, 55),
        'out_acc_range': (150, 300),
        'vel_range': (195, 255),
    },
    {
        'template': 'template-001',
        'weeks_ago': 1,
        'in_box': make_pattern_3pos(
            [False, True,  False, True ],
            [True,  False, True,  False],
            [True,  True,  True,  False],
        ),
        'rating': 4,
        'notes': 'Excellent baseline improvement. Ready to increase difficulty.',
        'in_box_acc_range': (20, 50),
        'out_acc_range': (120, 250),
        'vel_range': (200, 260),
    },

    # --- Template-002: 4 sessions, stable ~40% ---
    {
        'template': 'template-002',
        'weeks_ago': 7,
        'in_box': make_pattern_3pos(
            [False, False, True,  False],
            [True,  False, True,  False],
            [True,  True,  False, False],
        ),
        'rating': 3,
        'notes': 'Template-002 debut. Left side feels more natural.',
        'in_box_acc_range': (35, 65),
        'out_acc_range': (200, 420),
        'vel_range': (180, 235),
    },
    {
        'template': 'template-002',
        'weeks_ago': 5,
        'in_box': make_pattern_3pos(
            [False, True,  False, False],
            [True,  False, True,  False],
            [True,  True,  False, True ],
        ),
        'rating': 3,
        'notes': 'Net left zone shots are strong. Baseline right needs work.',
        'in_box_acc_range': (30, 60),
        'out_acc_range': (180, 380),
        'vel_range': (185, 240),
    },
    {
        'template': 'template-002',
        'weeks_ago': 3,
        'in_box': make_pattern_3pos(
            [False, False, True,  False],
            [True,  False, False, True ],
            [True,  True,  True,  False],
        ),
        'rating': 4,
        'notes': 'Consistent performance. Adding more power to shots.',
        'in_box_acc_range': (25, 55),
        'out_acc_range': (160, 330),
        'vel_range': (195, 255),
    },
    {
        'template': 'template-002',
        'weeks_ago': 1,
        'in_box': make_pattern_3pos(
            [False, True,  False, False],
            [True,  False, True,  True ],
            [True,  True,  False, True ],
        ),
        'rating': 4,
        'notes': 'Very good session. Mid-court left now reliable.',
        'in_box_acc_range': (20, 50),
        'out_acc_range': (140, 290),
        'vel_range': (200, 265),
    },

    # --- Template-003: 3 sessions, 4-pos, still learning ---
    {
        'template': 'template-003',
        'weeks_ago': 4,
        'in_box': make_pattern_4pos(
            [False, False, False],  # pos0: baseline
            [True,  False, False],  # pos1: net left
            [False, False, True ],  # pos2: mid-court right
            [True,  False, False],  # pos3: net right
        ),
        'rating': 2,
        'notes': 'First attempt with 4-position template. Very challenging pattern.',
        'in_box_acc_range': (40, 70),
        'out_acc_range': (250, 500),
        'vel_range': (175, 225),
    },
    {
        'template': 'template-003',
        'weeks_ago': 2,
        'in_box': make_pattern_4pos(
            [False, False, False],
            [True,  False, True ],
            [True,  False, False],
            [True,  True,  False],
        ),
        'rating': 3,
        'notes': 'Net positions improving well. Still missing baseline target.',
        'in_box_acc_range': (30, 60),
        'out_acc_range': (190, 400),
        'vel_range': (183, 238),
    },
    {
        'template': 'template-003',
        'weeks_ago': 0,
        'in_box': make_pattern_4pos(
            [True,  False, False],
            [True,  True,  False],
            [True,  False, True ],
            [True,  True,  False],
        ),
        'rating': 4,
        'notes': 'Great session! First baseline hit on template-003. Net shots very consistent.',
        'in_box_acc_range': (20, 55),
        'out_acc_range': (150, 320),
        'vel_range': (192, 258),
    },
]

def sql_str(v):
    if v is None:
        return 'NULL'
    return f"'{v}'"

def sql_num(v, decimals=2):
    if v is None:
        return 'NULL'
    return f"{v:.{decimals}f}"

lines = []

lines.append("-- Demo seed data for performance dashboard")
lines.append("-- Clean up any existing demo data first")
lines.append(f"DELETE FROM training_sessions WHERE athlete_id = '{ATHLETE_ID}';")
lines.append(f"DELETE FROM athletes WHERE id = '{ATHLETE_ID}';")
lines.append("")

lines.append("-- Create demo athlete")
lines.append(f"""INSERT INTO athletes (id, athlete_name, date_of_birth, gender, skill_level, height_cm, dominant_hand, notes, coach_id, created_at, updated_at)
VALUES (
  '{ATHLETE_ID}',
  'Demo Player',
  '2001-05-20',
  'male',
  'intermediate',
  175.00,
  'right',
  'Demo athlete for performance dashboard showcase.',
  '{COACH_ID}',
  NOW(),
  NOW()
);""")
lines.append("")

for session_def in SESSIONS:
    session_id = str(uuid.uuid4())
    template = session_def['template']
    dots = TEMPLATE_DOTS[template]
    n_positions = len(dots)
    in_box_pattern = session_def['in_box']
    n_shots = len(in_box_pattern)
    weeks_ago = session_def['weeks_ago']
    in_box_lo, in_box_hi = session_def['in_box_acc_range']
    out_lo, out_hi = session_def['out_acc_range']
    vel_lo, vel_hi = session_def['vel_range']

    session_date = BASE_DATE - timedelta(weeks=weeks_ago, hours=random.randint(0, 8))

    # Build shots
    shots = []
    total_acc_pct = 0.0
    total_vel = 0.0
    successful = 0

    for i in range(n_shots):
        pos_idx = i % n_positions
        is_in_box = in_box_pattern[i]
        tx, ty = dots[pos_idx]

        if is_in_box:
            acc_cm = random.uniform(in_box_lo, in_box_hi)
            # Slight directional offset within box
            angle = random.uniform(0, 6.28)
            import math
            offset = acc_cm / 100.0  # cm to meters
            lx = tx + offset * math.cos(angle)
            ly = ty + offset * math.sin(angle)
            successful += 1
        else:
            acc_cm = random.uniform(out_lo, out_hi)
            angle = random.uniform(0, 6.28)
            import math
            offset = acc_cm / 100.0
            lx = tx + offset * math.cos(angle)
            ly = ty + offset * math.sin(angle)

        acc_pct = max(0.0, 100.0 - acc_cm * 0.5)
        score = max(0.0, (200.0 - acc_cm) / 2.0)
        total_acc_pct += acc_pct
        vel = random.uniform(vel_lo, vel_hi)
        total_vel += vel
        shot_ts = session_date + timedelta(seconds=i * 30 + random.randint(0, 10))

        shots.append({
            'shot_number': i + 1,
            'pos_idx': pos_idx,
            'is_in_box': is_in_box,
            'acc_cm': acc_cm,
            'acc_pct': acc_pct,
            'score': score,
            'vel': vel,
            'tx': tx, 'ty': ty,
            'lx': lx, 'ly': ly,
            'ts': shot_ts,
            'was_successful': is_in_box,
        })

    avg_acc = total_acc_pct / n_shots
    avg_vel = total_vel / n_shots
    avg_score = sum(s['score'] for s in shots) / n_shots
    session_end = session_date + timedelta(minutes=random.randint(8, 15))
    rating = session_def.get('rating')
    notes = session_def.get('notes', '')

    lines.append(f"-- Session: {template}, {weeks_ago} weeks ago, {sum(in_box_pattern)}/{n_shots} in-box")
    lines.append(f"""INSERT INTO training_sessions (id, athlete_id, coach_id, template_id, status, start_time, end_time, total_shots, successful_shots, average_accuracy_percent, average_shot_velocity_kmh, average_score, session_rating, session_notes, created_at, updated_at)
VALUES (
  '{session_id}',
  '{ATHLETE_ID}',
  '{COACH_ID}',
  '{template}',
  'completed',
  '{session_date.strftime('%Y-%m-%d %H:%M:%S')}',
  '{session_end.strftime('%Y-%m-%d %H:%M:%S')}',
  {n_shots},
  {successful},
  {avg_acc:.2f},
  {avg_vel:.2f},
  {avg_score:.2f},
  {rating if rating else 'NULL'},
  {sql_str(notes)},
  NOW(),
  NOW()
);""")

    # Batch insert shots
    shot_values = []
    for s in shots:
        shot_values.append(
            f"  (uuid_generate_v4(), '{session_id}', {s['shot_number']}, "
            f"'{s['ts'].strftime('%Y-%m-%d %H:%M:%S')}', "
            f"{s['lx']:.4f}, {s['ly']:.4f}, "
            f"{s['tx']:.4f}, {s['ty']:.4f}, "
            f"{s['acc_cm']:.2f}, {s['acc_pct']:.2f}, "
            f"{s['vel']:.2f}, "
            f"{'true' if s['was_successful'] else 'false'}, "
            f"{'true' if s['is_in_box'] else 'false'}, "
            f"{s['pos_idx']}, "
            f"0.950, "
            f"{s['score']:.2f})"
        )

    shot_rows = ',\n'.join(shot_values)
    lines.append(f"""INSERT INTO shots (id, session_id, shot_number, timestamp, landing_position_x, landing_position_y, target_position_x, target_position_y, accuracy_cm, accuracy_percent, velocity_kmh, was_successful, in_box, target_position_index, detection_confidence, score)
VALUES
{shot_rows};""")
    lines.append("")

lines.append("-- Summary")
lines.append(f"SELECT athlete_name, skill_level FROM athletes WHERE id = '{ATHLETE_ID}';")
lines.append(f"SELECT template_id, status, total_shots, average_accuracy_percent, session_rating FROM training_sessions WHERE athlete_id = '{ATHLETE_ID}' ORDER BY start_time;")

print('\n'.join(lines))
