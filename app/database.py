#%%
import sqlite3
from sqlite3 import Error

def create_con(db_file):
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except Error as e:
        print(e)

def create_table(conn, create_table_sql):
    try:
        c = conn.cursor()
        c.execute(create_table_sql)
        conn.commit()
    except Error as e:
        print(e)

def create_pred(conn, prediction):
    print(prediction)
    sql = """ INSERT INTO predictions(date, ip, image_path, prediction, actual, abs_error)
              VALUES(DATE('now'),?,?,?,?,?) """
    cur = conn.cursor()
    cur.execute(sql,prediction)
    conn.commit()
    return cur.lastrowid

def do_sql(conn,sql):
    cur = conn.cursor()
    cur.execute(sql)
    rows = cur.fetchall()
    for row in rows:
        print(row)

def count_predictions(conn):
    cur = conn.cursor()
    return cur.execute("SELECT COUNT (*) FROM predictions;").fetchall()[0][0]

def count_distinct_predictions(conn):
    cur = conn.cursor()
    return cur.execute("SELECT COUNT(*) FROM (SELECT DISTINCT * FROM predictions);").fetchall()[0][0]


def del_all_records(conn):
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS predictions")
    cur.execute("DROP TABLE IF EXISTS games")
    conn.commit()


from sqlalchemy import create_engine

def open_db(name):
    sql_create_table_predictions = """ CREATE TABLE IF NOT EXISTS predictions(
                                        prediction_id integer PRIMARY KEY,
                                        date text NOT NULL,
                                        ip text NOT NULL,
                                        image_path text NOT NULL,
                                        prediction integer NOT NULL,
                                        actual integer NOT NULL,
                                        abs_error integer NOT NULL)
                                    """

    conn = create_con(name)

    if conn:
        engine = create_engine('sqlite:///%s' % 'hi.db', echo=True)
        # c = conn.cursor()
        # c.execute(""" DROP TABLE IF EXISTS games""")
        # create_table(conn, sql_create_table_games)
        # c.execute(""" DROP TABLE IF EXISTS predictions""")
        create_table(conn, sql_create_table_predictions)
        
    return conn

def print_db(conn):
    for i in conn.cursor().execute("SELECT * FROM predictions"):
        print(i)

def human_mae(conn):
    cur = conn.cursor()
    return cur.execute("SELECT AVG(abs_error) FROM predictions").fetchall()[0][0]


#%%
# conn = open_db('predictions.db')
# c = count_predictions(conn)
# print_db(conn)

# # # %%
# h = human_mae(conn)
# h
# %%