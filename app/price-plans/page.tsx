'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PricePlan {
  id: number;
  title: string;
  description: string;
  amount: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function PricePlansPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<PricePlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<PricePlan | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/price-plans');
      if (!response.ok) {
        throw new Error('プランの取得に失敗しました');
      }
      const data = await response.json();
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // 金額のバリデーション
      const numAmount = Number(formData.amount);
      if (isNaN(numAmount) || numAmount < 100) {
        throw new Error('金額は100円以上の有効な数値を入力してください');
      }

      const url = editingPlan 
        ? `/api/price-plans/${editingPlan.id}`
        : '/api/price-plans';
      
      const method = editingPlan ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: numAmount,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'プランの保存に失敗しました');
      }

      await fetchPlans();
      setEditingPlan(null);
      setFormData({ title: '', description: '', amount: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  // 金額入力時のバリデーション
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = Number(value);
    
    // 空欄は許可（必須チェックはHTML5のrequiredで行う）
    if (value === '') {
      setFormData(prev => ({ ...prev, amount: '' }));
      return;
    }
    
    // 100円以上の整数のみ許可
    if (!isNaN(numValue) && numValue >= 100) {
      setFormData(prev => ({ ...prev, amount: value }));
    }
  };

  const handleEdit = (plan: PricePlan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      amount: plan.amount.toString(),
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このプランを削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/price-plans/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('プランの削除に失敗しました');
      }

      await fetchPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setFormData({ title: '', description: '', amount: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* プラン一覧 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">プラン一覧</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-2">{plan.title}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-bold">¥{plan.amount.toLocaleString()}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* プラン作成/編集フォーム */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">
              {editingPlan ? 'プラン編集' : 'プラン作成'}
            </h1>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* プラン名 */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  プラン名
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="form-input block w-full"
                  maxLength={100}
                  required
                />
              </div>

              {/* 説明 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="form-input block w-full"
                  maxLength={1000}
                  required
                />
              </div>

              {/* 金額 */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  金額（円）
                </label>
                <input
                  type="number"
                  id="amount"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  className="form-input block w-full"
                  min="100"
                  step="100"
                  placeholder="100円以上"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                {editingPlan && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    キャンセル
                  </button>
                )}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? '保存中...' : (editingPlan ? '更新する' : '作成する')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 