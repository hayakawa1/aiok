'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { RequestStatus, RequestStatusColor, RequestStatusLabel, Request, RequestFile } from '@/types/request';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
}

async function getRequests(type: 'sent' | 'received'): Promise<Request[]> {
  const response = await fetch(`/api/requests?type=${type}`)
  if (!response.ok) throw new Error('依頼の取得に失敗しました')
  const data = await response.json()
  return data.map((request: any) => ({
    ...request,
    status: request.status as RequestStatus,
    createdAt: new Date(request.created_at),
    updatedAt: new Date(request.updated_at)
  }))
}

export default function RequestsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const fromCreate = searchParams.get('from') === 'create';
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>(fromCreate ? 'sent' : 'received');
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchRequests() {
    try {
      setLoading(true);
      const data = await getRequests(activeTab);
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('依頼の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session) return;
    fetchRequests();
  }, [session, activeTab]);

  const handleAccept = async (requestId: number) => {
    try {
      const response = await fetch(`/api/requests/${requestId}/accept`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('依頼の承諾に失敗しました');
      await fetchRequests();
      toast.success('依頼を承諾しました');
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('依頼の承諾に失敗しました');
    }
  };

  const handleReject = async (requestId: number) => {
    if (!confirm('この依頼を拒否しますか？')) return;
    try {
      const response = await fetch(`/api/requests/${requestId}/reject`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('依頼の拒否に失敗しました');
      fetchRequests();
    } catch (error) {
      alert('依頼の拒否に失敗しました');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center text-gray-600">
            ログインが必要です
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">依頼一覧</h1>
      
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'received' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('received')}
        >
          受信した依頼
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'sent' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('sent')}
        >
          送信した依頼
        </button>
      </div>

      {error ? (
        <div className="text-red-500">{error}</div>
      ) : requests.length === 0 ? (
        <div>依頼はありません</div>
      ) : (
        <div className="space-y-4">
          {requests.map((request: any) => (
            <div key={request.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{request.title}</h2>
                  <p className="text-gray-600 mb-2">{request.description}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold">¥{request.amount?.toLocaleString() || 0}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${RequestStatusColor[request.status as RequestStatus]}`}>
                      {RequestStatusLabel[request.status as RequestStatus]}
                    </span>
                  </div>
                </div>
              </div>
              
              {activeTab === 'received' && request.status === RequestStatus.PENDING && (
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    承諾する
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    拒否する
                  </button>
                </div>
              )}
              
              <Link
                href={`/requests/${request.id}`}
                className="text-blue-500 hover:underline mt-4 inline-block"
              >
                詳細を見る
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 