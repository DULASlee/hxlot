// ESLint package-level restrictions for lowcode-tools
module.exports = {
    extends: ['../../.eslintrc.cjs'],
    rules: {
        'no-restricted-imports': [
            'error',
            {
                patterns: [
                    {
                        group: ['@smartabp/lowcode-tools', '@smartabp/lowcode-tools/*'],
                        message: '禁止在 lowcode-tools 包内使用包别名自引用，请使用相对路径引用内部模块。'
                    },
                    {
                        group: ['@/*'],
                        message: '禁止在 packages 内使用 @/ 别名；请使用 @smartabp/* 或相对路径。'
                    },
                    {
                        group: ['**/packages/**'],
                        message: '禁止跨包相对路径引用 packages/**，请使用 @smartabp/* 包别名。'
                    },
                    {
                        group: ['@smartabp/*/src/*'],
                        message: '禁止从包的 src 入口导入，请使用包根导出。'
                    },
                    {
                        group: ['@smartabp/metadata-core', '@smartabp/metadata-core/*'],
                        message: 'metadata-core 已废弃，请使用 @smartabp/lowcode-shared。'
                    }
                ]
            }
        ]
    }
}


