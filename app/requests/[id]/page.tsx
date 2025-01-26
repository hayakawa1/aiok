'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Request as RequestType, RequestStatus, RequestFile, RequestStatusLabel } from '@/app/types/request';
import Image from 'next/image';
import FileUploader from '../../components/FileUploader';
import { toast } from 'react-hot-toast';

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [request, setRequest] = useState<RequestType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [params.id]);

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/requests/${params.id}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '依頼の取得に失敗しました');
      }
      const data = await response.json();
      setRequest(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : '依頼の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!confirm('この依頼を承諾しますか？')) return;
    setProcessing(true);
    try {
      const response = await fetch(`/api/requests/${params.id}/accept`, {
        method: 'POST'
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '依頼の承諾に失敗しました');
      }
      await fetchRequest();
    } catch (error) {
      setError(error instanceof Error ? error.message : '依頼の承諾に失敗しました');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('この依頼を拒否しますか？')) return;
    setProcessing(true);
    try {
      const response = await fetch(`/api/requests/${params.id}/reject`, {
        method: 'POST'
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '依頼の拒否に失敗しました');
      }
      await fetchRequest();
    } catch (error) {
      setError(error instanceof Error ? error.message : '依頼の拒否に失敗しました');
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (!confirm('この依頼を完了としてマークしますか？')) return;
    setProcessing(true);
    try {
      const response = await fetch(`/api/requests/${params.id}/complete`, {
        method: 'POST'
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '依頼の完了処理に失敗しました');
      }
      await fetchRequest();
    } catch (error) {
      setError(error instanceof Error ? error.message : '依頼の完了処理に失敗しました');
    } finally {
      setProcessing(false);
    }
  };

  const handlePay = async () => {
    if (!confirm('この依頼の支払い処理を開始しますか？')) return;
    setProcessing(true);
    try {
      const response = await fetch(`/api/requests/${params.id}/pay`, {
        method: 'POST'
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '支払い処理の開始に失敗しました');
      }
      const { paymentUrl } = await response.json();
      // Stripeの支払いページに遷移
      window.location.href = paymentUrl;
    } catch (error) {
      setError(error instanceof Error ? error.message : '支払い処理の開始に失敗しました');
    } finally {
      setProcessing(false);
    }
  };

  const handleUploadComplete = async (files: RequestFile[], status: RequestStatus) => {
    if (request) {
      setRequest({
        ...request,
        status,
        files: [...(request.files || []), ...files]
      });
      toast.success('ファイルのアップロードが完了しました');
    }
  }

  if (isLoading) {
    return <div className="p-4">読み込み中...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!request) {
    return <div className="p-4">依頼が見つかりません</div>;
  }

  const isReceiver = session?.user?.email && request.receiver.id === session.user.id;
  const isSender = session?.user?.email && request.sender.id === session.user.id;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">{request.title}</h1>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <Image
              src={request.sender.image || '/default-avatar.png'}
              alt={request.sender.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <p className="font-medium">{request.sender.name}</p>
              <p className="text-sm text-gray-500">@{request.sender.username}</p>
            </div>
          </div>
          <div className="text-gray-400">→</div>
          <div className="flex items-center space-x-2">
            <Image
              src={request.receiver.image || '/default-avatar.png'}
              alt={request.receiver.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <p className="font-medium">{request.receiver.name}</p>
              <p className="text-sm text-gray-500">@{request.receiver.username}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">依頼内容</h2>
          <p className="whitespace-pre-wrap">{request.description}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">金額</h2>
          <p className="text-xl font-bold">¥{request.amount.toLocaleString()}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">ステータス</h2>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {RequestStatusLabel[request.status]}
          </span>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">添付ファイル</h2>
          <div className="space-y-4">
            <FileUploader
              requestId={request.id}
              isReceiver={request.receiverId === session?.user?.id}
              onUploadComplete={handleUploadComplete}
            />
            {request.files.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {request.files.map((file) => (
                  <a 
                    key={file.id} 
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src="/upload-icon.svg"
                        alt={file.fileName}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain rounded-lg p-4 bg-gray-100 hover:bg-gray-200 transition-colors"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm truncate">
                        {file.fileName}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {isReceiver && request.status === RequestStatus.PENDING && (
          <>
            <button
              onClick={handleAccept}
              disabled={processing}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              承諾する
            </button>
            <button
              onClick={handleReject}
              disabled={processing}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              拒否する
            </button>
          </>
        )}

        {isSender && request.status === RequestStatus.DELIVERED && (
          <button
            onClick={handleComplete}
            disabled={processing}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            完了にする
          </button>
        )}

        {isSender && request.status === RequestStatus.COMPLETED && (
          <button
            onClick={handlePay}
            disabled={processing}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            支払う
          </button>
        )}
      </div>
    </div>
  );
} 