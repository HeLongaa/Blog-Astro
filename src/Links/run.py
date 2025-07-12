# -*- coding: utf-8 -*-
import requests
from bs4 import BeautifulSoup
import re
import yaml
from request_data import request
import json

friend_poor=[]

def load_config():
    f = open('_config.yml', 'r',encoding='utf-8')
    ystr = f.read()
    ymllist = yaml.load(ystr, Loader=yaml.FullLoader)
    return ymllist

def gitee_issuse(friend_poor):
    print('\n')
    print('-------获取gitee友链----------')
    baselink = 'https://gitee.com'
    config = load_config()
    print('owner:', config['setting']['gitee_friends_links']['owner'])
    print('repo:', config['setting']['gitee_friends_links']['repo'])
    print('state:', config['setting']['gitee_friends_links']['state'])
    print('labelid:', config['setting']['gitee_friends_links']['labelid'])
    try:
        for number in range(1, 100):
            print(number)
            if config['setting']['gitee_friends_links']['labelid'] =='none':
                label_plus = ''
            else:
                label_plus = '&label_ids=' + str(config['setting']['gitee_friends_links']['labelid'])
            gitee = request.get_data('https://gitee.com/' +
                             config['setting']['gitee_friends_links']['owner'] +
                             '/' +
                             config['setting']['gitee_friends_links']['repo'] +
                             '/issues?state=' + config['setting']['gitee_friends_links']['state'] + label_plus +'&page=' + str(number))
            soup = BeautifulSoup(gitee, 'html.parser')
            main_content = soup.find_all(id='git-issues')
            linklist = main_content[0].find_all('a', {'class': 'title'})
            if len(linklist) == 0:
                print('爬取完毕')
                break
            for item in linklist:
                issueslink = baselink + item['href']
                issues_page = request.get_data(issueslink)
                issues_soup = BeautifulSoup(issues_page, 'html.parser')
                try:
                    issues_linklist = issues_soup.find_all('code')
                    source = issues_linklist[0].text
                    if "{" in source:
                        source = json.loads(source)
                        print(source)
                        friend_poor.append(source)
                except:
                    continue
    except Exception as e:
        print('爬取完毕')

    print('------结束gitee友链获取----------')
    print('\n')
    
def github_issuse(friend_poor):
    print('\n')
    print('-------获取github友链----------')
    baselink = 'https://github.com/'
    config = load_config()
    print('owner:', config['setting']['github_friends_links']['owner'])
    print('repo:', config['setting']['github_friends_links']['repo'])
    print('state:', config['setting']['github_friends_links']['state'])
    print('label:', config['setting']['github_friends_links']['label'])
    try:
        for number in range(1, 100):
            print(f'正在爬取第{number}页...')
            if config['setting']['github_friends_links']['label'] =='none':
                label_plus = ''
            else:
                label_plus = '+label%3A' + config['setting']['github_friends_links']['label']
            
            url = 'https://github.com/' + config['setting']['github_friends_links']['owner'] + '/' + config['setting']['github_friends_links']['repo'] + '/issues?q=is%3A' + config['setting']['github_friends_links']['state'] + str(label_plus) + '&page=' + str(number)
            print(f'请求URL: {url}')
            
            github = request.get_data(url)
            if github == 'error' or not github:
                print('请求失败')
                break
                
            soup = BeautifulSoup(github, 'html.parser')
            
            # 调试：检查页面内容
            print(f'页面长度: {len(github)}')
            
            # 尝试不同的选择器
            main_content = soup.find_all('div',{'aria-label': 'Issues'})
            if not main_content:
                print('未找到Issues容器，尝试其他选择器...')
                # 尝试其他可能的选择器
                main_content = soup.find_all('div', {'class': 'js-issue-row'})
                if not main_content:
                    main_content = soup.find_all('div', {'data-testid': 'issue-item'})
                    if not main_content:
                        print('无法找到Issues列表')
                        print('页面内容（前500字符）:', github[:500])
                        break
            
            if main_content:
                linklist = main_content[0].find_all('a', {'class': 'Link--primary'})
                if not linklist:
                    # 尝试其他链接选择器
                    linklist = main_content[0].find_all('a', {'data-hovercard-type': 'issue'})
                    if not linklist:
                        linklist = main_content[0].find_all('a', href=re.compile(r'/issues/\d+'))
                
                print(f'找到{len(linklist)}个Issues链接')
                
                if len(linklist) == 0:
                    print('爬取完毕')
                    break
                    
                for item in linklist:
                    issueslink = baselink + item['href'].lstrip('/')
                    print(f'处理Issue: {issueslink}')
                    issues_page = request.get_data(issueslink)
                    if issues_page == 'error' or not issues_page:
                        continue
                    issues_soup = BeautifulSoup(issues_page, 'html.parser')
                    try:
                        issues_linklist = issues_soup.find_all('pre')
                        if not issues_linklist:
                            issues_linklist = issues_soup.find_all('code')
                        
                        for code_block in issues_linklist:
                            source = code_block.text.strip()
                            if "{" in source and "}" in source:
                                try:
                                    source = json.loads(source)
                                    print(f'找到友链数据: {source}')
                                    friend_poor.append(source)
                                except json.JSONDecodeError:
                                    continue
                    except Exception as e:
                        print(f'解析Issue内容出错: {e}')
                        continue
    except Exception as e:
        print(f'爬取出错: {e}')

    print('------结束github友链获取----------')
    print('\n')


#友链规则
def get_friendlink(friend_poor):
    config = load_config()
    if config['setting']['gitee_friends_links']['enable']:
        gitee_issuse(friend_poor)
    if config['setting']['github_friends_links']['enable']:
        github_issuse(friend_poor)


get_friendlink(friend_poor)
filename='friendlist.json'
with open(filename,'w',encoding='utf-8') as file_obj:
   json.dump(friend_poor,file_obj,ensure_ascii=False)
