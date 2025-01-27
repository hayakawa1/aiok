import yaml
import re
import os
from typing import Dict, List, Union

def tsx_to_yaml(tsx_content: str) -> str:
    """TSXファイルからYAMLを生成する"""
    # タイトルを抽出
    title_match = re.search(r'<h1[^>]*>(.*?)</h1>', tsx_content)
    title = title_match.group(1) if title_match else "ガイドライン"
    
    # セクションを抽出
    sections = []
    section_pattern = r'<section>.*?<h2[^>]*>(.*?)</h2>(.*?)</section>'
    for match in re.finditer(section_pattern, tsx_content, re.DOTALL):
        heading = match.group(1)
        content = match.group(2)
        
        # リスト項目を抽出
        items = []
        if '<ul' in content:
            items = re.findall(r'<li>(.*?)</li>', content, re.DOTALL)
        else:
            # 段落テキストを抽出
            text_match = re.search(r'<p[^>]*>(.*?)</p>', content, re.DOTALL)
            if text_match:
                items = [text_match.group(1).strip()]
        
        sections.append({
            'heading': heading.strip(),
            'content': items
        })
    
    # YAML構造を作成
    yaml_data = {
        'title': title,
        'sections': sections
    }
    
    return yaml.dump(yaml_data, allow_unicode=True, sort_keys=False)

def yaml_to_tsx(yaml_content: str) -> str:
    """YAMLファイルからTSXを生成する"""
    try:
        data = yaml.safe_load(yaml_content)
        if not data or 'sections' not in data:
            raise ValueError("Invalid YAML structure: 'sections' key not found")
        
        sections_html = []
        for i, section in enumerate(data['sections'], 1):
            content_html = ''
            if isinstance(section['content'], list):
                if len(section['content']) > 1:
                    items_html = '\n'.join(f'                <li>{item}</li>' for item in section['content'])
                    content_html = f'''              <ul className="list-disc list-inside text-gray-600 space-y-2">
{items_html}
              </ul>'''
                else:
                    content_html = f'''              <p className="text-gray-600">
                {section['content'][0]}
              </p>'''
            
            section_html = f'''            <section>
              <h2 className="text-xl font-semibold mb-4">{section['heading']}</h2>
{content_html}
            </section>'''
            sections_html.append(section_html)
        
        return f'''

export default function {data['title'].replace('・', '').replace('〜', '').replace('、', '').replace('。', '')}Page() {{
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
       
        <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
          <h1 className="text-2xl font-bold mb-6">{data['title']}</h1>
          
          <div className="space-y-8">
{chr(10).join(sections_html)}
          </div>
        </div>
      </div>
    </div>
  )
}}'''
    except Exception as e:
        print(f"Error processing YAML content: {str(e)}")
        return None

def convert_yaml_to_tsx_file(yaml_path: str):
    """YAMLファイルを読み込んでTSXファイルを生成する"""
    try:
        # YAMLファイルを読み込む
        if not os.path.exists(yaml_path):
            print(f"File not found: {yaml_path}")
            return
            
        with open(yaml_path, 'r', encoding='utf-8') as f:
            yaml_content = f.read()
        
        # TSXを生成
        tsx_content = yaml_to_tsx(yaml_content)
        if not tsx_content:
            print(f"Failed to convert {yaml_path}")
            return
        
        # 出力パスを生成
        dir_path = os.path.dirname(yaml_path)
        tsx_path = os.path.join(dir_path, 'page.tsx')
        
        # TSXファイルを保存
        with open(tsx_path, 'w', encoding='utf-8') as f:
            f.write(tsx_content)
        
        print(f'Converted {yaml_path} -> {tsx_path}')
    except Exception as e:
        print(f"Error processing file {yaml_path}: {str(e)}")

def generate_combined_text(yaml_files: List[str]) -> str:
    """全ての規約ファイルを結合してチャットGPT用のテキストを生成する"""
    combined_text = "# AIOKサービス 利用規約・ポリシー一覧\n\n"
    
    for yaml_file in yaml_files:
        try:
            with open(yaml_file, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f.read())
                
            # タイトルを追加
            combined_text += f"## {data['title']}\n\n"
            
            # 各セクションを追加
            for section in data['sections']:
                combined_text += f"### {section['heading']}\n\n"
                if isinstance(section['content'], list):
                    for item in section['content']:
                        combined_text += f"- {item}\n"
                combined_text += "\n"
            
            combined_text += "---\n\n"
        except Exception as e:
            print(f"Error processing file {yaml_file}: {str(e)}")
    
    return combined_text

if __name__ == '__main__':
    # 変換対象のYAMLファイル
    yaml_files = [
        'src/app/(policies)/terms/terms.yaml',
        'src/app/(policies)/commerce/commerce.yaml',
        'src/app/(policies)/privacy/privacy.yaml',
        'src/app/(policies)/guidelines/guidelines.yaml',
    ]
    
    # 各YAMLファイルを変換
    for yaml_file in yaml_files:
        convert_yaml_to_tsx_file(yaml_file)
    
    # チャットGPT用のテキストファイルを生成
    combined_text = generate_combined_text(yaml_files)
    with open('all_policies.md', 'w', encoding='utf-8') as f:
        f.write(combined_text)
    print('Generated all_policies.md') 