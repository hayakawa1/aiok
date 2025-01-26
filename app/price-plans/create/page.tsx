'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function CreatePricePlanPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 金額のバリデーション
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      toast.error('金額は100円以上で入力してください');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/price-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          amount: numAmount
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '価格プランの作成に失敗しました');
      }

      toast.success('価格プランを作成しました');
      router.push('/price-plans');
    } catch (error) {
      console.error('Error creating price plan:', error);
      toast.error(error instanceof Error ? error.message : '価格プランの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">新しい価格プラン</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            タイトル
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            説明
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            金額（円）
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || Number(value) >= 100) {
                setAmount(value);
              }
            }}
            min="100"
            step="100"
            placeholder="100円以上"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? '作成中...' : '作成する'}
        </button>
      </form>
    </div>
  );
} 