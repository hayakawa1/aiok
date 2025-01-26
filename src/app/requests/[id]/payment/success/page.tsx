'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function PaymentSuccessPage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          toast.error('支払い情報が見つかりません');
          router.push(`/requests/${params.id}`);
          return;
        }

        const response = await fetch(`/api/requests/${params.id}/payment/success?session_id=${sessionId}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '支払い処理の確認に失敗しました');
        }

        toast.success('支払いが完了しました');
        router.push(`/requests/${params.id}`);
      } catch (error) {
        console.error('Error processing payment:', error);
        toast.error(error instanceof Error ? error.message : '支払い処理の確認に失敗しました');
        router.push(`/requests/${params.id}`);
      } finally {
        setProcessing(false);
      }
    };

    processPayment();
  }, [params.id, router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4">
          支払い処理中
        </h1>
        {processing ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              支払いの確認中です。このページを閉じないでください...
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600">
              リダイレクト中...
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 