from web3 import Web3
import time

w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
if False == w3.isConnected():
    exit()
acc = w3.eth.accounts
if len(acc) == 0:
    account = w3.geth.personal.new_account("clark")

w3.geth.miner.start(1)
