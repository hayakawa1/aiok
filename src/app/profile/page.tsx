'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    image: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/users/profile');
        if (!response.ok) {
          throw new Error('プロフィールの取得に失敗しました');
        }
        const data = await response.json();
        setProfile({
          name: data.name || '',
          bio: data.bio || '',
          image: data.image || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('プロフィールの更新に失敗しました');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('画像のアップロードに失敗しました');
      }

      const data = await response.json();
      setProfile(prev => ({ ...prev, image: data.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    }
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">プロフィール設定</h1>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* アバター画像 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  プロフィール画像
                </label>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                    <Image
                      src={profile.image || '/images/default-avatar.png'}
                      alt="プロフィール画像"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <label className="btn-secondary cursor-pointer">
                    画像を変更
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>

              {/* 名前 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  名前
                </label>
                <input
                  type="text"
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input block w-full"
                  maxLength={50}
                />
              </div>

              {/* 自己紹介 */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  自己紹介
                </label>
                <textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="form-input block w-full"
                  maxLength={500}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? '保存中...' : '保存する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 