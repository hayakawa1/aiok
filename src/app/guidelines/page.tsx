export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">ガイドライン</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">1. 基本方針</h2>
              <p className="text-gray-600">
                AIOKは、AIを活用したクリエイターとクライアントのマッチングプラットフォームです。
                すべてのユーザーが安心して利用できる環境を維持するため、以下のガイドラインを設けています。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. 禁止事項</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>法令違反となる行為</li>
                <li>他者の権利を侵害する行為</li>
                <li>虚偽の情報を提供する行為</li>
                <li>システムに負荷をかける行為</li>
                <li>その他、運営が不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. 依頼時の注意事項</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>依頼内容は具体的かつ明確に記載してください</li>
                <li>著作権や利用規約に違反する内容は依頼できません</li>
                <li>適切な報酬設定を心がけてください</li>
                <li>納期は余裕を持って設定してください</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. 支払いについて</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>支払いはすべてプラットフォームを通じて行われます</li>
                <li>直接の取引は禁止されています</li>
                <li>依頼完了後、速やかに支払い処理を行ってください</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. 著作権について</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>納品物の著作権は、特段の定めがない限り依頼者に帰属します</li>
                <li>第三者の著作権を侵害しないよう注意してください</li>
                <li>AIを使用する場合は、各AIサービスの利用規約に従ってください</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. 違反への対応</h2>
              <p className="text-gray-600">
                ガイドラインに違反する行為が確認された場合、警告、アカウントの一時停止、永久停止などの
                措置を取らせていただく場合があります。
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 