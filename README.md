# thanks-web-backend

フードバンクありがとう Website のバックエンドです。おたよりの投稿フローとデータを管理しています。

<https://thankyou.fbyamaguchi.org/>

> [!IMPORTANT]
> Web サイトはフロントエンド側で管理しています。
> 実際にサービスとして提供するには、フロントエンドを含めた Web 環境の構築が必要です。

<https://github.com/foodbank-ymg/thanks-web-frontend/>

## ローカル環境

[LINE 公式アカウント](https://www.lycbiz.com/jp/service/line-official-account/)を使います。Messaging API のチャネルを 2 つ（投稿側/管理側）作成します。

[.env.boilerplate](.env.boilerplate) をコピーして `.env` ファイルを作成し、各種シークレット変数を設定してください。

[Nodejs](https://nodejs.org/)と [yarn](https://yarnpkg.com/) をインストールしてください。

依存パッケージをインストールした後、ローカル実行します。

```shell
yarn
yarn start
```

<http://localhost:8080> で API サーバーが起動します。

LINE の疎通と検証を行うには、[ngrok](https://ngrok.com/)などを用いてローカルネットワークを外部公開してください。

## Web サービス環境

[GCP](https://console.cloud.google.com/) の Cloud Run と Cloud Storage を使います。

GCP は[Firebase](https://firebase.google.com/)を内包しているので、Firebase プロジェクトを作成していれば、既に GCP プロジェクトを扱うことができます。

2 つの GCP/Firebase 環境（開発用/本番用）を前提とした GitHub Actions の自動リリースを組んでいます。

- `develop`ブランチにマージすると、開発環境に自動リリース
- `main`ブランチにマージすると、本番環境に自動リリース

Firebase/GCP が準備できたら、GitHub Actions に各種シークレット変数を登録してください。

## ライセンス

このプロジェクトは GNU Affero General Public License v3.0（AGPL-3.0）の条件の下でライセンスされています。

詳細については、このリポジトリの[LICENSE](LICENSE)ファイルをご覧ください。
