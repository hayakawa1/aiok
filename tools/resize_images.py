from PIL import Image
import os

def resize_image(image_path, output_path, target_height=192):  # h-48 class の 48 * 4 = 192px
    try:
        with Image.open(image_path) as img:
            # アスペクト比を維持しながらリサイズ
            aspect_ratio = img.width / img.height
            new_width = int(target_height * aspect_ratio)
            
            # リサイズ実行
            resized_img = img.resize((new_width, target_height), Image.Resampling.LANCZOS)
            
            # 保存時の品質を設定（WebP形式）
            resized_img.save(output_path, 'WEBP', quality=85)
            print(f"Resized: {image_path} -> {output_path}")
            
    except Exception as e:
        print(f"Error processing {image_path}: {str(e)}")

def main():
    # 画像ディレクトリ
    input_dir = "app/static/images"
    output_dir = input_dir  # 同じディレクトリに上書き保存
    
    # 対象となる画像ファイル
    target_images = [
        'photo.webp', 'illust.webp', 'video.webp', 'programin.webp',
        'text.webp', 'prompt.webp', 'music.webp', 'slide.webp', 'web.webp'
    ]
    
    # ディレクトリが存在することを確認
    if not os.path.exists(input_dir):
        print(f"Directory not found: {input_dir}")
        return
        
    # 各画像をリサイズ
    for image_name in target_images:
        input_path = os.path.join(input_dir, image_name)
        output_path = os.path.join(output_dir, image_name)
        
        if os.path.exists(input_path):
            resize_image(input_path, output_path)
        else:
            print(f"Image not found: {input_path}")

if __name__ == "__main__":
    main() 