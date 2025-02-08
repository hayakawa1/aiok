'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Request as RequestType, RequestStatus, RequestFile, RequestStatusLabel } from '@/types/request';
import Image from 'next/image';
import FileUploader from '@/app/components/FileUploader';
import { toast } from 'react-hot-toast';

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [request, setRequest] = useState<RequestType | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchUser = async () => {
    if (!session?.user?.email) return;
    try {
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  };

  const fetchRequest = async () => {
    if (!params?.id || params.id === 'undefined') {
      throw new Error('依頼IDが指定されていません');
    }

    try {
      console.log('Fetching request:', params.id);
      const response = await fetch(`/api/requests/${params.id}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || '依頼の取得に失敗しました');
      }

      const data = await response.json();
      console.log('Request data:', data);
      setRequest(data);
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setError(null);

      if (!params?.id || params.id === 'undefined') {
        setError('依頼IDが指定されていません');
        setIsLoading(false);
        return;
      }

      if (!session?.user) {
        setError('ログインが必要です');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Initializing with:', { id: params.id, user: session.user });
        await Promise.all([fetchUser(), fetchRequest()]);
      } catch (error) {
        console.error('Initialization error:', error);
        setError(error instanceof Error ? error.message : '初期化中にエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [params?.id, session?.user]);

  // 支払い完了処理用の別のuseEffect
  useEffect(() => {
    const processPayment = async () => {
      if (!params?.id || !session?.user) return;

      const searchParams = new URLSearchParams(window.location.search);
      const sessionId = searchParams.get('session_id');
      
      if (sessionId) {
        try {
          const response = await fetch('/api/stripe/payment/complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              sessionId,
              requestId: params.id
            })
          });
          
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || '支払い処理の完了に失敗しました');
          }
          
          toast.success('支払いが完了しました');
          // URLからsession_idパラメータを削除
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
          
          // リクエストの状態を更新
          await fetchRequest();
        } catch (error) {
          console.error('Payment completion error:', error);
          setError(error instanceof Error ? error.message : '支払い処理の完了に失敗しました');
        }
      }
    };

    processPayment();
  }, []);  // 初回のみ実行

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

  const handlePay = async () => {
    if (!confirm('この依頼のお支払い処理を開始しますか？')) return;
    setProcessing(true);
    try {
      const response = await fetch('/api/stripe/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId: params.id })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'お支払い処理の開始に失敗しました。');
      }
      
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('お支払いURLが取得できませんでした。');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'お支払い処理の開始に失敗しました。');
    } finally {
      setProcessing(false);
    }
  };

  const handleUploadComplete = async (files: RequestFile[], status: RequestStatus) => {
    console.log('Upload complete:', { files, status });
    if (request) {
      const updatedRequest = {
        ...request,
        status: status,
        files: [...request.files, ...files]
      };
      setRequest(updatedRequest);
      toast.success('ファイルのアップロードが完了しました');
      // リクエストの状態を更新するために再取得
      await fetchRequest();
    }
  };

  if (isLoading) {
    return <div className="p-4">読み込み中...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!request || !user) {
    return <div className="p-4">データの読み込みに失敗しました</div>;
  }

  // receiverIdとsenderIdの判定を修正
  const isReceiver = request.receiver?.id === user.id;
  const isSender = request.sender?.id === user.id;

  // デバッグ情報をここで出力
  console.log('Debug Info:', {
    requestStatus: request.status,
    receiverId: request.receiver?.id,
    senderId: request.sender?.id,
    userId: user.id,
    isReceiver,
    isSender,
    statusCheck: [RequestStatus.ACCEPTED, RequestStatus.DELIVERED].includes(request.status),
    showUploader: isReceiver && [RequestStatus.ACCEPTED, RequestStatus.DELIVERED].includes(request.status)
  });

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
            {/* Debug info */}
            <div className="hidden">
              {JSON.stringify({
                status: request.status,
                isAccepted: request.status === RequestStatus.ACCEPTED,
                isDelivered: request.status === RequestStatus.DELIVERED,
                receiverId: request.receiverId,
                sessionUserId: session?.user?.id,
                isReceiver: request.receiverId === session?.user?.id
              })}
            </div>
            {isReceiver && [RequestStatus.ACCEPTED, RequestStatus.DELIVERED].includes(request.status) && (
              <>
                {console.log('FileUploader条件:', {
                  isReceiver,
                  receiverName: request.receiver.name,
                  sessionName: session?.user?.name,
                  statusCheck: [RequestStatus.ACCEPTED, RequestStatus.DELIVERED].includes(request.status),
                  currentStatus: request.status
                })}
                <FileUploader
                  requestId={request.id}
                  isReceiver={true}
                  onUploadComplete={handleUploadComplete}
                />
              </>
            )}
            {request.files.length > 0 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-4">
                {request.files.map((file) => (
                  <a 
                    key={file.id} 
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="relative aspect-square bg-gray-100 hover:bg-gray-200 transition-colors rounded-md">
                      <div className="absolute inset-0 m-auto w-1/2 h-1/2">
                        <Image
                          src="/upload-icon.svg"
                          alt={file.fileName}
                          fill
                          sizes="(max-width: 768px) 25vw, 16.666vw"
                          className="object-contain p-2"
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-xs truncate rounded-b-md">
                        {file.fileName}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {(request.status === RequestStatus.DELIVERED || request.status === RequestStatus.ACCEPTED) && request.files && request.files.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">納品ファイル</h3>
            <div className="space-y-4">
              {request.files.map((file) => (
                <div key={file.id} className="flex flex-col space-y-2 border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {file.fileName}
                    </a>
                    <span className="text-sm text-gray-500">
                      {new Date(file.createdAt).toLocaleString('ja-JP')}
                    </span>
                  </div>
                  {file.password && (
                    <div className="text-sm bg-white p-2 rounded">
                      <span className="font-medium">ZIPパスワード：</span>
                      <code className="bg-gray-100 px-2 py-1 rounded select-all">{file.password}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
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
            onClick={handlePay}
            disabled={processing}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            お支払いする
          </button>
        )}
      </div>
    </div>
  );
} 