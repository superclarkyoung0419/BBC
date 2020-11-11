rm -f wechat.log
nohup python3 wechat_background.py >> wechat.log 2>&1 &
