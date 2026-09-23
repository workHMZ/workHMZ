/* Akira Portfolio — copy for the EN / JA switch.
 * English body copy lives in index.html (it is what crawlers and no-JS visitors read);
 * this file only carries the Japanese strings plus the UI text script.js writes itself.
 * Status tokens (ACTIVE, PROBING, BUILD, RUN ...) stay English on purpose: they read as system output.
 */
window.PORTFOLIO_I18N = {
  en: {
    title: 'Akira | AI Platform Engineer - RAG, LLMOps, DevOps',
    typed: [
      'AI Platform Engineer.',
      'RAG & LLMOps.',
      'LLM evaluation & guardrails.',
      'CI/CD & observability.'
    ],
    ui: {
      themeToDark: 'Switch to dark theme',
      themeToLight: 'Switch to light theme',
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
      langSwitch: 'Switch language to Japanese'
    }
  },

  ja: {
    title: 'Akira | AI Platform エンジニア',
    typed: [
      'AI Platform Engineer',
      'RAG・LLMOps',
      'LLM の評価とガードレール',
      'CI/CD と可観測性'
    ],
    ui: {
      themeToDark: 'ダークテーマに切り替え',
      themeToLight: 'ライトテーマに切り替え',
      menuOpen: 'メニューを開く',
      menuClose: 'メニューを閉じる',
      langSwitch: 'Switch language to English'
    },
    text: {
      'nav.home': 'ホーム',
      'nav.capabilities': '専門領域',
      'nav.systems': 'システム',
      'nav.record': '実績',
      'nav.credentials': '資格・語学',

      'hero.hi': 'こんにちは、',
      'hero.suffix': 'です',
      'hero.sr': 'AI Platform エンジニア。RAG・LLMOps、LLM の評価とガードレール、CI/CD と可観測性。',
      'hero.desc': '生成AIを、本番で信頼できるものに。RAG・評価・ガードレールと、それを支える CI/CD・可観測性をつくっています。',
      'impact.rag': 'RAG 検索成功率',
      'impact.e2e': 'E2E ケースを単独で自動化',
      'impact.cicd': 'デプロイ時間',
      'impact.years': '開発・運用経験',

      'hero.cta.systems': 'システムを見る',
      'hero.cta.record': '実績を見る',
      'console.cadence': 'ブラウザから計測',

      'cap.title': '構築して、運用する',
      'cap.desc': '軸足は AI 基盤。それを動かし続けるデリバリー・クラウド・可観測性まで。',
      'cap.ai.title': 'AI 基盤・RAG・LLMOps',
      'cap.ai.body': '検索こそがプロダクト。トレースで磨き、AI の誤判定はガードレールで止める。',
      'pipe.ingest': '取り込み',
      'pipe.chunk': 'チャンク',
      'pipe.retrieve': '検索',
      'pipe.generate': '生成',
      'pipe.eval': '評価',
      'pipe.guard': 'ガード',

      'cap.delivery.title': 'CI/CD・DevSecOps',
      'cap.delivery.body': 'チームで再利用できる共通パイプライン。並列化で速く、署名とスキャンで安全に。',
      'cap.cloud.title': 'クラウド・エッジ',
      'cap.cloud.body': '公開はエッジ、プライベートは自宅と3つのクラウド。入口はゼロトラストに集約。',
      'cap.obs.title': '可観測性・品質',
      'cap.obs.body': 'GKE の監視は IaC で、LLM は LangFuse でトレース。証明できない「成功」は出さない。',

      'sys.title': 'リポジトリから、稼働中のサービスまで',
      'sys.desc': 'つくったものが、いま動いている。ステータスはブラウザから計測しています。',
      'sys.ai.desc': 'Vertex AI Gemini を OpenAI 互換で使える Workers 製プロキシ。ストリーミングとキーローテーションに対応。',
      'sys.ai.run': 'プロキシ経由のプライベートチャット',
      'sys.delivery.desc': 'CI だけで動く鉄道遅延モニター。定期実行・Pages 公開・チャット通知。',
      'sys.delivery.run': 'cron で更新される公開ページ',
      'sys.cloud.desc': 'Workers・R2・D1 で動く、レジューム対応のファイル共有。',
      'sys.cloud.run': '計測ごとにヘルスチェック',
      'sys.open': '開く',
      'platform.title': 'ハイブリッド自宅基盤',
      'platform.desc': '20以上のサービスを自宅・NAS・3つのクラウドに分散し、ひとつのエッジに集約。',

      'rec.title': '本番で届けてきたもの',
      'rec.desc': '直近の3案件。顧客名は伏せ、数字はそのまま。',
      'rec.current': '進行中',
      'rec.solo': '1名',
      'rec.team4': '4名',
      'rec.team6': '6名',
      'rec.e2e.title': 'AI を活用した E2E テスト自動化基盤',
      'rec.e2e.role': 'AI Platform／テスト自動化',
      'rec.e2e.p1': 'Excel → YAML → Playwright の契約駆動基盤。仕様書からのテスト生成は AI とガードレールで。',
      'rec.e2e.p2': '2環境を12観点で比較し、ハッシュ連携で誤った成功判定を防ぐ Fail-closed 設計。',
      'rec.e2e.outcome': '全画面のケースを単独で自動化',
      'rec.rag.title': '大手通信キャリア向け 社内ナレッジ検索 RAG',
      'rec.rag.role': 'AI／DevOps エンジニア',
      'rec.rag.p1': '文書種別でルーティングする Dify ワークフローと、OpenSearch のインデックス設計。',
      'rec.rag.p2': '10,000件超の PDF。原因はモデルでなく検索設計だと、LangFuse のトレースで特定。',
      'rec.rag.outcome': '検索成功率 +22pt',
      'rec.cicd.title': '通信企業向け CI/CD 構築・運用自動化',
      'rec.cicd.role': 'DevOps エンジニア',
      'rec.cicd.p1': 'チーム横断で再利用する GitHub Actions の共通フローと、Datadog の監視設計。',
      'rec.cicd.outcome': '並列化とキャッシュでデプロイ時間を短縮',

      'cred.title': '資格・語学',
      'cred.aws.note': 'AWS 最上位のアーキテクチャ認定。',
      'lang.zh': '中国語',
      'lang.zh.level': 'ネイティブ',
      'lang.ja': '日本語',
      'lang.ja.level': 'ビジネス',
      'lang.en': '英語',
      'lang.en.level': '技術文書・日常会話',

      'footer.text': '© 2026 Akira. このページのステータスは、すべてブラウザから計測しています。'
    }
  }
};
