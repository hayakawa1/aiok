'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import 利用規約Page from '@/app/(policies)/terms/page';
import プライバシーポリシーPage from '@/app/(policies)/privacy/page';
import ガイドラインPage from '@/app/(policies)/guidelines/page';
import 特定商取引法に基づく表記Page from '@/app/(policies)/commerce/page';

type PolicyType = 'terms' | 'privacy' | 'guidelines' | 'commerce';

const policyLabels: Record<PolicyType, string> = {
  terms: '利用規約',
  privacy: 'プライバシーポリシー',
  guidelines: 'ガイドライン',
  commerce: '特定商取引法に基づく表記'
};

export default function AgreementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState<PolicyType>('terms');

  const handlePolicyClick = (policy: PolicyType) => {
    setCurrentPolicy(policy);
  };

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

  const renderPolicyContent = (policy: PolicyType) => {
    switch (policy) {
      case 'terms':
        return <利用規約Page />;
      case 'privacy':
        return <プライバシーポリシーPage />;
      case 'guidelines':
        return <ガイドラインPage />;
      case 'commerce':
        return <特定商取引法に基づく表記Page />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-white p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {policyLabels[currentPolicy]}
              </h2>
            </div>
            <div className="flex gap-2">
              {(Object.keys(policyLabels) as PolicyType[]).map((policy) => (
                <button
                  key={policy}
                  onClick={() => handlePolicyClick(policy)}
                  className={`px-3 py-1 text-sm rounded ${
                    currentPolicy === policy
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {policyLabels[policy]}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6">
            {renderPolicyContent(currentPolicy)}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-center gap-2 mb-4">
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
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '登録中...' : '同意して登録'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 