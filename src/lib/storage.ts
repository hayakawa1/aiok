import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as zip from '@zip.js/zip.js';
import crypto from 'crypto';

export class Storage {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
      }
    });
    this.bucket = process.env.R2_BUCKET!;
  }

  async uploadRequestFile(file: File): Promise<string> {
    try {
      // ファイル名から拡張子を取得
      const ext = file.name.split('.').pop();
      // タイムスタンプを含むユニークなファイル名を生成
      const timestamp = new Date().getTime();
      const key = `requests/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

      const arrayBuffer = await file.arrayBuffer();
      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: Buffer.from(arrayBuffer),
          ContentType: file.type,
          ACL: 'public-read'
        },
      });

      await upload.done();
      return `${process.env.R2_PUBLIC_URL}/${key}`;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('ファイルのアップロードに失敗しました');
    }
  }

  async uploadRequestFiles(files: File[], requestId: string): Promise<{ fileUrl: string; password: string }> {
    try {
      // リクエストIDからパスワードを生成
      const hash = crypto.createHash('md5').update(requestId).digest('hex');
      const password = hash.substring(0, 4);

      // ZIPファイルの作成
      const zipWriter = new zip.ZipWriter(new zip.BlobWriter("application/zip"), {
        password,
        zipCrypto: true // 従来のZIP暗号化を使用（より広く互換性がある）
      });

      // ファイルをZIPに追加
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        await zipWriter.add(file.name || `file-${Date.now()}`, new zip.Uint8ArrayReader(new Uint8Array(arrayBuffer)));
      }

      // ZIPファイルを完成させる
      const zipBlob = await zipWriter.close();
      const timestamp = new Date().getTime();
      const key = `requests/${timestamp}-${Math.random().toString(36).substring(7)}.zip`;

      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: zipBlob,
          ContentType: 'application/zip',
          ACL: 'public-read'
        }
      });

      await upload.done();
      return {
        fileUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
        password: password
      };
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error('ファイルのアップロードに失敗しました');
    }
  }

  private encryptContent(content: Buffer, password: string): Buffer {
    // 暗号化に使用するキーとIVを生成
    const key = crypto.scryptSync(password, 'salt', 32);
    const iv = crypto.randomBytes(16);

    // 暗号化
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(content), cipher.final()]);

    // IVと暗号化されたコンテンツを結合
    return Buffer.concat([iv, encrypted]);
  }

  async uploadAvatar(file: File): Promise<string> {
    try {
      const ext = file.name.split('.').pop();
      const timestamp = new Date().getTime();
      const key = `avatars/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

      const arrayBuffer = await file.arrayBuffer();
      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: Buffer.from(arrayBuffer),
          ContentType: file.type,
          ACL: 'public-read'
        }
      });

      await upload.done();
      return `${process.env.R2_PUBLIC_URL}/${key}`;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw new Error('アバターのアップロードに失敗しました');
    }
  }

  async uploadBanner(file: File): Promise<string> {
    try {
      const ext = file.name.split('.').pop();
      const timestamp = new Date().getTime();
      const key = `banners/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

      const arrayBuffer = await file.arrayBuffer();
      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: Buffer.from(arrayBuffer),
          ContentType: file.type,
          ACL: 'public-read'
        }
      });

      await upload.done();
      return `${process.env.R2_PUBLIC_URL}/${key}`;
    } catch (error) {
      console.error('Error uploading banner:', error);
      throw new Error('バナーのアップロードに失敗しました');
    }
  }

  async uploadDelivery(file: File): Promise<string> {
    try {
      const ext = file.name.split('.').pop();
      const timestamp = new Date().getTime();
      const key = `deliveries/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

      const arrayBuffer = await file.arrayBuffer();
      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: Buffer.from(arrayBuffer),
          ContentType: file.type,
          ACL: 'public-read'
        }
      });

      await upload.done();
      return `${process.env.R2_PUBLIC_URL}/${key}`;
    } catch (error) {
      console.error('Error uploading delivery:', error);
      throw new Error('納品物のアップロードに失敗しました');
    }
  }

  async uploadAvatarBuffer(buffer: Buffer, contentType: string): Promise<string> {
    try {
      const timestamp = new Date().getTime();
      const ext = contentType.split('/')[1];
      const key = `avatars/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

      console.log('Uploading avatar with key:', key);
      console.log('R2_PUBLIC_URL:', process.env.R2_PUBLIC_URL);

      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          ACL: 'public-read'
        }
      });

      await upload.done();
      
      if (!process.env.R2_PUBLIC_URL) {
        throw new Error('R2_PUBLIC_URL is not configured');
      }
      
      const fileUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
      console.log('Generated URL:', fileUrl);
      return fileUrl;
    } catch (error) {
      console.error('Error uploading avatar buffer:', error);
      if (error instanceof Error && error.message === 'R2_PUBLIC_URL is not configured') {
        throw error;
      }
      throw new Error('アバターのアップロードに失敗しました');
    }
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const key = url.replace(`${process.env.R2_PUBLIC_URL}/`, '');
      await this.client.send(new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      }));
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('ファイルの削除に失敗しました');
    }
  }
}

let storage: Storage | null = null;

export function getStorage(): Storage {
  if (!storage) {
    storage = new Storage();
  }
  return storage;
} 