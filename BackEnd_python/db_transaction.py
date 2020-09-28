import sqlite3


class Singleton(object):
    _instance = None

    def __new__(cls, *args, **kw):
        if not cls._instance:
            cls._instance = super(Singleton, cls).__new__(cls, *args, **kw)
            # 这里的super的意思是，该怎么走就怎么走。
        return cls._instance


class BlockChain(Singleton):
    def __init__(self, *args, **kwargs):
        self.conn = sqlite3.connect('trans.db')
        self.c = self.conn.cursor()
        try:
            self.c.execute('''
            create table if not exists transaction_detail (
                trans_id integer primary key autoincrement,
                from_hash   text not null,
                to_hash     text not null,
                bonus       integer not null,
                comment     text    not null
            )
            ''')
            self.c.execute('''
            create table if not exists user_balance (
                user_hash   integer primary key autoincrement,
                balance     integer     not null 
            )
            ''')
            print ("create table transaction_detail, user_balance")
            self.conn.commit()
        except Exception as e:
            print(" __init__ Exception: " + str(e))
            self.conn.rollback()

    def add_user(self):
        sql_op = "insert into user_balance(user_hash, balance) values(null, %d)" % (100)
        sql_op1 = "select max(user_hash) from user_balance"
        print("insert task %s" % (sql_op))
        try:
            self.c.execute(sql_op)
            sel_cursor = self.c.execute(sql_op1)
            self.conn.commit()
            res = sel_cursor.fetchone()
            return res[0]
        except Exception as e:
            print("add_user Exception: %s" % (e))
            self.conn.rollback()
            return ""

    def get_transaction_info(self, trans_hash):
        sql_op = "select from_hash, to_hash, bonus, comment from transaction_detail where trans_id = \'%s\' " %(trans_hash)
        print("get transaction_detail %s" % (sql_op))
        cursor = self.c.execute(sql_op)
        ret = []
        first_res = cursor.fetchone()
        print("res fetchone: %s" % (str(first_res)))
        if str(first_res) == "None":
            return ""
        return {
            "from_hash": first_res[0],
            "to_hash": first_res[1],
            "value": first_res[2],
            "comment": first_res[3]
        }

    def get_balance(self, user_hash):
        sql_op = "select balance from user_balance where user_hash = \'%s\'" % (
            user_hash)
        print("get_balance %s" % (sql_op))
        cursor = self.c.execute(sql_op)
        ret = []
        first_res = cursor.fetchone()
        print("res fetchone: %s" % (str(first_res)))
        if str(first_res) == "None":
            return 0
        return (int)(first_res[0])

    def transaction(self, from_user_hash, to_user_hash, value, comment):
        sql_op = "insert into transaction_detail(trans_id, from_hash, to_hash, bonus, comment) values(null, \'%s\', \'%s\', %d, \'%s\') " % (
            from_user_hash, to_user_hash, value, comment)
        from_balance = self.get_balance(from_user_hash)
        if from_balance < value:
            return ("fund insufficient.")
        to_balance = self.get_balance(to_user_hash)
        sql_op1 = "update user_balance set balance = %d where user_hash = \'%s\' " % (from_balance-value, from_user_hash)
        sql_op2 = "update user_balance set balance = %d where user_hash = \'%s\' " % (to_balance+value, to_user_hash)
        sql_op3 = "select max(trans_id) from transaction_detail"
        try:
            self.c.execute(sql_op)
            self.c.execute(sql_op1)
            self.c.execute(sql_op2)
            self.conn.commit()
            curs = self.c.execute(sql_op3)
            res = curs.fetchone()
            return str(res[0])
        except Exception as e:
            print("transaction Exception: %s" % (e))
            self.conn.rollback()
            return ""
