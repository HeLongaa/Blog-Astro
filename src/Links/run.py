# -*- coding: utf-8 -*-
import requests
from bs4 import BeautifulSoup
import re
import yaml
from request_data import request
import json

friend_poor=[]

def load_config():
    f = open('./src/Links/_config.yml', 'r',encoding='utf-8')
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
            
            # 查找最新的GitHub Issues列表结构
            # 1. 首先查找ListView-module__ul类的ul元素
            issue_items = []
            list_view = soup.find('ul', {'class': re.compile(r'ListView-module__ul')})
            if list_view:
                print('找到ListView-module__ul元素')
                # 查找ListItem-module__listItem类的li元素
                issue_items = list_view.find_all('li', {'class': re.compile(r'ListItem-module__listItem')})
                print(f'找到{len(issue_items)}个列表项')
            
            # 如果没有找到，尝试其他选择器
            if not issue_items:
                print('使用备选选择器查找Issues列表')
                # 尝试查找旧版选择器
                main_content = soup.find_all('div', {'aria-label': 'Issues'})
                if main_content:
                    linklist = main_content[0].find_all('a', {'class': 'Link--primary'})
                    if len(linklist) == 0:
                        print('爬取完毕')
                        break
                    
                    for item in linklist:
                        issueslink = baselink + item['href'].lstrip('/')
                        process_issue(issueslink, friend_poor)
                else:
                    print('无法找到Issues列表')
                    # 打印一小部分页面内容以便调试
                    print('页面内容（前500字符）:', github[:500])
                    break
            else:
                # 处理找到的issue_items
                for item in issue_items:
                    # 查找data-testid='issue-pr-title-link'的a元素
                    link = item.find('a', {'data-testid': 'issue-pr-title-link'})
                    if not link:
                        # 尝试其他可能的链接选择器
                        link = item.find('a', {'class': re.compile(r'IssuePullRequestTitle')})
                    if not link:
                        # 再尝试href属性包含/issues/的a元素
                        link = item.find('a', href=re.compile(r'/issues/\d+'))
                    
                    if link:
                        issueslink = baselink + link['href'].lstrip('/')
                        print(f'处理Issue: {issueslink}')
                        process_issue(issueslink, friend_poor)
                
                # 如果没有找到issue_items，说明已经到达最后一页
                if len(issue_items) == 0:
                    print('爬取完毕')
                    break
    
    except Exception as e:
        print(f'爬取出错: {e}')
        import traceback
        traceback.print_exc()

    print('------结束github友链获取----------')
    print('\n')

def process_issue(issue_url, friend_poor):
    """处理单个Issue页面，提取友链信息"""
    issues_page = request.get_data(issue_url)
    if issues_page == 'error' or not issues_page:
        print(f'获取Issue页面失败: {issue_url}')
        return
        
    issues_soup = BeautifulSoup(issues_page, 'html.parser')
    try:
        # 依次尝试不同类型的代码块
        code_blocks = issues_soup.find_all('pre')
        if not code_blocks:
            code_blocks = issues_soup.find_all('code')
        if not code_blocks:
            code_blocks = issues_soup.find_all('div', {'class': 'highlight'})
        
        if code_blocks:
            print(f'找到{len(code_blocks)}个代码块')
            for code_block in code_blocks:
                source = code_block.text.strip()
                if "{" in source and "}" in source:
                    try:
                        # 尝试解析JSON
                        source = json.loads(source)
                        print(f'找到友链数据: {source}')
                        friend_poor.append(source)
                    except json.JSONDecodeError as e:
                        print(f'JSON解析错误: {e}')
                        continue
        else:
            print(f'未在Issue中找到代码块: {issue_url}')
    except Exception as e:
        print(f'解析Issue内容出错: {e}')
        import traceback
        traceback.print_exc()


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
