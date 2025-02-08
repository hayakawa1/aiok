'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
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

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function getRequests(
  type: 'sent' | 'received',
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: string,
  status: RequestStatus | null
): Promise<{ requests: Request[], pagination: PaginationData }> {
  const params = new URLSearchParams({
    type,
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
    ...(status && { status })
  })
  const response = await fetch(`/api/requests?${params}`)
  if (!response.ok) throw new Error('依頼の取得に失敗しました')
  const data = await response.json()
  return {
    requests: data.requests.map((request: any) => ({
      ...request,
      status: request.status as RequestStatus,
      createdAt: new Date(request.created_at),
      updatedAt: new Date(request.updated_at)
    })),
    pagination: data.pagination
  }
}

export default function RequestsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromCreate = searchParams.get('from') === 'create';
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>(fromCreate ? 'sent' : 'received');
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  async function fetchRequests() {
    try {
      setLoading(true);
      const data = await getRequests(activeTab, page, limit, sortBy, sortOrder, selectedStatus);
      setRequests(data.requests);
      setPagination(data.pagination);
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
  }, [session, activeTab, page, sortBy, sortOrder, selectedStatus]);

  const handleSort = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleStatusChange = (status: RequestStatus | null) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

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
      await fetchRequests();
      toast.success('依頼を拒否しました');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('依頼の拒否に失敗しました');
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

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">ステータス：</span>
          <select
            className="border rounded px-2 py-1"
            value={selectedStatus || ''}
            onChange={(e) => handleStatusChange(e.target.value ? e.target.value as RequestStatus : null)}
          >
            <option value="">すべて</option>
            {Object.entries(RequestStatusLabel).map(([status, label]) => (
              <option key={status} value={status}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">並び順：</span>
          <select
            className="border rounded px-2 py-1"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
              setPage(1);
            }}
          >
            <option value="createdAt-desc">作成日時（新しい順）</option>
            <option value="createdAt-asc">作成日時（古い順）</option>
            <option value="amount-desc">金額（高い順）</option>
            <option value="amount-asc">金額（低い順）</option>
            <option value="updatedAt-desc">更新日時（新しい順）</option>
            <option value="updatedAt-asc">更新日時（古い順）</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="text-red-500">{error}</div>
      ) : requests.length === 0 ? (
        <div>依頼はありません。</div>
      ) : (
        <>
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

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
              >
                前へ
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 rounded ${
                    pageNum === page ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
              >
                次へ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 