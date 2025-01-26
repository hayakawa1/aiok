'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/users/profile');
        if (response.ok) {
          const data = await response.json();
          console.log('Profile data:', data); // デバッグ用
          setStripeAccountId(data.stripeConnectAccountId || null);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('プロフィールの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleConnectStripe = async () => {
    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'GET'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Stripeアカウントの連携に失敗しました');
      }

      const { accountLink } = await response.json();
      if (accountLink) {
        window.location.href = accountLink;
      } else {
        throw new Error('アカウントリンクの取得に失敗しました');
      }
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      toast.error(error instanceof Error ? error.message : 'Stripeアカウントの連携に失敗しました');
    }
  };

  const handleStripeSettings = async () => {
    try {
      const response = await fetch('/api/stripe/settings');
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Stripe設定の取得に失敗しました');
      }
    } catch (error) {
      console.error('Error opening Stripe settings:', error);
      setError('Stripe設定の取得に失敗しました');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">アカウント設定</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">決済設定</h2>
            
            <div className="space-y-6">
              <div className="border-b pb-6">
                <h3 className="text-lg font-medium mb-4">Stripe Connect連携</h3>
                {stripeAccountId ? (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-green-700">
                        <span className="font-medium">連携済み</span><br />
                        <span className="text-sm">Stripe Connectアカウントと連携されています。</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleConnectStripe}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Stripe設定を開く
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 text-sm">
                        依頼の受付と報酬の受け取りには、Stripeアカウントの連携が必要です。
                      </p>
                    </div>
                    <button
                      onClick={handleConnectStripe}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Stripeアカウントを連携する
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 