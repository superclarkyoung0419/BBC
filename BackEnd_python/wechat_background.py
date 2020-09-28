# coding=utf8
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


@app.route('/')
def index():
    return ("Index Page.")

@app.route('/token', methods=['GET'])
def token():
    data = request.get_data()
    print("data = " + str(data))
    if data == 'bbc':
        return "200"
    else:
        return "404"


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

        #请求openid
        url = "https://api.weixin.qq.com/sns/jscode2session"
        appid = "wxa9ff3a8a8c5b5d84"
        secret = "76c073ec6a5f04e50e0ed4c2ce6dc8c5"
        grant_type = "authorization_code"
        params = {"appid": appid, "secret": secret, "grant_type": grant_type, "js_code": js_code}
        res = requests.get(url = url, params = params)
        print(res.text)
        account = json.loads(res.text)["openid"]


        db_handler = Db_Ctl()
        bc = BlockChain()
        user_hash = db_handler.select_user_hash(account)
        if user_hash == "":
            user_hash = bc.add_user()
            db_handler.insert_user_info(account, user_hash, wx_name, wx_image)
            return ({"new_user": True, "openid": account})
        else:
            return ({"new_user": False, "openid": account})
    except Exception as e:
        print("login err: %s" %(e))
        return ({"result_code": 1, "reason": str(e)})

@app.route('/user_info', methods=['POST'])
def get_user_info():
    data = request.get_data()
    print("data = " + str(data))
    account = str(json.loads(data)['uuid'])
    db_handler = Db_Ctl()
    user_info = db_handler.select_user_info(account)
    return str(user_info)


@app.route('/index_page', methods=['POST'])
def index_page():
    db_handler = Db_Ctl()
    user_hash = db_handler.select_task_remain()
    return json.dumps(user_hash)


@app.route('/transaction', methods=['POST'])
def transaction():
    data = request.get_data()
    print("data = " + str(data))
    from_account = str(json.loads(data)["from_user"])
    to_account = str(json.loads(data)["to_user"])
    value = str(json.loads(data)["value"])
    comment = str(json.loads(data)["comment"])
    db_handler = Db_Ctl()
    to_user_hash = db_handler.select_user_hash(to_account)
    bc = BlockChain()
    if to_user_hash == "":
        #to_user_hash = bc.add_user()
        #print("trans: add_user %s" % (to_user_hash))
        #db_handler.insert_user_info(to_account, to_user_hash)
        return json.dumps("transaction failed: to_user missing")
    from_user_hash = db_handler.select_user_hash(from_account)
    if from_user_hash == "":
        #from_user_hash = bc.add_user()
        #print("trans: add_user %s" % (from_user_hash))
        #db_handler.insert_user_info(from_account, from_user_hash)
        return json.dumps("transaction failed: from_user missing")
    print("transaction: from: %s, to: %s, value:%s, comment:%s" %
          (from_user_hash, to_user_hash, value, comment))
    transaction_hash = bc.transaction(
        from_user_hash, to_user_hash, int(value), comment)
    if transaction_hash == "":
        return json.dumps({"result_code":5, "reason":"transaction failed"})

    now = datetime.datetime.now()
    str_now = now.strftime("%Y-%m-%d %H:%M:%S")
    db_handler.insert_transaction(
        from_user_hash, to_user_hash, transaction_hash, str_now)
    return json.dumps({"result_code":0, "reason":"transaction ok"})


@app.route('/complete_task', methods=['POST'])
def complete_task():
    data = request.get_data()
    print("data = " + str(data))
    task_id = json.loads(data)["task_id"]
    to_account = str(json.loads(data)["uuid"])
    db_handler = Db_Ctl()
    try:
        task = db_handler.get_task(task_id)
        if str(task) == "None":
            return json.dumps({"result_code":5, "reason":"404, not this task"})
        title = task[1]
        from_account = task[2]
        bonus = task[3]
        description = task[4]
        to_user_hash = db_handler.select_user_hash(to_account)
        bc = BlockChain()
        if to_user_hash == "":
            #to_user_hash = bc.add_user()
            #print("trans: add_user %s" % (to_user_hash))
            #db_handler.insert_user_info(to_account, to_user_hash)
            return json.dumps({"result_code": 3, "reason": to_account})
        from_user_hash = db_handler.select_user_hash(from_account)
        if from_user_hash == "":
            #from_user_hash = bc.add_user()
            #print("trans: add_user %s" % (from_user_hash))
            #db_handler.insert_user_info(from_account, from_user_hash)
            return json.dumps({"result_code": 3, "reason": from_account})
        print("transaction: from: %s, to: %s, value:%s, comment:%s" %
                (from_user_hash, to_user_hash, bonus, title))
        transaction_hash = bc.transaction(
            from_user_hash, to_user_hash, int(bonus), title)
        if transaction_hash == "":
            return json.dumps("transaction failed")
        now = datetime.datetime.now()
        str_now = now.strftime("%Y-%m-%d %H:%M:%S")
        db_handler.insert_transaction(
            from_user_hash, to_user_hash, transaction_hash, str_now)
        db_handler.complete_task(task_id)
    except Exception as e:
        print(" complete_task Exception: %s" % (e))

    return json.dumps({"result_code":0, "reason":"task complete ok"})


@app.route('/my_log', methods=['POST'])
def search():
    data = request.get_data()
    from_account = str(json.loads(data)["uuid"])
    db_handler = Db_Ctl()
    from_user_hash = db_handler.select_user_hash(from_account)
    if from_user_hash == "":
        return json.dumps("no such account!")
    trans_ids = db_handler.select_users_transaction(from_user_hash)
    bc = BlockChain()
    res = []
    print("select_users_transaction %s :" % (from_user_hash))
    for transaction_id in trans_ids:
        print("search log: tran_info :%s, time:%s" %(transaction_id[0], transaction_id[1]))
        trans_info = bc.get_transaction_info(transaction_id[0])
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
            "time": str_time
        }
        res.append(transaction_info)
    return json.dumps(res)


@app.route('/insert_task', methods=['POST'])
def insert_task():
    data = request.get_data()
    print("data = " + str(data))
    title = str(json.loads(data)["title"])
    bonus = json.loads(data)["bonus"]
    description = str(json.loads(data)["description"])
    uuid = str(json.loads(data)["uuid"])
    now = datetime.datetime.now()
    str_now = now.strftime("%Y-%m-%d %H:%M:%S")
    db_handler = Db_Ctl()
    db_handler.insert_task(title, uuid, bonus, description, str_now)
    return json.dumps({"result_code":0, "reason":"insert transaction ok"})


@app.route('/my_wallet', methods=['POST'])
def my_wallet():
    data = request.get_data()
    uuid = str(json.loads(data)['uuid'])
    bc = BlockChain()
    db_handler = Db_Ctl()
    user_hash = db_handler.select_user_hash(uuid)
    balance = bc.get_balance(user_hash)
    return json.dumps({"wallet": balance})


@app.route('/search_log', methods=['POST'])
def my_log():
    db_handler = Db_Ctl()
    data = request.get_data()
    print("data = " + str(data))
    uuid = str(json.loads(data)["uuid"])
    db_handler = Db_Ctl()
    tasks = db_handler.select_task_remain()
    return json.dumps(tasks)


if __name__ == '__main__':
    app.run('0.0.0.0')
