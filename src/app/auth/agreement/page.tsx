'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import 利用規約Page from '@/app/(policies)/terms/page';
import プライバシーポリシーPage from '@/app/(policies)/privacy/page';
import ガイドラインPage from '@/app/(policies)/guidelines/page';
import 特定商取引法に基づく表記Page from '@/app/(policies)/commerce/page';

export default function AgreementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('terms');

  const handleSubmit = async () => {
    if (!agreedToTerms) return;
    
    setIsSubmitting(true);
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const image = searchParams.get('image');

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          image,
          username: email?.split('@')[0],
        }),
      });

      if (!response.ok) {
        throw new Error('登録に失敗しました');
      }

      await signIn('google', { callbackUrl: '/', redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Registration error:', error);
      alert('登録に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'terms', label: '利用規約' },
    { id: 'privacy', label: 'プライバシーポリシー' },
    { id: 'guidelines', label: 'ガイドライン' },
    { id: 'commerce', label: '特定商取引法に基づく表記' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'terms':
        return <利用規約Page />;
      case 'privacy':
        return <プライバシーポリシーPage />;
      case 'guidelines':
        return <ガイドラインPage />;
      case 'commerce':
        return <特定商取引法に基づく表記Page />;
      default:
        return <利用規約Page />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">利用規約への同意</h1>
        <div className="bg-white rounded-lg shadow-lg mb-4">
          <div className="border-b">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-4">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            全ての規約に同意します
          </label>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!agreedToTerms || isSubmitting}
          className="w-full mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '登録中...' : '同意して登録'}
        </button>
      </div>
    </div>
  );
} 