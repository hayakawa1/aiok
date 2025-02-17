'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { RequestFile, RequestStatus } from '@/types/request'
import JSZip from 'jszip'

interface FileUploaderProps {
  requestId: string
  isReceiver: boolean
  onUploadComplete: (files: RequestFile[], status: RequestStatus) => Promise<void>
}

// パスワード生成用のヘルパー関数
async function generatePassword(requestId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(requestId);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 4);
}

export default function FileUploader({ requestId, isReceiver, onUploadComplete }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    setError(null);
    setPassword(null);

    try {
      // パスワードを生成
      const zipPassword = await generatePassword(requestId);
      setPassword(zipPassword);

      // クライアント側でZIPファイルを作成
      const zip = new JSZip();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        zip.file(file.name, arrayBuffer);
      }
      setUploadProgress(30);

      // ZIPファイルを生成
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 5
        }
      });
      setUploadProgress(60);

      // Presigned URLを取得
      const response = await fetch(`/api/requests/${requestId}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: 'files.zip'
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'アップロードURLの取得に失敗しました');
      }

      const { uploadUrl, fileKey } = await response.json();

      // ZIPファイルを直接アップロード
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: zipBlob,
        headers: {
          'Content-Type': 'application/zip'
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('ファイルのアップロードに失敗しました');
      }

      setUploadProgress(90);

      // アップロード完了をAPIに通知
      const completeResponse = await fetch(`/api/requests/${requestId}/upload/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: 'files.zip',
          fileKey: fileKey
        })
      });

      if (!completeResponse.ok) {
        throw new Error('アップロード完了の通知に失敗しました');
      }

      const { file } = await completeResponse.json();
      setUploadProgress(100);

      // アップロード完了を通知
      await onUploadComplete([file], RequestStatus.DELIVERED);
      toast.success('ファイルのアップロードが完了しました。パスワード: ' + zipPassword);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : '納品物のアップロードに失敗しました');
      setPassword(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // ファイルサイズの制限（50MB）
    const maxSize = 50 * 1024 * 1024;
    const oversizedFiles = acceptedFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      setError(`ファイルサイズが大きすぎます（上限: 50MB）: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    await handleUpload(acceptedFiles);
  }, [handleUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: (rejectedFiles) => {
      const oversizedFiles = rejectedFiles
        .filter(f => f.file.size > 50 * 1024 * 1024)
        .map(f => f.file.name);
      if (oversizedFiles.length > 0) {
        setError(`ファイルサイズが大きすぎます（上限: 50MB）: ${oversizedFiles.join(', ')}`);
      }
    }
  });

  if (!isReceiver) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              {uploadProgress < 50 ? 'ファイルを準備中...' : 
               uploadProgress < 100 ? 'アップロード中...' : 
               'アップロード完了'}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : isDragActive ? (
          <p className="text-blue-500">ファイルをドロップしてアップロード</p>
        ) : (
          <div className="space-y-2">
            <p>ファイルをドラッグ＆ドロップ</p>
            <p className="text-sm text-gray-500">または クリックしてファイルを選択</p>
            <p className="text-xs text-gray-400">※複数のファイルをアップロードできます（自動的にZIP形式に変換されます）</p>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-4 text-red-500">
          {error}
        </div>
      )}
      {password && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-medium">ファイルのパスワード</p>
          <p className="text-lg font-mono mt-1">{password}</p>
          <p className="text-sm text-green-600 mt-2">※このパスワードは依頼者がファイルをダウンロードする際に必要です</p>
        </div>
      )}
    </div>
  )
} 