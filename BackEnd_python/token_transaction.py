from web3 import Web3


class Singleton(object):
    _instance = None

    def __new__(cls, *args, **kw):
        if not cls._instance:
            cls._instance = super(Singleton, cls).__new__(cls, *args, **kw)
            # 这里的super的意思是，该怎么走就怎么走。
        return cls._instance


class BlockChain(Singleton):
    def __init__(self, *args, **kwargs):
        self.w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
        if False == self.w3.isConnected():
            exit()

    def transaction(self, from_user_hash, to_user_hash, value, comment):
        geth_personal = {}
        geth_personal['from'] = Web3.toChecksumAddress(from_user_hash)
        geth_personal['to'] = Web3.toChecksumAddress(to_user_hash)
        geth_personal['value'] = Web3.toWei(value, 'micro')
        geth_personal['input'] = Web3.toHex(text=comment)
        try:
            response = self.w3.geth.personal.send_transaction(
                geth_personal, "clark")
        except Exception as e:
            print(e)
            return ""
        transaction_hash = Web3.toHex(response)

        print("trans_hash: " + transaction_hash)
        return transaction_hash

    def add_user(self):
        account = self.w3.geth.personal.new_account("clark")
        acc = self.w3.eth.accounts
        geth_personal = {}
        geth_personal['from'] = Web3.toChecksumAddress(acc[0])
        geth_personal['to'] = Web3.toChecksumAddress(account)
        geth_personal['value'] = Web3.toWei(100, 'micro')
        try:
            print("init wallet %s" % (str(account)))
            response = self.w3.geth.personal.send_transaction(
                geth_personal, "clark")
        except Exception as e:
            print("exception: add_user %s" % (str(e)))
        print("block_chain add user: %s" % (str(account)))
        return account

    def get_transaction_info(self, trans_hash):
        print("searching trans: %s" % (trans_hash))
        try:
            transaction_data = self.w3.eth.getTransaction(trans_hash)
        except Exception as e:
            print("get transact info: %s" % (str(e)))
        print("trans payload : " + Web3.toText(transaction_data["input"]))
        return {
            "from_hash": str(transaction_data['from']),
            "to_hash": str(transaction_data['to']),
            "value": Web3.fromWei(transaction_data['value'], 'micro'),
            "comment": str(Web3.toText(transaction_data['input']))
        }

    def get_balance(self, user_hash):
        try:
            value = self.w3.eth.getBalance(user_hash)
            return value
        except Exception as e:
            print("exception: get_balance %s" % (str(e)))


