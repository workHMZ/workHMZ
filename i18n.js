/* Copy for the EN / JA switch.
 * Concise, airy phrasing so cards breathe comfortably in both languages.
 */
window.PORTFOLIO_I18N = {
  en: {
    title: 'Akira — AI Platform / DevOps Engineer',
    ui: {
      themeToDark: 'Switch to dark theme',
      themeToLight: 'Switch to light theme',
      langSwitch: 'Switch language to Japanese',
      liveUp: '{healthy} / {total} up',
      avg: 'avg {ms} ms',
      clockSame: 'same timezone',
      clockAhead: '+{d}',
      clockBehind: '−{d}',
      hours: '{h}h',
      hoursMinutes: '{h}h {m}m',
      rulerIdle: 'Scrub to inspect JST',
      rulerNow: 'Now · {h}:00 JST',
      rulerWork: '{h}:00 · active',
      rulerQuiet: '{h}:00 · quiet',
      calPlay: 'Play pixel timeline (2020–2025)',
      calArt: 'Pixel art',
      calReal: '{n} contributions · as of {date}',
      calRealTheme: 'Actual activity',
      calRealDetail: 'commits, PRs & reviews'
    },
    calendar: {
      2020: ['Arriving in Japan', 'Mount Fuji & cherry blossoms'],
      2021: ['Learning', 'book & pencil'],
      2022: ['Starting work', 'laptop & briefcase'],
      2023: ['Interlude', 'space invader & UFO'],
      2024: ['Working with AI', 'AI lettering & robot'],
      2025: ['Cloud engineering', 'AWS, observability, AI, containers & cloud']
    }
  },

  ja: {
    title: 'Akira — AI Platform / DevOps エンジニア',
    ui: {
      themeToDark: 'ダークテーマに切り替え',
      themeToLight: 'ライトテーマに切り替え',
      langSwitch: 'Switch language to English',
      liveUp: '{healthy} / {total} 稼働',
      avg: '平均 {ms} ms',
      clockSame: '同じ時刻帯',
      clockAhead: '+{d}',
      clockBehind: '−{d}',
      hours: '{h}時間',
      hoursMinutes: '{h}時間{m}分',
      rulerIdle: '目盛りで時間帯を確認',
      rulerNow: '現在 · {h}:00 JST',
      rulerWork: '{h}:00 · 稼働時間',
      rulerQuiet: '{h}:00 · オフ',
      calPlay: '年ごとに再生（2020〜2025）',
      calArt: 'ピクセル画',
      calReal: '{n} 件 · {date} 時点',
      calRealTheme: '実際の活動',
      calRealDetail: '今年のコミット・PR・レビュー'
    },
    calendar: {
      2020: ['来日', '富士山と桜'],
      2021: ['学び', '本と鉛筆'],
      2022: ['仕事のはじまり', 'ノート PC とかばん'],
      2023: ['ひと休み', 'インベーダーと UFO'],
      2024: ['AI 開発へ', 'AI の文字とロボット'],
      2025: ['クラウド基盤', 'AWS・可観測性・AI・コンテナ・クラウド']
    },
    text: {
      'ui.skip': '本文へ移動',
      'ui.top': 'ページの先頭へ',

      'nav.work': '個人開発 OSS',
      'nav.experience': '職務実績',
      'nav.systems': '稼働状況',

      'intro.role': 'AI Platform ／ DevOps エンジニア',
      'intro.place': '日本',
      'intro.title': '<span class="hl-lead">AI システムと、</span><span class="hl-main"><span class="ph">それを届ける</span><span class="ph">仕組みを</span><span class="ph">つくる。</span></span>',
      'intro.lede': '検索基盤（RAG）、API ゲートウェイ、自動検証から CI/CD・可観測性まで、設計から本番運用まで一貫して手がけています。',
      'intro.work': '個人開発 OSS (6)',

      'facts.focus': '主要領域',
      'facts.edge': '担当範囲',
      'facts.edgeVal': '要件定義〜構築・本番運用',
      'facts.exp': '実務経験',
      'facts.expVal': '開発・運用 4年+',
      'facts.open': '新しい機会を検討中',

      'impact.label': '業務での主な成果',
      'impact.more': '詳細',
      'now.state': '進行中',
      'imp.e2e.short': '全画面 E2E テストを単独で自動化',
      'imp.rag.short': '大手通信 1万件超 PDF 検索の改善',
      'imp.cicd.badge': 'CI/CD',
      'imp.cicd.short': '並列化とキャッシュでデプロイ時間を短縮',

      'clock.label': '東京 · UTC+9',

      'cal.label': 'コントリビューション',
      'cal.note': '2020〜2025年はさかのぼりコミットで描いたピクセル自伝、2026年は実際の活動記録です。',

      'creds.label': '認定資格・語学',
      'cred.aws.note': 'AWS 最上位プロフェッショナル認定',
      'lang.zh': '中国語',
      'lang.zh.level': 'ネイティブ',
      'lang.ja': '日本語',
      'lang.ja.level': 'ビジネス',
      'lang.en': '英語',
      'lang.en.level': '技術文書読解',

      'stack.label': '技術スタック',
      'cap.ai.title': 'AI 基盤 · RAG · LLMOps',
      'cap.delivery.title': 'CI/CD · DevSecOps',
      'cap.cloud.title': 'クラウド · 可観測性 · 品質',

      'sys.label': '稼働中のシステム',
      'sys.private': ' · 非公開',
      'sys.note': 'ブラウザから実測。保護されたエンドポイントは推測せず明示します。',

      'work.kicker': '個人開発 · GitHub 公開リポジトリ',
      'work.title': '個人開発の公開リポジトリ',
      'projects.desc': 'すべて個人でゼロから設計・実装し workHMZ で公開。設計契約・異常系処理・CI までコードで確認できます。',
      'projects.soloOss': '個人開発 OSS',
      'projects.source': 'ソースを見る',
      'projects.vertex.meta': '依存ゼロのエッジ実装',
      'projects.release': 'リリース一覧',
      'projects.liveApp': '公開稼働中 · box.mingzhe.uk',

      'projects.vertex.kicker': 'API 統合・ゲートウェイ',
      'projects.vertex.summary': '使い慣れた API から、Vertex AI Gemini へ。',
      'projects.vertex.body': 'Chat Completions / Responses 対応の OpenAI 互換ゲートウェイ。鍵ローテーション、SSE 中断、ツール呼び出し、JSON Schema を契約として吸収します。',
      'projects.rag.kicker': '検索基盤・段階的デリバリー',
      'projects.rag.summary': '検索クエリから、段階的なリリースまで。',
      'projects.rag.body': '多言語 ONNX 埋め込みと Azure AI Search のハイブリッド検索に、署名付きイメージ・SBOM・カナリアリリース・ロールバックまでを一気通貫で接続。',
      'projects.filebox.kicker': '分散ストレージ・障害回復',
      'projects.filebox.summary': '接続が途切れても、再開できるファイル共有。',
      'projects.filebox.body': '8 MiB 分割の再開アップロード、受取コード管理、重複排除を実装。再試行可能なクリーンアップで D1 と R2 の整合性を保ちます。',

      'more.label': 'その他の個人開発リポジトリ',
      'more.transit': '定期 Actions と Pages で動く鉄道遅延モニター。',
      'more.kintai': 'Cloudflare だけで完結する、日本向けの勤怠管理。',
      'more.profile': '本サイトとピクセル自伝。ゼロビルドの静的構成。',
      'more.live': '公開中',

      'exp.kicker': '職務経歴 · クライアント実績',
      'sec.rec.title': '業務で本番稼働させた実績',
      'rec.desc': '顧客情報は伏せ、担当範囲と計測された成果だけを記録しています。',
      'rec.current': '進行中',
      'rec.solo': '1名',
      'rec.team4': '4名',
      'rec.team6': '6名',
      'rec.e2e.title': 'AI を活用した E2E テスト自動化基盤',
      'rec.e2e.role': 'AI Platform／テスト自動化',
      'rec.e2e.p1': 'Excel → YAML → Playwright の契約駆動パイプライン。ガードレール付きで仕様書からテストを生成。',
      'rec.e2e.p2': '2環境を12観点で比較し、ハッシュ連鎖で誤判定を防ぐ Fail-closed 設計。',
      'rec.e2e.outcome': '全画面のケースを単独で自動化',
      'rec.rag.title': '大手通信キャリア向け 社内ナレッジ検索 RAG',
      'rec.rag.role': 'AI／DevOps エンジニア',
      'rec.rag.p1': '10,000件超の PDF に対し、文書種別ルーティング（Dify）と OpenSearch インデックスを設計。',
      'rec.rag.p2': 'Langfuse トレース分析で「ボトルネックはモデルではなく検索設計」と特定し改善。',
      'rec.rag.outcome': '検索成功率 +22pt',
      'rec.cicd.title': '通信企業向け CI/CD パイプライン構築・運用自動化',
      'rec.cicd.role': 'DevOps エンジニア',
      'rec.cicd.p1': '複数チーム・案件で使う共通 GitHub Actions フローと、Datadog のダッシュボード・アラート設計。',
      'rec.cicd.outcome': '並列化とキャッシュでデプロイ短縮',

      'footer.text': '公開コードはこのページに、日々の記録は Field Notes に。'
    }
  }
};
