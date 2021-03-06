#!/usr/bin/python  
# coding=utf-8  

from flask import Flask, render_template, request, json
from db_ctl import Db_Ctl
from flask_cors import CORS

#from token_transaction import BlockChain
from db_transaction import BlockChain
import requests
import decimal
import time
import datetime
import sys

defaultencoding = 'utf-8'
if sys.getdefaultencoding() != defaultencoding:
    reload(sys)
    sys.setdefaultencoding(defaultencoding)


app = Flask(__name__)
CORS(app, supports_credentials=True)

token = ""
token_time = datetime.datetime.now()
expire = 0
def get_token():
    time = datetime.datetime.now()
    global token_time
    global expire
    global token
    if ((time-token_time).seconds > expire):
        # 请求token
        url = "https://api.weixin.qq.com/cgi-bin/token"
        appid = "wxa9ff3a8a8c5b5d84"
        secret = "76c073ec6a5f04e50e0ed4c2ce6dc8c5"
        grant_type = "client_credential"
        params = {"appid": appid, "secret": secret,
                    "grant_type": grant_type}
        res = requests.get(url=url, params=params)
        print("token get: %s" %(res.text))
        token_json = json.loads(res.text)
        token = token_json["access_token"]
        token_time = datetime.datetime.now()
        expire = token_json["expires_in"]
    return token

def get_check_res(content):
    get_token()
    url = "https://api.weixin.qq.com/wxa/msg_sec_check?access_token=%s" %(token)
    params = json.dumps({"content": content})
    res = requests.post(url, params)
    print("checking %s" %(str(params)))
    print("check ilegal: %s" %(res.text))
    res_json = json.loads(res.text)
    if res_json["errcode"] == 0:
        return True
    else:
        return False

@app.route('/')
def index():
    return ("Index Page.")

@app.route('/token', methods=['POST'])
def token():
    return get_token()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_data()
    print("data = " + str(data))
    try:
        js_code = str(json.loads(data)['js_code'])
        wx_name = str(json.loads(data)['wx_name'])
        wx_image = str(json.loads(data)['wx_image'])
        print("account = " + str(js_code))
        if js_code == 'None':
            return
        # 请求openid
        url = "https://api.weixin.qq.com/sns/jscode2session"
        appid = "wxa9ff3a8a8c5b5d84"
        secret = "76c073ec6a5f04e50e0ed4c2ce6dc8c5"
        grant_type = "authorization_code"
        params = {"appid": appid, "secret": secret,
                  "grant_type": grant_type, "js_code": js_code}
        res = requests.get(url=url, params=params)
        print(res.text)
        account = json.loads(res.text)["openid"]

        db_handler = Db_Ctl()
        bc = BlockChain()
        user_hash = db_handler.select_user_hash(account)
        if user_hash == "":
            user_hash = bc.add_user()
            db_handler.insert_user_info(account, user_hash, wx_name, wx_image)
            return ({"result_code": 0, "new_user": True, "openid": account})
        else:
            return ({"result_code": 0, "new_user": False, "openid": account})
    except Exception as e:
        print("login err: %s" % (e))
        return ({"result_code": 1, "reason": str(e)})


@app.route('/user_info', methods=['POST'])
def get_user_info():
    try:
        data = request.get_data()
        print("data = " + str(data))
        account = str(json.loads(data)['uuid'])
        db_handler = Db_Ctl()
        user_info = db_handler.select_user_info(account)
        return str(user_info)
    except Exception as e:
        print(" user_info Exception: %s" % (e))
        return json.dumps({"result_code": 6, "reason": str(e)})


@app.route('/index_page', methods=['POST'])
def index_page():
    try:
        db_handler = Db_Ctl()
        user_hash = db_handler.select_task_remain()
        print("index page: %s" %(user_hash))
        return json.dumps(user_hash)
    except Exception as e:
        print(" index_page Exception: %s" % (e))
        return json.dumps({"result_code": 6, "reason": str(e)})


@app.route('/transaction', methods=['POST'])
def transaction():
    try:
        data = request.get_data()
        print("data = " + str(data))
        from_account = str(json.loads(data)["from"])
        to_account = str(json.loads(data)["to"])
        value = str(json.loads(data)["bonus"])
        comment = str(json.loads(data)["description"])
        bool_check = get_check_res(comment)
        if bool_check == False:
            return json.dumps({"result_code": 6, "reason": "Ilegal description"})
        db_handler = Db_Ctl()
        to_user_hash = db_handler.select_user_hash(to_account)
        bc = BlockChain()
        if to_user_hash == "":
            return json.dumps({"result_code": 3, "reason": "transaction failed: to_user missing"})
        from_user_hash = db_handler.select_user_hash(from_account)
        if from_user_hash == "":
            return json.dumps({"result_code": 3, "reason": "transaction failed: from_user missing"})
        print("transaction: from: %s, to: %s, value:%s, comment:%s" %
              (from_user_hash, to_user_hash, value, comment))
        transaction_hash = bc.transaction(from_user_hash, to_user_hash, int(value), comment)
        if transaction_hash == "":
            return json.dumps({"result_code": 2, "reason": "transaction failed"})

        now = datetime.datetime.now()
        str_now = now.strftime("%Y-%m-%d %H:%M:%S")
        db_handler.insert_transaction(from_user_hash, to_user_hash, transaction_hash, str_now)
        return json.dumps({"result_code": 0, "reason": "transaction ok"})
    except Exception as e:
        print(" complete_task Exception: %s" % (e))
        return json.dumps({"result_code": 6, "reason": str(e)})


