#!/usr/bin/env python3
import os
import fnmatch
from datetime import datetime

def should_include(path):
    """指定されたパスを含めるべきかどうかを判定する"""
    # appフォルダ配下のみを対象とする
    return path.startswith('app/')

def read_file_content(file_path):
    """ファイルの内容を読み込む"""
    # CSSファイルの場合は内容を省略
    if file_path.endswith('.css'):
        return "[CSSファイル - 内容は省略]"
        
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        return "[バイナリファイル - 内容は省略]"
    except Exception as e:
        return f"[ファイル読み込みエラー: {str(e)}]"

def export_project(start_path='app', output_file='project_export_for_gpt.txt'):
    """プロジェクト内の全ファイルの内容をエクスポートする"""
    
    with open(output_file, 'w', encoding='utf-8') as out:
        # ヘッダー情報を書き込む
        out.write(f"# プロジェクトエクスポート（/appフォルダ）\n")
        out.write(f"# 作成日時: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        for root, dirs, files in os.walk(start_path):
            # 特定のディレクトリやファイルを除外
            dirs[:] = [d for d in dirs if not d.startswith(('__pycache__', '.', 'node_modules'))]
            
            for file in files:
                if file.startswith('.') or file.endswith(('.pyc', '.pyo', '.pyd')):
                    continue
                    
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, '.')
                
                if not should_include(relative_path):
                    continue
                
                # ファイル情報とその内容を書き込む
                out.write(f"\n{'='*80}\n")
                out.write(f"ファイル: {relative_path}\n")
                out.write(f"{'='*80}\n\n")
                
                content = read_file_content(file_path)
                out.write(content)
                out.write("\n")

if __name__ == '__main__':
    # カレントディレクトリの一つ上（プロジェクトルート）に移動
    os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    output_file = 'project_export_for_gpt.txt'
    export_project('app', output_file)
    print(f"プロジェクトの内容を {output_file} にエクスポートしました。") 