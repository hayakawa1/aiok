import PolicyTabs from '@/components/PolicyTabs'

export default function 特定商取引法に基づく表記Page() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <PolicyTabs />
        <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
          <h1 className="text-2xl font-bold mb-6">特定商取引法に基づく表記</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">事業者の名称</h2>
              <p className="text-gray-600">
                株式会社ビット
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4">代表者</h2>
              <p className="text-gray-600">
                代表取締役 早川望
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4">所在地</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>〒1176-0001</li>
                <li>東京都練馬区練馬1-20-8日建練馬ビル2F</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4">お問い合わせ先</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>メールアドレス：aiok.jp2025@gmail.com（24時間受付）</li>
                <li>電話番号：お問い合わせいただいた方に開示いたします</li>
                <li>メールでのお問い合わせ対応時間：平日10:00〜17:00（土日祝日・年末年始を除く）</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4">サービスの対価</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>依頼者が設定した金額</li>
                <li>消費税：内税</li>
                <li>支払時期：納品後お支払いください</li>
                <li>支払方法：クレジットカード決済</li>
                <li>手数料：クレジットカード決済手数料は当社が負担</li>
                <li>その他費用：追加料金は発生しません</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4">支払いの詳細</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>支払時期：作品の納品を確認後、24時間以内に決済が実行されます</li>
                <li>支払方法：クレジットカード</li>
                <li>支払手続き：納品確認後、登録されたクレジットカードに自動で請求されます</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4">提供時期</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>依頼者とクリエイター間で合意した納期に従います</li>
                <li>具体的な納期は、個別の取引ごとに設定されます</li>
                <li>依頼から納品までの標準的な期間：7日間〜30日間</li>
                <li>納期遅延が発生する可能性がある場合は、事前に依頼者に通知されます</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4">返品・キャンセルについて</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>作品の性質上、返品には応じられません</li>
                <li>納品前であれば、クリエイターは理由を問わず契約を解除できます</li>
                <li>依頼者は納品された作品に満足できない場合、報酬を支払わないことができます</li>
                <li>本サービスは通信販売におけるクーリングオフ制度の対象とはならないため、納品後のキャンセルや返金は原則できません</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4">動作環境</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>推奨ブラウザ：Google Chrome最新版、Firefox最新版、Safari最新版</li>
                <li>推奨OS：Windows 10以降、macOS 10.15以降</li>
                <li>その他：JavaScript有効化が必要</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4">表記の変更</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>本表記の内容は、予告なく変更される場合があります</li>
                <li>変更後の内容は、本ウェブサイト上に掲載した時点で効力を生じるものとします</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}