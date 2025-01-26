'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            アカウントにログイン
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            AIリクエストサービスを利用するにはログインが必要です
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Image
              src="/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            Googleでログイン
          </button>
        </div>
      </div>
    </div>
  );
} 