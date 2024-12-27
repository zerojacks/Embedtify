module.exports = {
    // 解析器配置
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 2020
    },

    // 插件配置
    plugins: [
        '@typescript-eslint/eslint-plugin',
        'prettier'
    ],

    // 继承的推荐配置
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:prettier/recommended'
    ],

    // 根目录配置
    root: true,

    // 环境配置
    env: {
        node: true,
        jest: true,
        es2020: true
    },

    // 忽略的文件
    ignorePatterns: [
        '.eslintrc.js',
        'dist/',
        'node_modules/'
    ],

    // 详细规则配置
    rules: {
        // 代码风格规则
        'no-console': 'warn',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_'
        }],

        // TypeScript特定规则
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',

        // 代码复杂度控制
        'complexity': ['warn', 10],
        'max-depth': ['warn', 4],
        'max-lines-per-function': ['warn', 50],

        // 安全相关
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'error',

        // 性能相关
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',

        // Prettier集成
        'prettier/prettier': [
            'error',
            {
                singleQuote: true,
                trailingComma: 'es5',
                printWidth: 100,
                tabWidth: 2,
                semi: true,
                arrowParens: 'always'
            }
        ]
    }
};