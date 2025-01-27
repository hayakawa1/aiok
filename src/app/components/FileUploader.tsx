import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { RequestStatus } from '@/types/request'

interface FileUploaderProps {
  requestId: string
  isReceiver: boolean
  onUploadComplete: (files: any[], status: RequestStatus) => void
}

export default function FileUploader({ requestId, isReceiver, onUploadComplete }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    acceptedFiles.forEach((file) => {
      formData.append('files', file)
    })

    try {
      const response = await fetch(`/api/requests/${requestId}/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'ファイルのアップロードに失敗しました')
      }

      const data = await response.json()
      onUploadComplete(data.files, data.status)
      setUploadProgress(100)
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('ファイルのアップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }, [requestId, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  })

  if (!isReceiver) {
    return null
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
          <div className="text-sm text-gray-600">アップロード中...</div>
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
          <p className="text-xs text-gray-400">※複数のファイルをアップロードできます</p>
        </div>
      )}
    </div>
  )
} 