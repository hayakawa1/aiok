'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/requests`,
        },
      });

      if (submitError) {
        setError(submitError.message || '支払い処理に失敗しました');
        setProcessing(false);
      }
    } catch (e) {
      setError('支払い処理中にエラーが発生しました');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <PaymentElement />
      
      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || processing}
        className="mt-4 w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
      >
        {processing ? '処理中...' : '支払いを確定する'}
      </button>
    </form>
  );
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get('client_secret');
  
  if (!clientSecret) {
    return (
      <div className="p-4 text-red-500">
        支払い情報の取得に失敗しました
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      labels: 'floating' as const,
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">支払い情報の入力</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm />
        </Elements>
      </div>
    </div>
  );
} 