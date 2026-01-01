# OBS setlist
![](https://img.shields.io/badge/status-release-blue?style=flat)
![](https://img.shields.io/badge/version-1.0.0-blue?style=flat)
![](https://img.shields.io/badge/SurralDB-2.4.0-purple?style=flat)

## 前提条件
- [NodeJS](https://nodejs.org/en/download/)
- [SurrealDB](https://docs.surrealdb.com/docs/installation/windows#installing-surrealdb-using-the-install-script)

## 起動方法

2つのターミナルプロセスを同時に実行する必要があります。

### 1. データベースの起動
ターミナルを開き、以下のコマンドを実行します：

```bash
npm run db
```

### 2. アプリケーションの起動
プロジェクトディレクトリで**新しい**ターミナルウィンドウを開き、以下のコマンドを実行します：

```bash
npm run dev
```

その後、ブラウザで表示されたURL（通常は `http://localhost:5173`）を開きます。

## 終了方法

アプリケーションを完全に停止するには：

1.  **フロントエンドの停止**: `npm run dev` を実行しているターミナルで `Ctrl + C` を押します。
2.  **データベースの停止**: `npm run db` を実行しているターミナルで `Ctrl + C` を押します。

## 主な機能
- **楽曲管理**: あいまい検索、カラオケ/歌詞リンクの管理。
- **セットリスト**: 作成、楽曲ライブラリからのドラッグ＆ドロップによる追加。
- **インポート/エクスポート**: JSON形式によるデータのバックアップと復元。
- **ライブオーバーレイ**: VTuber向けのカスタマイズ可能なOBS用オーバーレイ。

## データベース設定

データベースの接続情報は `src/config.js` で管理されています：

```javascript
export const config = {
    database: {
        host: '127.0.0.1',
        port: 8000,
        user: 'root',
        pass: 'root',
        namespace: 'song_manager',
        database: 'core'
    },
    // ...
};
```

> [!NOTE]
> ここで `port` や `pass` を変更し、かつ `npm run db` で起動している場合は、`package.json` 内の `db` スクリプトも同様に更新してください。

## ライブオーバーレイのテーマ

ライブオーバーレイ（`#live`）の見た目は `src/config.js` でカスタマイズできます。

### テーマの切り替え
`src/config.js` の `theme` プロパティを変更します：
```javascript
export const config = {
    liveDisplay: {
        theme: 'neon', // 'default', 'minimal', または 'neon'
    },
    // ...
};
```

### テーマの作成・カスタマイズ
`themes` オブジェクト内の各テーマには以下のプロパティが含まれます：

- **スタイル設定**:
  - `fontFamily`: 全体のフォント。
  - `accentColor`: ラベルなどのアクセントカラー。
  - `nowPlayingBg`: 「NOW PLAYING」ボックスの背景色・透明度。
  - `historyColor`: 履歴リストのテキスト色。
  - `blur`: 背景のぼかし強度（例：`10px`）。
  - `textShadow`: （任意）グロー効果（文字の光）。

- **配置設定**:
  各要素（`nowPlaying` と `history`）は独立した座標を持ちます：
  - `top`, `bottom`, `left`, `right`: CSSの座標（例：`"2rem"`）。
  - `textAlign`: `"left"`, `"center"`, または `"right"`。

テーマ構造の例：
```javascript
custom: {
    fontFamily: "'Inter', sans-serif",
    accentColor: "#ffffff",
    // ... その他のスタイル
    nowPlaying: { top: "2rem", left: "2rem", textAlign: "left" },
    history: { top: "12rem", left: "2rem", textAlign: "left" }
}
```