@app.route('/complete_task', methods=['POST'])
def complete_task():
    try:
        data = request.get_data()
        print("data = " + str(data))
        task_id = json.loads(data)["task_id"]
        to_account = str(json.loads(data)["uuid"])
        db_handler = Db_Ctl()
        task = db_handler.get_task(task_id)
        if str(task) == "None":
            return json.dumps({"result_code": 5, "reason": "404, not this task"})
        title = task[1]
        from_account = task[2]
        bonus = task[3]
        description = task[4]
        to_user_hash = db_handler.select_user_hash(to_account)
        bc = BlockChain()
        if to_user_hash == "":
            return json.dumps({"result_code": 3, "reason": to_account})
        from_user_hash = db_handler.select_user_hash(from_account)
        if from_user_hash == "":
            return json.dumps({"result_code": 3, "reason": from_account})
        print("transaction: from: %s, to: %s, value:%s, comment:%s" %
              (from_user_hash, to_user_hash, bonus, title))
        transaction_hash = bc.transaction(from_user_hash, to_user_hash, int(bonus), title)
        if transaction_hash == "":
            return json.dumps({"result_code": 5, "reason": "transaction failed"})
        print("transa_hash: %s" %(transaction_hash))
        now = datetime.datetime.now()
        str_now = now.strftime("%Y-%m-%d %H:%M:%S")
        db_handler.insert_transaction(from_user_hash, to_user_hash, transaction_hash, str_now)
        db_handler.complete_task(task_id)
        return json.dumps({"result_code": 0, "reason": "task complete ok"})
    except Exception as e:
        print(" complete_task Exception: %s" % (e))
        return json.dumps({"result_code": 6, "reason": str(e)})


@app.route('/my_log', methods=['POST'])
def search():
    try:
        data = request.get_data()
        from_account = str(json.loads(data)["uuid"])
        db_handler = Db_Ctl()
        from_user_hash = db_handler.select_user_hash(from_account)
        if from_user_hash == "":
            return json.dumps({"result_code": 3, "reason": "no such account!"})
        trans_ids = db_handler.select_users_transaction(from_user_hash)
        if trans_ids == "":
            return json.dumps()
        bc = BlockChain()
        res = []
        print("select_users_transaction %s :" % (from_user_hash))
        for transaction_id in trans_ids:
            print("search log: tran_info :%s, time:%s" %
                    (transaction_id[0], transaction_id[1]))
            trans_info = bc.get_transaction_info(transaction_id[0])
            if trans_info["result_code"] == -1:
                return json.dumps({"result_code" : 0, "reason": "No Transaction"})
            str_time = transaction_id[1]
            from_hash = trans_info["from_hash"]
            to_hash = trans_info["to_hash"]
            from_user = db_handler.select_user_name(from_hash)
            to_user = db_handler.select_user_name(to_hash)
            transaction_info = {
                "from": from_user,
                "to": to_user,
                "bonus": str(decimal.Decimal(trans_info["value"]).quantize(decimal.Decimal('0.00'))),
                "comment": trans_info["comment"],
                "time": str_time,
                "user_hash" : transaction_id[0]
            }
            res.append(transaction_info)
        return json.dumps(res)
    except Exception as e:
        print("my_log %s" % (e))
        return json.dumps({"result_code": 6, "reason": str(e)})


@app.route('/insert_task', methods=['POST'])
def insert_task():
    try:
        data = request.get_data()
        print("data = " + str(data))
        title = str(json.loads(data)["title"])
        bonus = json.loads(data)["bonus"]
        description = str(json.loads(data)["description"])
        bool_check = get_check_res(description)
        if bool_check == False:
            return json.dumps({"result_code": 6, "reason": "Ilegal description"})
        bool_check = get_check_res(title)
        if bool_check == False:
            return json.dumps({"result_code": 6, "reason": "Ilegal title"})
        uuid = str(json.loads(data)["uuid"])
        now = datetime.datetime.now()
        str_now = now.strftime("%Y-%m-%d %H:%M:%S")
        db_handler = Db_Ctl()
        db_handler.insert_task(title, uuid, bonus, description, str_now)
        return json.dumps({"result_code": 0, "reason": "insert transaction ok"})
    except Exception as e:
        print("insert_task %s" % (e))
        return json.dumps({"result_code": 6, "reason": str(e)})


@app.route('/my_wallet', methods=['POST'])
def my_wallet():
    try:
        data = request.get_data()
        uuid = str(json.loads(data)['uuid'])
        bc = BlockChain()
        db_handler = Db_Ctl()
        user_hash = db_handler.select_user_hash(uuid)
        balance = bc.get_balance(user_hash)
        return json.dumps({"wallet": balance, "user_hash": user_hash})
    except Exception as e:
        print("my_wallet %s" % (e))
        return json.dumps({"result_code": 6, "reason": str(e)})


@app.route('/search_log', methods=['POST'])
def my_log():
    try:
        db_handler = Db_Ctl()
        data = request.get_data()
        print("data = " + str(data))
        uuid = str(json.loads(data)["uuid"])
        db_handler = Db_Ctl()
        tasks = db_handler.select_task_remain()
        print("index page %s" %(str(tasks)))
        return json.dumps(tasks)
    except Exception as e:
        print("search_log %s" % (e))
        return json.dumps({"result_code": 6, "reason": str(e)})


if __name__ == '__main__':
    app.run('0.0.0.0')
