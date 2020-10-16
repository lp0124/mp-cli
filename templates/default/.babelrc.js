const path = require('path')
const { resolvePath } = require('babel-plugin-module-resolver')

module.exports = {
  plugins: [
    /**
     * 提前整理、计算某些表达式
     */
    'babel-plugin-transform-inline-consecutive-adds',
    'babel-plugin-minify-constant-folding',
    // 空值合并运算符
    '@babel/plugin-proposal-nullish-coalescing-operator',
    // 可选链
    '@babel/plugin-proposal-optional-chaining',
    [
      'module-resolver',
      {
        alias: {
          '@': './src',
          '@': './.cache',
        },
        resolvePath(sourcePath, currentFile, opts) {
          let result = resolvePath(sourcePath, currentFile, opts)

          if (!opts || !opts.alias) {
            return result
          }

          const { alias } = opts
          let useAlias = false
          let aliasKey = ''
          for (const key in alias) {
            if (sourcePath.indexOf(key) === 0) {
              useAlias = true
              aliasKey = key
              break
            }
          }
          if (!useAlias) {
            return result
          }

          const targetFile = path.join(__dirname, alias[aliasKey], sourcePath.replace(aliasKey, ''))
          const relativePath = path.relative(currentFile, targetFile).replace(/\\/g, '/')
          const index = relativePath.indexOf(result)
          return relativePath.slice(index)
        },
      },
    ],
  ],
}
