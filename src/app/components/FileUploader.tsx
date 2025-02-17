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

export default function FileUploader({ requestId, isReceiver, onUploadComplete }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const createZipFile = async (files: File[]): Promise<File> => {
    const zip = new JSZip();
    
    // ファイルをZIPに追加
    for (const file of files) {
      zip.file(file.name, file);
    }
    
    // ZIPファイルを生成
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Fileオブジェクトとして返す
    return new File([content], 'files.zip', { type: 'application/zip' });
  };

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      if (files.length > 1) {
        // 複数ファイルの場合はZIPにまとめる
        const zipFile = await createZipFile(files);
        formData.append('files', zipFile);
        setUploadProgress(50); // ZIP作成完了
      } else {
        // 単一ファイルの場合はそのままアップロード
        formData.append('files', files[0]);
      }

      // FormDataを使用する場合、Content-Typeヘッダーは自動的に設定される
      const response = await fetch(`/api/requests/${requestId}/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error;
        if (data.error === 'この依頼はアップロードできない状態です') {
          errorMessage = '依頼が承認されていない状態です。依頼者の承認後にアップロードが可能になります。';
        }
        throw new Error(errorMessage);
      }

      setUploadProgress(100);
      await onUploadComplete([data.requestFile], data.request.status);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : '納品物のアップロードに失敗しました');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // ファイルサイズの制限（10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    const oversizedFiles = acceptedFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      setError(`ファイルサイズが大きすぎます（上限: 10MB）: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    await handleUpload(acceptedFiles);
  }, [handleUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: (rejectedFiles) => {
      const oversizedFiles = rejectedFiles
        .filter(f => f.file.size > 10 * 1024 * 1024)
        .map(f => f.file.name);
      if (oversizedFiles.length > 0) {
        setError(`ファイルサイズが大きすぎます（上限: 10MB）: ${oversizedFiles.join(', ')}`);
      }
    }
  });

  if (!isReceiver) {
    return null;
  }

  return (
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
      {error && (
        <div className="mt-4 text-red-500">
          {error}
        </div>
      )}
    </div>
  )
} 