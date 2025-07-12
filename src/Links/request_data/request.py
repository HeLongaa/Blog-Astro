# -*- coding: utf-8 -*-
import requests
import yaml
requests.packages.urllib3.disable_warnings()

def load_config():
    import os
    config_path = './src/Links/_config.yml'
    # 如果当前目录下不存在配置文件，尝试使用绝对路径
    if not os.path.exists(config_path):
        # 尝试几种可能的路径
        possible_paths = [
            './_config.yml', 
            '../_config.yml',
            'src/Links/_config.yml',
            os.path.join(os.path.dirname(os.path.dirname(__file__)), '_config.yml')
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                config_path = path
                break
    
    try:
        f = open(config_path, 'r', encoding='utf-8')
    except:
        # 如果utf-8打开失败，尝试gbk编码
        f = open(config_path, 'r', encoding='gbk')
        
    ystr = f.read()
    ymllist = yaml.load(ystr, Loader=yaml.FullLoader)
    return ymllist

def get_data(link):
    config = load_config()
    result = ''
    user_agent = 'Mozilla/5.0 (Macintosh;Intel Mac OS X 10_12_6) ' \
                 'AppleWebKit/537.36(KHTML, like Gecko) ' \
                 'Chrome/67.0.3396.99Safari/537.36'
    header = {'User_Agent': user_agent}
    try:
        r = requests.get(link, headers=header, timeout=config['setting']['request']['timeout'],verify=config['setting']['request']['ssl'])
        r.encoding = 'utf-8'
        result = r.text.encode("gbk", 'ignore').decode('gbk', 'ignore')
        if str(r) == '<Response [404]>':
            result = 'error'
    except Exception as e:
        print(e)
        print(e.__traceback__.tb_frame.f_globals["__file__"])
        print(e.__traceback__.tb_lineno)
    return result