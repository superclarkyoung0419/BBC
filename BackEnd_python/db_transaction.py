import sqlite3
import hashlib
import random

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
                trans_id    text    primary key ,
                from_hash   text    not null,
                to_hash     text    not null,
                bonus       integer not null,
                comment     text    not null
            )
            ''')
            self.c.execute('''
            create table if not exists user_balance (
                user_hash   text        primary key ,
                balance     integer     not null 
            )
            ''')
            print ("create table transaction_detail, user_balance")
            self.conn.commit()
        except Exception as e:
            print(" __init__ Exception: " + str(e))
            self.conn.rollback()

    def add_user(self):
        seed = random.random()
        user_hash_str = hashlib.sha224(str(seed).encode("utf8")).hexdigest()
        user_hash_str = '0x' + user_hash_str
        sql_op = "insert into user_balance(user_hash, balance) values(\'%s\', %d)" % (user_hash_str, 100)
        print("insert task %s" % (sql_op))
        try:
            self.c.execute(sql_op)
            self.conn.commit()
            return user_hash_str
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
            return {"result_code" : -1, "reason": "No Transaction"}
        return {
            "result_code" : 0,
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
        seed = random.random()
        trans_hash_str = hashlib.sha224(str(seed).encode("utf8")).hexdigest()
        trans_hash_str = '0x' + trans_hash_str
        sql_op = "insert into transaction_detail(trans_id, from_hash, to_hash, bonus, comment) values(\'%s\', \'%s\', \'%s\', %d, \'%s\') " % (
            trans_hash_str, from_user_hash, to_user_hash, value, comment)
        from_balance = self.get_balance(from_user_hash)
        if from_balance < value:
            return ""
        if from_user_hash == to_user_hash :
            self.c.execute(sql_op)
            self.conn.commit()
            return trans_hash_str
        to_balance = self.get_balance(to_user_hash)
        sql_op1 = "update user_balance set balance = %d where user_hash = \'%s\' " % (from_balance-value, from_user_hash)
        sql_op2 = "update user_balance set balance = %d where user_hash = \'%s\' " % (to_balance+value, to_user_hash)
        try:
            self.c.execute(sql_op)
            self.c.execute(sql_op1)
            self.c.execute(sql_op2)
            self.conn.commit()
            print(sql_op)
            print(sql_op1)
            print(sql_op2)
            return trans_hash_str
        except Exception as e:
            print("transaction Exception: %s" % (e))
            self.conn.rollback()
            return ""
