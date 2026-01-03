# OBS setlist
![](https://img.shields.io/badge/status-release-blue?style=flat)
![](https://img.shields.io/badge/version-1.1.1-blue?style=flat)
![](https://img.shields.io/badge/SurralDB-2.4.0-purple?style=flat)

[English README](./README.md)

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

## ライブオーバーレイのカスタマイズ

ライブオーバーレイ (`#live`) の見た目とレイアウトは `src/config.js` で個別にカスタマイズできます。

### テーマと配置の切り替え
ビジュアルスタイル（テーマ）と画面上の配置（ポジション）を独立して変更できます。

```javascript
liveDisplay: {
    theme: 'default', // デザイン
    positon: 'left_top', // 画面上の配置
    maxVisibleHistory: 10, // 自動スクロールを開始する件数
}
```
### 利用可能なプリセット

#### テーマ (`theme`)
- `default`
- `minimal`
- `neon`
- `cyberpunk`
- `elegance`

#### 配置 (`position`)
- `top_left`
- `top_center`
- `top_right`
- `bottom_left`
- `bottom_center`
- `bottom_right`

### Customizing Styles
`config.js`の`themes`オブジェクトで視覚的なプロパティを定義します :
- `fontFamily` : 使用するフォント。
- `accentColor` : ハイライトカラー。
- `nowPlayingBg` : 背景色とぼかし。
- `historyColor` : 履歴のテキスト色。
- `textShadow` : グロー効果。
- `fontSizes` : テキストのサイズを設定する
  - `historyItem` : 履歴
  - `nowPlayingLabel` : NOW PLAYING
  - `nowPlayingTitle` : 曲タイトル
  - `nowPlayingArtist` : アーティスト名

### Customizing Positions
`positions`オブジェクトで詳細な座標を定義します :
- `top`, `bottom`, `left`, `right` : CSSの座標値。
- `textAlign` : ボックス内のテキスト揃え。
- `margin`, `width`, `transform` : (Advanced) 中央寄せや微調整用。
