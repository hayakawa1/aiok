import { Storage } from './storage';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// S3Clientのモック
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/lib-storage');

describe('Storage', () => {
  let storage: Storage;
  const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
  const mockBuffer = Buffer.from('test content');

  beforeEach(() => {
    // 環境変数の設定
    process.env.R2_ENDPOINT = 'https://test.r2.cloudflarestorage.com';
    process.env.R2_ACCESS_KEY_ID = 'test-key';
    process.env.R2_SECRET_ACCESS_KEY = 'test-secret';
    process.env.R2_BUCKET = 'test-bucket';
    process.env.R2_PUBLIC_URL = 'https://test.public.url';

    // モックのリセット
    jest.clearAllMocks();
    
    // Uploadモックの設定
    const mockDone = jest.fn();
    mockDone.mockResolvedValue({});
    
    (Upload as unknown as jest.Mock).mockImplementation(() => ({
      done: mockDone
    }));

    storage = new Storage();
  });

  describe('uploadRequestFile', () => {
    test('ファイルを正常にアップロードできる', async () => {
      const result = await storage.uploadRequestFile(mockFile);
      
      expect(Upload).toHaveBeenCalled();
      expect(result).toMatch(/^https:\/\/test\.public\.url\/requests\/.+\.txt$/);
    });

    test('アップロードに失敗した場合はエラーを投げる', async () => {
      const mockDone = jest.fn();
      mockDone.mockRejectedValue(new Error('Upload failed'));
      
      (Upload as unknown as jest.Mock).mockImplementation(() => ({
        done: mockDone
      }));

      await expect(storage.uploadRequestFile(mockFile)).rejects.toThrow('ファイルのアップロードに失敗しました');
    });
  });

  describe('uploadAvatar', () => {
    test('アバター画像を正常にアップロードできる', async () => {
      const result = await storage.uploadAvatar(mockFile);
      
      expect(Upload).toHaveBeenCalled();
      expect(result).toMatch(/^https:\/\/test\.public\.url\/avatars\/.+\.txt$/);
    });
  });

  describe('uploadAvatarBuffer', () => {
    test('バッファからアバター画像を正常にアップロードできる', async () => {
      const result = await storage.uploadAvatarBuffer(mockBuffer, 'image/jpeg');
      
      expect(Upload).toHaveBeenCalled();
      expect(result).toMatch(/^https:\/\/test\.public\.url\/avatars\/.+\.jpeg$/);
    });

    test('R2_PUBLIC_URLが設定されていない場合はエラーを投げる', async () => {
      process.env.R2_PUBLIC_URL = '';
      
      await expect(storage.uploadAvatarBuffer(mockBuffer, 'image/jpeg')).rejects.toThrow('R2_PUBLIC_URL is not configured');
    });
  });
}); 