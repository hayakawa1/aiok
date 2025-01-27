'use client';

import React from 'react';
import Image from 'next/legacy/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* ヒーローセクション */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-xl">
        {/* 背景画像 */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero.webp"
            alt="AIOK Hero Image"
            layout="fill"
            objectFit="cover"
            className="opacity-20"
            priority
          />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xl md:text-2xl mb-4 text-indigo-200 font-medium">AIOKなクリエイターマッチングサービス。</p>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              AIを味方に。「全てを可能」にする新しいクリエイティブスタイル
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 hover:bg-white/30 transition-colors duration-300">
                <span className="material-symbols-outlined text-4xl mb-4">rocket_launch</span>
                <h3 className="text-xl font-bold mb-2 drop-shadow-lg">圧倒的なスピード・コスト・クオリティ</h3>
                <p className="text-white/90">AIの活用で人間を超える生産性。あらゆるジャンルのクリエイティブに対応</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 hover:bg-white/30 transition-colors duration-300">
                <span className="material-symbols-outlined text-4xl mb-4">chat_off</span>
                <h3 className="text-xl font-bold mb-2 drop-shadow-lg">コミュニケーションレス</h3>
                <p className="text-white/90">打ち合わせ不要。AIを活用した効率的なプロセスで時間とコストを大幅カット</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 hover:bg-white/30 transition-colors duration-300">
                <span className="material-symbols-outlined text-4xl mb-4">verified</span>
                <h3 className="text-xl font-bold mb-2 drop-shadow-lg">気に入らなければ支払い不要</h3>
                <p className="text-white/90">クリエイターが納得した上で作業。依頼者のリスクを最小限に</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="#flow" className="text-white hover:text-blue-100 inline-flex items-center gap-2 px-6 py-3">
                <span>サービスの流れを見る</span>
                <span className="material-symbols-outlined">arrow_downward</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* AIOKのコンセプトセクション */}
      <div id="concept" className="max-w-6xl mx-auto bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-8 mb-12 transform hover:scale-[1.01] transition-all duration-300 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 bg-white/80 backdrop-blur rounded-lg px-4 py-2 shadow-sm">
          <span className="material-symbols-outlined text-gray-800">psychology_alt</span>
          AIの可能性を、もっと身近に
        </h2>
        <div className="prose prose-lg max-w-none text-gray-600">
          <div className="bg-white/80 backdrop-blur rounded-xl p-8 mb-6 shadow-material hover:shadow-xl transition-shadow duration-300">
            <p className="text-2xl font-bold text-gray-900 bg-blue-50 rounded-lg p-4 mb-4">
              「プロンプト設計やツール選択などを専門に担うクリエイター」があなたの代わりにAIを使いこなします。
            </p>
            <p className="text-lg text-indigo-800 leading-relaxed">
              「AIを使ってこんなものがほしい」という漠然としたイメージを提案するだけで、あとはクリエイターが最適な促し方・出力の調整を行い、成果物を形にします。
            </p>
          </div>
          <p className="mb-4">
            「AIでなんでもできる」と一口に言っても、実はAIに適切な指示を与えるためには、プロンプトエンジニアリングなどの"スキル"が必要です。
            AIに任せるほど制作スピードやアイデアの幅は広がりますが、その一方で「実際にどう指示すればいいのか分からない」「AIをうまく使いこなせない」という声もよく耳にします。
          </p>
          <p className="mb-4">
            AIOKは、そうした課題を解決するために生まれました。
            「AIに頼むこと」を丸ごと人に頼める――そんな新しいスタイルで、面倒な技術的ハードルを取り除き、AIの恩恵を誰でも簡単に享受できるようにするのがAIOKのコンセプトです。
          </p>
        </div>
      </div>

      {/* サービスの流れセクション */}
      <div id="flow" className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2 bg-white/80 backdrop-blur rounded-lg px-4 py-2 shadow-sm">
          <span className="material-symbols-outlined text-gray-800">timeline</span>
          サービスの流れ（依頼者の場合）
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {flowSteps.map((step, index) => (
            <div key={index} className="card hover:shadow-material-md transition-shadow">
              <div className="text-4xl mb-4 text-primary">
                <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>{step.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* クリエイターの場合のサービスの流れセクション */}
      <div className="max-w-6xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2 bg-white/80 backdrop-blur rounded-lg px-4 py-2 shadow-sm">
          <span className="material-symbols-outlined text-gray-800">timeline</span>
          サービスの流れ（クリエイターの場合）
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {creatorFlowSteps.map((step, index) => (
            <div key={index} className="card hover:shadow-material-md transition-shadow">
              <div className="text-4xl mb-4 text-primary">
                <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>{step.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* クリエイター報酬の受け取りについて */}
      <div className="max-w-6xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2 bg-white/80 backdrop-blur rounded-lg px-4 py-2 shadow-sm">
          <span className="material-symbols-outlined text-gray-800">payments</span>
          クリエイター報酬の受け取りについて
        </h2>
        <div className="card hover:shadow-material-md transition-shadow">
          <div className="prose prose-lg max-w-none">
            <p className="mb-6">
              AIOKでは、<strong>報酬のお支払いに「Stripe Connect」</strong>を使用しています。クリエイターとして報酬を受け取るためには、Stripeアカウントの登録が必要です。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">verified_user</span>
                  安全な決済プラットフォーム
                </h3>
                <p className="text-gray-600">
                  Stripeは、世界中で利用されている安全な決済プラットフォームです。
                  AIOKでは、本人確認や銀行口座情報の登録を含むお支払い手続きをStripeで一元管理しています。
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">security</span>
                  セキュリティ
                </h3>
                <p className="text-gray-600">
                  AIOKでは、クリエイター様の本人確認書類を直接受け取ることはございません。
                  必要な情報（本人確認書類や銀行口座情報など）は、Stripeの登録プロセスで直接提出いただく形となります。
                </p>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-xl p-6 mt-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                注意事項
              </h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>報酬の受け取りには、Stripeの登録が必須です。登録が完了しない場合、報酬をお支払いできませんのでご注意ください。</li>
                <li>Stripeの利用にあたっては、Stripeの利用規約が適用されます。</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* AIOKの思想と未来セクション */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2 bg-white/80 backdrop-blur rounded-lg px-4 py-2 shadow-sm">
          <span className="material-symbols-outlined text-gray-800">psychology</span>
          AIOKの思想と目指す未来
        </h2>
        <div className="card hover:shadow-material-md transition-shadow">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">lightbulb</span>
                AIOKの思想
              </h3>
              <p className="text-gray-600 mb-4">
                AIの活用を妨げず、より自由で効率的なプロダクションを実現。
                「AIに頼む感覚」をそのまま再現することを目指しています。
              </p>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">rocket_launch</span>
                目指す未来像
              </h3>
              <p className="text-gray-600 mb-4">
                「AIを否定せず、より便利に、より迅速に創作を楽しめる世界」
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* リテイクについてのセクション */}
      <div id="policy" className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2 bg-white/80 backdrop-blur rounded-lg px-4 py-2 shadow-sm">
          <span className="material-symbols-outlined text-gray-800">sync_alt</span>
          リテイク（修正依頼）について
        </h2>
        <div className="card hover:shadow-material-md transition-shadow">
          <div className="prose prose-lg max-w-none text-gray-600">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">lightbulb</span>
                  AIの特性を活かしたアプローチ
                </h3>
                <p className="mb-4">
                  AIにも本来「リテイク」という概念はありません。たとえ「無制限利用可能」とうたうAIであっても、実際には1日の利用回数やAPIコール数など、何らかの制限が設定されていることが多いです。
                </p>
                <p className="mb-4">
                  また、月額サブスクなどの料金体系であっても、実質的には「1回ごとに利用料金が発生していて」構造になっています。つまりAI利用の場合、依頼人が気に入るかどうか、イメージにあっているかどうかにかかわらず、AIに何か依頼すれば利用料はかかります。
                </p>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">speed</span>
                  スピード重視のポリシー
                </h3>
                <p className="mb-4">
                  当サービスは、こうしたAI利用の性質とスピード感を重視していて、リテイク不可としています。その代わりに、後払い制度を導入することで、<strong>依頼者の皆様のリスクを最小限に抑えています</strong>。
                </p>
                <p>
                  もし修正が必要な場合は、新たな依頼として改めてご依頼ください（同じ依頼者・別の依頼者どちらでも可です）。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 料金・お支払いセクション */}
      <div id="payment" className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2 bg-white/80 backdrop-blur rounded-lg px-4 py-2 shadow-sm">
          <span className="material-symbols-outlined text-gray-800">payments</span>
          料金・お支払い
        </h2>
        <div className="card hover:shadow-material-md transition-shadow">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">verified_user</span>
                安心の後払い制度
              </h3>
              <p className="text-gray-600 mb-4">
                当サービスでは、依頼内容にご満足いただけなかった場合、支払いをしなくても問題ありません。これは、依頼者に不利になりすぎることを避けるための仕組みです。
              </p>
              <p className="text-gray-600">
                「後払い」という形をとることで、まずは成果物をご確認いただき、気に入った場合のみお支払いいただくことができます。
              </p>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">savings</span>
                コスト効率の良い料金体系
              </h3>
              <p className="text-gray-600 mb-4">
                AIによる効率化でコストを抑えながら、プロフェッショナルなクオリティを実現。新しいクリエイティブ体験を、安心かつリーズナブルな料金でお試しいただけます。
              </p>
            </div>
          </div>

          {/* 手数料について */}
          <div className="mt-8 p-6 bg-indigo-50 rounded-xl">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              手数料について
            </h3>
            <p className="text-gray-600 mb-4">
              クリエイターへの報酬は、以下の手数料を控除した金額となります：
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>クレジットカード手数料：3.6％</li>
              <li>プラットフォームフィー：10.0％</li>
              <li>Stripe Connect利用料：0.5％</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const flowSteps = [
  {
    icon: 'edit_note',
    title: '1. 依頼内容を送信',
    description: '依頼したいクリエイターを探して依頼内容を送るだけ'
  },
  {
    icon: 'smart_toy',
    title: '2. AIを活用したプロダクション',
    description: 'クリエイターから成果物がアップロードされます'
  },
  {
    icon: 'task_alt',
    title: '3. 成果物を確認',
    description: 'ダウンロード等して確認'
  },
  {
    icon: 'payments',
    title: '4. 支払い（後払い）',
    description: '成果物に問題なければ支払い'
  }
];

const creatorFlowSteps = [
  {
    icon: 'how_to_reg',
    title: '1. サイトに登録',
    description: 'クリエイターとして登録し、プロフィールを作成'
  },
  {
    icon: 'payments',
    title: '2. 料金プラン設定',
    description: '提供するサービスの料金プランを設定'
  },
  {
    icon: 'account_balance',
    title: '3. ストライプ連携',
    description: 'アカウント設定でストライプ連携を行う'
  },
  {
    icon: 'build',
    title: '4. 制作とアップロード',
    description: 'AIを活用して制作し、成果物をアップロード'
  },
  {
    icon: 'schedule',
    title: '5. 支払いを待つ',
    description: '依頼者からの支払いを待ちます'
  }
]; 