import sqlite3
import json


class Singleton(object):
    _instance = None

    def __new__(cls, *args, **kw):
        if not cls._instance:
            cls._instance = super(Singleton, cls).__new__(cls, *args, **kw)
            # 这里的super的意思是，该怎么走就怎么走。
        return cls._instance


class Db_Ctl(Singleton):
    def __init__(self):
        self.conn = sqlite3.connect('data.db')
        self.c = self.conn.cursor()
        try:
            self.c.execute('''
            create table if not exists transaction_log (trans_id text primary key not null, from_user text not null, to_user text not null, str_time text not null);
            ''')
            self.c.execute('''create table if not exists user_info
                (user_name  text    primary key     not null,
                user_hash   text    not null,
                wx_name     text,
                wx_image    text);''')
            self.c.execute('''create table if not exists tasks 
                (task_id integer primary key autoincrement, title text not null, uuid text not null, user_hash text not null, bonus integer nut null, description text, str_time text not null);''')
            self.conn.commit()
            print("create table transaction_log, user_info, tasks")
        except Exception as e:
            print("Exception: " + str(e))
            self.conn.rollback()

    def close(self):
        self.conn.close()

    def insert_transaction(self, from_user, to_user, transaction_id, str_time):
        sql_op = "insert into transaction_log (trans_id, from_user, to_user, str_time) values( \'%s\' , \'%s\' , \'%s\', \'%s\' )" % (
            transaction_id, from_user, to_user, str_time)
        try:
            self.c.execute(sql_op)
            self.conn.commit()
        except Exception as e:
            print("Exception: "+e)
            self.conn.rollback()

    def select_users_transaction(self, user_hash):
        sql_op = "select trans_id, str_time from transaction_log where from_user = \'%s\' or to_user = \'%s\'" % (
            user_hash, user_hash)
        print("select trans exe: %s" % (sql_op))
        cursor = self.c.execute(sql_op)
        ret = []
        for row in cursor:
            ret.append(row)
        print(ret)
        return ret

    def insert_user_info(self, user_name, user_hash, wx_name, wx_image):
        sql_op = "insert into user_info(user_name, user_hash, wx_name, wx_image) values(\'%s\' , \'%s\', \'%s\' , \'%s\')" % (
            user_name, user_hash, wx_name, wx_image)
        print("select user exe: %s" % (sql_op))
        try:
            self.c.execute(sql_op)
            self.conn.commit()
        except Exception as e:
            print("Exception: %s" % (e))
            self.conn.rollback()

    def select_user_hash(self, user_name):
        sql_op = "select user_hash from user_info where user_name = \'%s\'" % (
            user_name)
        print("select user hash sql: " + sql_op)
        cursor = self.c.execute(sql_op)
        first_res = cursor.fetchone()
        print("res fetchone: %s" % (str(first_res)))
        if str(first_res) == "None":
            return ""
        res = first_res[0]
        if str(res) == "None":
            print("select user hash null")
            return ""
        else:
            print("select user hash %s" % (str(res)))
            return str(res)

    def select_user_name(self, user_hash):
        sql_op = "select user_name from user_info where user_hash = \'%s\'" % (
            user_hash)
        print("select user name sql: " + sql_op)
        cursor = self.c.execute(sql_op)
        first_res = cursor.fetchone()
        print("res fetchone: %s" % (str(first_res)))
        if str(first_res) == "None":
            return ""
        res = first_res[0]
        if str(res) == "None":
            print("select user name null")
            return ""
        else:
            print("select user name %s" % (str(res)))
            return str(res)

    def select_user_info(self, user_name):
        sql_op = "select wx_name, wx_image from user_info where user_name= \'%s\'" % (
            user_name)
        print("select user hash sql: " + sql_op)
        cursor = self.c.execute(sql_op)
        first_res = cursor.fetchone()
        print("res fetchone: %s" % (str(first_res)))
        if str(first_res) == "None":
            print("wx_name  is null")
            return ""
        json_res = {}
        wxname = first_res[0]
        if str(wxname) == "None":
            print("wx_name  is null")
            return ""
        else:
            json_res["wx_name"] = wxname
            json_res["wx_image"] = first_res[1]
        return json.dumps(json_res)

    def insert_task(self, title, uuid, bonus, description, str_time):
        user_hash = self.select_user_hash(uuid)
        sql_op = "insert into tasks(task_id, title, uuid, user_hash, bonus, description, str_time) values(null, \'%s\', \'%s\', \'%s\', \'%s\', \'%s\', \'%s\')" % (
            title, uuid, user_hash, bonus, description, str_time)
        print("insert task %s" % (sql_op))
        try:
            self.c.execute(sql_op)
            self.conn.commit()
        except Exception as e:
            print("Exception: %s" % (e))
            self.conn.rollback()

    def select_task_remain(self):
        sql_op = "select task_id, title, uuid, user_hash, bonus, description from tasks"
        print("select_task_remain :%s" % (sql_op))
        cursor = self.c.execute(sql_op)
        res_cursor = cursor.fetchall()
        ret = []
        for row in res_cursor:
            uuid = row[2]
            json_user_info = self.select_user_info(uuid)
            if json_user_info == "":
                continue
            json_task = {"task_id": row[0], "title": row[1], "uuid": row[2], "user_hash": row[3], "bonus": row[4], 
                        "description": row[5], "wx_name":json.loads(json_user_info)["wx_name"], "wx_image":json.loads(json_user_info)["wx_image"]}
            ret.append(json_task)
            print("select task remain append %s" %(str(json_task)))
        return ret

    def complete_task(self, task_id):
        sql_op = "delete from tasks where task_id = %d" % (task_id)
        print("complete task %s" % (sql_op))
        try:
            self.c.execute(sql_op)
            self.conn.commit()
        except Exception as e:
            print("Exception: %s" % (e))
            self.conn.rollback()
            err = Exception("task complete error")
            raise err

    def get_task(self, task_id):
        sql_op = "select task_id, title, uuid, bonus, description from tasks where task_id = %d" % (
            task_id)
        print("get_task :%s" % (sql_op))
        cursor = self.c.execute(sql_op)
        first_res = cursor.fetchone()
        print("res fetchone: %s" % (str(first_res)))
        return first_res
