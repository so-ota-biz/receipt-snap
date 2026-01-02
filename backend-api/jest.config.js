module.exports = {
  // 基本設定
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',

  // カバレッジ設定
  collectCoverageFrom: [
    '**/*.(t|j)s',
    // テストファイル除外
    '!**/*.spec.ts',
    // node_modules除外
    '!**/node_modules/**',
    // ビルド済みファイル除外
    '!**/dist/**',
    // モジュールファイル除外
    '!**/*.module.ts',
    // エントリーポイント除外
    '!**/main.ts',
    // インターフェース除外
    '!**/*.interface.ts',
    // DTO除外
    '!**/*.dto.ts',
  ],
  coverageDirectory: '../coverage',

  // カバレッジ閾値（オプション）
  coverageThreshold: {
    global: {
      // 分岐カバレッジ 70%以上
      branches: 70,
      // 関数カバレッジ 70%以上
      functions: 70,
      // 行カバレッジ 70%以上
      lines: 70,
      // ステートメントカバレッジ 70%以上
      statements: 70,
    },
  },

  // モジュールパスのエイリアス
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // テストタイムアウト（デフォルトは5秒）
  testTimeout: 10000,

  // テスト実行前のセットアップファイル
  //   setupFilesAfterEnv: ['<rootDir>/../test/setup.ts'],

  // 並列実行の最大ワーカー数
  maxWorkers: '50%',

  // 詳細な出力
  verbose: true,

  // カバレッジレポートの形式
  coverageReporters: ['text', 'lcov', 'html'],
}
