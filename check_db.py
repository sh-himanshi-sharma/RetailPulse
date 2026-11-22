import sqlite3
conn = sqlite3.connect('retailpulse.db')
cur = conn.cursor()
rows = cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print('Tables:', [r[0] for r in rows])
for r in rows:
    cnt = cur.execute('SELECT COUNT(*) FROM ' + r[0]).fetchone()[0]
    print('  ' + r[0] + ': ' + str(cnt))
conn.close()
