#!/usr/bin/env python3
import os
import subprocess
import hashlib
import paramiko
from pathlib import Path
import sys
import json
from dotenv import load_dotenv
import fnmatch

# .envファイルを読み込む
load_dotenv()

def read_gitignore():
    """gitignoreファイルの内容を読み込む"""
    ignore_patterns = []
    try:
        with open('.gitignore', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    ignore_patterns.append(line)
    except FileNotFoundError:
        pass
    return ignore_patterns

def should_ignore(file_path, ignore_patterns):
    """ファイルがgitignoreパターンにマッチするかチェック"""
    file_path = str(file_path)
    for pattern in ignore_patterns:
        if pattern.endswith('/'):
            pattern = pattern + '**'
        if fnmatch.fnmatch(file_path, pattern) or fnmatch.fnmatch(file_path, '*/' + pattern):
            return True
    return False

def calculate_directory_hash(directory):
    """ディレクトリ内の全ファイルのハッシュを計算"""
    files_hash = {}
    ignore_patterns = read_gitignore()
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.py', '.html', '.js', '.css', '.sql', '.md')):
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, directory)
                
                # .gitignoreパターンにマッチする場合はスキップ
                if should_ignore(rel_path, ignore_patterns):
                    continue
                    
                # 特定のディレクトリは除外
                if any(x in root for x in ['.git', '__pycache__', 'node_modules']):
                    continue
                
                with open(file_path, 'rb') as f:
                    content = f.read()
                    file_hash = hashlib.sha256(content).hexdigest()
                    files_hash[rel_path] = file_hash
    return files_hash

def get_github_repo_hash():
    """GitHubリポジトリの最新状態のハッシュを取得"""
    # 現在のブランチ名を取得
    branch = subprocess.check_output(['git', 'rev-parse', '--abbrev-ref', 'HEAD']).decode().strip()
    
    # リモートの最新状態を取得
    subprocess.run(['git', 'fetch', 'origin', branch], check=True)
    
    # 一時的にリモートの内容をクローン
    temp_dir = '/tmp/repo_verification'
    if os.path.exists(temp_dir):
        subprocess.run(['rm', '-rf', temp_dir], check=True)
    
    subprocess.run(['git', 'clone', '--branch', branch, '--single-branch', 'https://github.com/hayakawa1/aiok.git', temp_dir], check=True)
    
    return calculate_directory_hash(temp_dir)

def get_production_hash(host, username, password=None, key_path=None):
    """本番環境のコードのハッシュを取得"""
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        if password:
            ssh.connect(host, username=username, password=password)
        else:
            ssh.connect(host, username=username, key_filename=key_path)
        
        # 本番環境のアプリケーションディレクトリパス
        remote_dir = '/var/www/aiok'
        
        # .gitignoreファイルの内容を取得
        ignore_patterns = read_gitignore()
        ignore_pattern_str = '\\|'.join(p.replace('*', '.*') for p in ignore_patterns if p)
        
        files_hash = {}
        
        # 再帰的にファイルを検索してハッシュを計算（.gitignoreを考慮）
        find_cmd = (
            'find {remote_dir} -type f '
            r'\( -name "*.py" -o -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.sql" -o -name "*.md" \) '
            r'! -path "*/\.*" ! -path "*/__pycache__/*" ! -path "*/node_modules/*"'
        ).format(remote_dir=remote_dir)
        
        if ignore_pattern_str:
            find_cmd += f' | grep -v -E "{ignore_pattern_str}"'
        
        ssh_cmd = f'''
            for file in $({find_cmd}); do
                echo "$file:$(sha256sum $file | cut -d" " -f1)"
            done
        '''
        
        stdin, stdout, stderr = ssh.exec_command(ssh_cmd)
        
        for line in stdout:
            file_path, file_hash = line.strip().split(':')
            rel_path = os.path.relpath(file_path, remote_dir)
            files_hash[rel_path] = file_hash
            
    finally:
        ssh.close()
    
    return files_hash

def compare_hashes(local_hash, github_hash, prod_hash=None):
    """ハッシュを比較して差分を報告"""
    results = {
        'github_diff': [],
        'prod_diff': [] if prod_hash else None
    }
    
    # GitHubとの比較
    all_files = set(local_hash.keys()) | set(github_hash.keys())
    for file in all_files:
        if file not in local_hash:
            results['github_diff'].append(f"ローカルに存在しないファイル: {file}")
        elif file not in github_hash:
            results['github_diff'].append(f"GitHubに存在しないファイル: {file}")
        elif local_hash[file] != github_hash[file]:
            results['github_diff'].append(f"内容が異なるファイル: {file}")
    
    # 本番環境との比較（指定された場合）
    if prod_hash:
        all_files = set(local_hash.keys()) | set(prod_hash.keys())
        for file in all_files:
            if file not in local_hash:
                results['prod_diff'].append(f"ローカルに存在しないファイル: {file}")
            elif file not in prod_hash:
                results['prod_diff'].append(f"本番に存在しないファイル: {file}")
            elif local_hash[file] != prod_hash[file]:
                results['prod_diff'].append(f"内容が異なるファイル: {file}")
    
    return results

def main():
    # ローカルのハッシュを計算
    local_hash = calculate_directory_hash('.')
    
    # GitHubのハッシュを取得
    try:
        github_hash = get_github_repo_hash()
    except subprocess.CalledProcessError as e:
        print(f"GitHubリポジトリの取得に失敗: {e}")
        return
    
    # 本番環境のハッシュを取得（必要な場合）
    prod_hash = None
    if len(sys.argv) > 1 and sys.argv[1] == '--prod':
        host = os.getenv('PROD_SSH_HOST')
        username = os.getenv('PROD_SSH_USER')
        password = os.getenv('PROD_SSH_PASSWORD')
        
        if not all([host, username, password]):
            print("環境変数が設定されていません。.envファイルを確認してください。")
            return
            
        try:
            prod_hash = get_production_hash(host, username, password=password)
        except Exception as e:
            print(f"本番環境のハッシュ取得に失敗: {e}")
    
    # 比較結果を取得
    results = compare_hashes(local_hash, github_hash, prod_hash)
    
    # 結果を表示
    print("\n=== GitHubとの比較 ===")
    if not results['github_diff']:
        print("差分なし - コードは完全に一致しています")
    else:
        print("\n".join(results['github_diff']))
    
    if results['prod_diff'] is not None:
        print("\n=== 本番環境との比較 ===")
        if not results['prod_diff']:
            print("差分なし - コードは完全に一致しています")
        else:
            print("\n".join(results['prod_diff']))

if __name__ == '__main__':
    main() 