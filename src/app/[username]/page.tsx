'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User } from '@prisma/client';
import { useSession } from 'next-auth/react';

type PricePlan = {
  id: number;
  title: string;
  description: string;
  amount: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

type UserWithPlans = User & {
  pricePlans: PricePlan[];
  image?: string;
  name?: string;
  username?: string;
  bio?: string;
};

type RequestModalProps = {
  plan: PricePlan;
  onClose: () => void;
  onSubmit: (title: string, description: string) => void;
};

function RequestModal({ plan, onClose, onSubmit }: RequestModalProps) {
  const [title, setTitle] = useState(`${plan.title}の依頼`);
  const [description, setDescription] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <h2 className="text-xl font-bold mb-4">依頼内容の入力</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">選択したプラン</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">{plan.title}</p>
            <p className="text-gray-600 mt-1">{plan.description}</p>
            <p className="text-lg font-bold mt-2">¥{plan.amount.toLocaleString()}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={100}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            依頼内容の詳細
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            maxLength={1000}
            placeholder="依頼内容の詳細を入力してください"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={() => onSubmit(title, description)}
            disabled={!title.trim() || !description.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            依頼を作成
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const [user, setUser] = useState<UserWithPlans | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricePlan | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${params.username}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setError('ユーザーが見つかりません');
        }
      } catch (error) {
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.username]);

  // 自分のプロフィールページかどうかをチェック
  const isOwnProfile = session?.user?.email === user?.email;

  const handleCreateRequest = async (title: string, description: string) => {
    if (!selectedPlan || !user) return;

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver_id: user.id,
          title,
          description,
          amount: selectedPlan.amount
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedPlan(null);
        router.push('/requests');
      } else {
        const error = await response.json();
        alert(error.error || '依頼の作成に失敗しました');
      }
    } catch (error) {
      console.error('Error creating request:', error);
      alert('依頼の作成に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col items-center mb-8">
              <div className="relative aspect-square w-48 rounded-full overflow-hidden mb-6">
                <Image
                  src={user.image || '/images/default-avatar.svg'}
                  alt={user.name || user.username || ''}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 192px, 192px"
                  priority
                />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.name || user.username}
                </h1>
                {user.bio && (
                  <p className="mt-4 text-gray-600 whitespace-pre-wrap">{user.bio}</p>
                )}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">料金プラン</h2>
              <div className="space-y-6">
                {user.pricePlans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-2">{plan.title}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    <div className="flex flex-col gap-4">
                      <div className="text-2xl font-bold text-gray-900">
                        ¥{plan.amount.toLocaleString()}
                      </div>
                      {!isOwnProfile && (
                        <button
                          onClick={() => setSelectedPlan(plan)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                          このプランで依頼
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {user.pricePlans.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    料金プランはまだ登録されていません
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedPlan && (
        <RequestModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSubmit={handleCreateRequest}
        />
      )}
    </div>
  );
} 