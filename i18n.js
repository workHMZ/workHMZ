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
      langSwitch: 'Switch language to Japanese',
      protectedNodes: '{count} protected · not probed'
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
      langSwitch: 'Switch language to English',
      protectedNodes: '{count}件はアクセス保護のため未計測'
    },
    text: {
      'nav.home': 'ワーク',
      'nav.projects': 'プロジェクト',
      'nav.capabilities': '専門領域',
      'nav.systems': 'システム',
      'nav.record': '実績',
      'nav.credentials': '資格・語学',

      'hero.hi': 'こんにちは、',
      'hero.suffix': 'です',
      'hero.sr': 'AI Platform エンジニア。RAG・LLMOps、LLM の評価とガードレール、CI/CD と可観測性。',
      'hero.desc': 'AI システムと、それを届ける仕組みをつくっています。検索、API 連携、自動チェック、デプロイ。役立つ試作から、自分で運用できる形まで。',
      'impact.rag': 'RAG 検索成功率',
      'impact.e2e': 'E2E ケースを単独で自動化',
      'impact.cicd': 'デプロイ時間',
      'impact.years': '開発・運用経験',

      'hero.cta.systems': 'システムを見る',
      'hero.cta.record': '実績を見る',
      'hero.cta.projects': 'プロジェクト',
      'hero.cta.expertise': 'できること',
      'profile.cta': 'パーソナルサイト',
      'console.cadence': 'ブラウザから観測',

      'projects.title': '細部から、動く仕組みへ。',
      'projects.desc': '設計の判断も、例外処理も、コードに残しています。3つのオープンソースプロジェクトから、つくり方を紹介します。',
      'projects.source': 'ソースコードを見る',
      'projects.vertex.summary': '使い慣れた API から、Vertex AI Gemini へ。',
      'projects.vertex.body': 'Chat Completions と Responses に対応する OpenAI 互換ゲートウェイ。リクエスト転送だけでなく、認証情報のローテーション、ストリーミング中のエラー、ツール呼び出し、JSON Schema の扱いまで定義しています。',
      'projects.vertex.focus': '設計の焦点：正常系と異常系を含めた、API 境界の互換性。',
      'projects.rag.summary': '検索クエリから、段階的なリリースまで。',
      'projects.rag.body': '多言語 ONNX 埋め込み、Azure AI Search のハイブリッド・セマンティック検索、構造化出力を組み合わせた RAG ラボ。署名付きイメージ、SBOM、カナリアリリース、ロールバックまで、アプリケーションとデリバリーをつないでいます。',
      'projects.rag.focus': '設計の焦点：検索品質とリリースの仕組みを、ひとつのシステムとして扱う。',
      'projects.filebox.summary': '接続が途切れても、再開できるファイル共有。',
      'projects.filebox.body': '8 MiB 単位の再開可能なアップロード、受け取りセッションの計数、コンテンツの重複排除。クリーンアップも再試行可能にし、途中で失敗してもメタデータとオブジェクトの整合性を回復できる設計です。',
      'projects.filebox.focus': '設計の焦点：転送の再開、状態の整合性、やり直せるクリーンアップ。',

      'cap.title': 'できること',
      'cap.desc': '検索の課題、API の連携、リリース作業の改善。アプリケーションから、必要な基盤と検証までつないで考えます。',
      'cap.ai.title': 'AI 基盤・RAG・LLMOps',
      'cap.ai.body': '実際のトレースから検索を改善し、スキーマと成果物のチェックでモデル出力を検証。役立つ回答と、確認できる根拠を目指します。',
      'pipe.ingest': '取り込み',
      'pipe.chunk': 'チャンク',
      'pipe.retrieve': '検索',
      'pipe.generate': '生成',
      'pipe.eval': '評価',
      'pipe.guard': 'ガード',

      'cap.delivery.title': 'CI/CD・DevSecOps',
      'cap.delivery.body': '再利用できるリリースフロー、並列化とキャッシュ、スキャンと成果物への署名。繰り返す手作業を、チームが維持できる仕組みに変えます。',
      'cap.cloud.title': 'クラウド・エッジ',
      'cap.cloud.body': '公開アプリケーションはエッジへ、プライベートなツールにはアクセス制御を。クラウド、ネットワーク、自宅基盤の境界を整理して構築します。',
      'cap.obs.title': '可観測性・品質',
      'cap.obs.body': 'Datadog の監視をコードで管理し、LLM は LangFuse でトレース。自動チェックとその根拠をつなぎ、失敗や運用中の信号から次の改善を決めます。',

      'sys.title': 'リポジトリから、稼働中のサービスまで',
      'sys.desc': '運用の一断面。公開エンドポイントはブラウザから計測し、保護されたサービスは別表示にしています。未計測のサービスの正常性は推測しません。',
      'sys.ai.desc': 'Vertex AI Gemini を OpenAI 互換で使える Workers 製プロキシ。ストリーミングとキーローテーションに対応。',
      'sys.ai.run': 'プロキシ経由のプライベートチャット',
      'sys.delivery.desc': 'CI だけで動く鉄道遅延モニター。定期実行・Pages 公開・チャット通知。',
      'sys.delivery.run': 'cron で更新される公開ページ',
      'sys.cloud.desc': 'Workers・R2・D1 で動く、レジューム対応のファイル共有。',
      'sys.cloud.run': '計測ごとにヘルスチェック',
      'sys.open': '開く',
      'sys.private': 'プライベート環境',
      'platform.title': 'ハイブリッド自宅基盤',
      'platform.desc': '自宅基盤、NAS、クラウドサービス。公開アプリケーションと個人用ツールのアクセス方針を分けて運用しています。',

      'rec.title': '本番で届けてきたもの',
      'rec.desc': 'これまでの業務から。顧客情報は伏せ、担当範囲と実際に確認した成果を紹介します。',
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

      'footer.text': '© 2026 Akira. つくる、確かめる、運用する。公開コードはこのページに、日々の記録は Field Notes に。'
    }
  }
};
