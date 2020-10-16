const { transform } = require('@babel/core')
const t = require('@babel/types')

function capitalize([first, ...rest], lowerRest = false) {
  return first.toUpperCase() + (lowerRest ? rest.join('').toLowerCase() : rest.join(''))
}

function dispatchProperties(properties) {
  const result = {
    properties: [],
    observer: [],
  }

  function createTypeNode(value) {
    switch (value) {
      case 'String':
        return t.stringLiteral('')
      case 'Number':
        return t.numericLiteral(0)
      case 'Boolean':
        return t.booleanLiteral(false)
      case 'Object':
        return t.objectExpression([])
      case 'Array':
        return t.arrayExpression([])
      case null:
        return t.nullLiteral()
    }
  }

  function createNode(key, val) {
    return t.objectProperty(t.identifier(key), t.isNode(val) ? val : createTypeNode(val))
  }

  result.properties = properties.map(v => {
    const key = v.key.name
    const value = v.value
    /**
     * properties: {
     *  myProperty1: {
     *    type: String,
     *    value: '',
     *    observer(){}
     *  }
     * }
     */
    if (t.isObjectExpression(value)) {
      const val = value.properties.find(v => v.key.name === 'value')
      const type = value.properties.find(v => v.key.name === 'type')
      const observer = value.properties.find(v => v.key.name === 'observer')

      // 处理observer
      if (observer) {
        result.observer.push({
          ...observer,
          observer_key: v.key.name,
        })
      }
      // 处理value
      if (val) {
        return createNode(key, val.value)
      } else if (type) {
        // 若不存在value，通过type推出默认值
        if (t.isIdentifier(type.value)) {
          return createNode(key, type.value.name)
        }
      }
    }
    /**
     * 简化的定义方式
     * properties: {
     *  myProperty2: String
     * }
     */
    if (t.isIdentifier(value)) {
      return createNode(key, value.name)
    }
    return createNode(key, null)
  })
  return result
}

function ast() {
  return {
    visitor: {
      Identifier(path) {
        if (path.node.name === 'wx') {
          path.node.name = 'my'
        }
      },
      ImportDefaultSpecifier(path) {
        /**
         * 支付宝小程序中不允许使用fetch关键词
         * import fetch from 'xxx' -> import aliFetch from 'xxx'
         */
        if (t.isIdentifier(path.node.local) && path.node.local.name === 'fetch') {
          path.node.local.name = 'aliFetch'
        }
      },
      MemberExpression(path) {
        /**
         * 支付宝小程序中不允许使用fetch关键词
         * fetch.get -> aliFetch.get
         * fetch.post -> aliFetch.post
         * fetch.delete -> aliFetch.delete
         *
         */
        if (
          t.isIdentifier(path.node.object) &&
          path.node.object.name === 'fetch' &&
          t.isIdentifier(path.node.property) &&
          (path.node.property.name === 'get' ||
            path.node.property.name === 'post' ||
            path.node.property.name === 'delete')
        ) {
          path.node.object.name = 'aliFetch'
        }
      },
      CallExpression(path) {
        // $component
        if (
          t.isCallExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.callee) &&
          path.node.callee.callee.name === '$component' &&
          t.isObjectExpression(path.node.arguments[0])
        ) {
          const cont = path.node.arguments[0]

          let propertiesNode
          let propertiesObserverNode = []
          let methodsNode
          let attachedNode
          let detachedNode
          let alipayDidUpdateNode

          // properties
          propertiesNode = cont.properties.find(
            v => t.isObjectProperty(v) && t.isIdentifier(v.key) && v.key.name === 'properties'
          )
          if (propertiesNode) {
            const { properties, observer } = dispatchProperties(propertiesNode.value.properties)
            propertiesNode.key.name = 'props'
            propertiesNode.value.properties = properties
            propertiesObserverNode = observer
          } else {
            // 未定义需创建
            cont.properties.push(t.objectProperty(t.identifier('props'), t.objectExpression([])))
            propertiesNode = cont.properties[cont.properties.length - 1]
          }

          // attached
          attachedNode = cont.properties.find(
            v => t.isObjectMethod(v) && t.isIdentifier(v.key) && v.key.name === 'attached'
          )
          if (attachedNode) {
            attachedNode.key.name = 'didMount'
          } else {
            // 未定义需创建
            cont.properties.push(
              t.objectMethod('method', t.identifier('didMount'), [], t.blockStatement([]))
            )
            attachedNode = cont.properties[cont.properties.length - 1]
          }
          attachedNode.body.body.unshift(
            /**
             * Object.assign(this.data, this.props)
             * this.observeData()
             */
            t.expressionStatement(
              t.callExpression(t.memberExpression(t.identifier('Object'), t.identifier('assign')), [
                t.memberExpression(t.thisExpression(), t.identifier('data')),
                t.memberExpression(t.thisExpression(), t.identifier('props')),
              ])
            ),
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(t.thisExpression(), t.identifier('observeData')),
                []
              )
            )
          )

          // 支付宝-didUpdate
          alipayDidUpdateNode = cont.properties.find(
            v => t.isObjectMethod(v) && t.isIdentifier(v.key) && v.key.name === 'didUpdate'
          )

          if (alipayDidUpdateNode) {
            // 检查是否定义的形参且名为prevProps
            // 若无任何参数
            if (alipayDidUpdateNode.params.length === 0) {
              // 声明名为prevProps的变量
              alipayDidUpdateNode.params.push(t.identifier('prevProps'))
            } else if (alipayDidUpdateNode.params[0].name !== 'prevProps') {
              // 有参数，但是第一个参数的名字不是prevProps，声明一个新的变量prevProps
              alipayDidUpdateNode.body.body.unshift(
                t.variableDeclaration('let', [
                  t.variableDeclarator(
                    t.identifier('prevProps'),
                    t.identifier(alipayDidUpdateNode.params[0].name)
                  ),
                ])
              )
            }
          } else {
            // 未定义需创建
            cont.properties.push(
              t.objectMethod(
                'method',
                t.identifier('didUpdate'),
                [t.identifier('prevProps')],
                t.blockStatement([])
              )
            )
            alipayDidUpdateNode = cont.properties[cont.properties.length - 1]
          }
          alipayDidUpdateNode.body &&
            alipayDidUpdateNode.body.body.splice(
              1,
              0,
              t.expressionStatement(
                t.callExpression(
                  t.memberExpression(t.identifier('Object'), t.identifier('assign')),
                  [
                    t.memberExpression(t.thisExpression(), t.identifier('data')),
                    t.memberExpression(t.thisExpression(), t.identifier('props')),
                  ]
                )
              ),
              ...propertiesObserverNode.map(v =>
                t.ifStatement(
                  t.binaryExpression(
                    '!==',
                    t.memberExpression(
                      t.memberExpression(t.thisExpression(), t.identifier('props')),
                      t.identifier(v.observer_key)
                    ),
                    t.memberExpression(t.identifier('prevProps'), t.identifier(v.observer_key))
                  ),
                  t.blockStatement([
                    t.expressionStatement(
                      t.callExpression(
                        t.memberExpression(t.thisExpression(), t.identifier('observeData')),
                        [
                          t.stringLiteral(v.observer_key),
                          t.memberExpression(
                            t.memberExpression(t.thisExpression(), t.identifier('props')),
                            t.identifier(v.observer_key)
                          ),
                          t.memberExpression(
                            t.identifier('prevProps'),
                            t.identifier(v.observer_key)
                          ),
                        ]
                      )
                    ),
                  ])
                )
              )
            )

          // detached
          detachedNode = cont.properties.find(
            v => t.isObjectMethod(v) && t.isIdentifier(v.key) && v.key.name === 'detached'
          )
          if (detachedNode) {
            detachedNode.key.name = 'didUnmount'
          } else {
            // 未定义需创建
            cont.properties.push(
              t.objectMethod('method', t.identifier('didUnmount'), [], t.blockStatement([]))
            )
            detachedNode = cont.properties[cont.properties.length - 1]
          }

          // methods
          methodsNode = cont.properties.find(
            v => t.isObjectProperty(v) && t.isIdentifier(v.key) && v.key.name === 'methods'
          )
          if (!methodsNode) {
            // 如果组件中未定义methods需创建
            cont.properties.push(t.objectProperty(t.identifier('methods'), t.objectExpression([])))
            methodsNode = cont.properties[cont.properties.length - 1]
          }
          // observeData
          // 查找methods下是否存在方法名为observeData的方法
          if (methodsNode.value.properties.findIndex(v => v.key.name === 'observeData') === -1) {
            methodsNode.value.properties.unshift(
              /**
               * 创建
               * observeData(type, newVal, oldVal) {
               *  ...
               * }
               */
              t.objectMethod(
                'method',
                t.identifier('observeData'),
                [t.identifier('type'), t.identifier('newVal'), t.identifier('oldVal')],
                t.blockStatement(
                  /**
                   * 创建
                   * if (!type || type === "xxx") {
                   *  let newVal = newVal !== undefined ? newVal : this.data.xxx,
                   *  let oldVal = oldVal !== undefined ? oldVal : this.data.xxx
                   * }
                   */
                  propertiesObserverNode.map(v => {
                    const body = v.body.body
                    const params = v.params // [newVal, oldVal?]
                    const key = v.observer_key

                    return t.ifStatement(
                      t.logicalExpression(
                        '||',
                        t.unaryExpression('!', t.identifier('type')),
                        t.binaryExpression('===', t.identifier('type'), t.stringLiteral(key))
                      ),
                      t.blockStatement([
                        t.variableDeclaration(
                          'let',
                          ['newVal', 'oldVal'].map((v, i) => {
                            return t.variableDeclarator(
                              t.identifier((params[i] && params[i].name) || v),
                              t.conditionalExpression(
                                t.binaryExpression(
                                  '!==',
                                  t.identifier(v),
                                  t.identifier('undefined')
                                ),
                                t.identifier(v),
                                t.memberExpression(
                                  t.memberExpression(t.thisExpression(), t.identifier('data')),
                                  t.identifier(key)
                                )
                              )
                            )
                          })
                        ),
                        ...body,
                      ])
                    )
                  })
                )
              )
            )
          } else {
            console.error(`由于组件中存在方法: observeData,将跳过该组件的properties-observer的转换`)
          }

          path.traverse({
            CallExpression(path) {
              // 自定义事件
              if (
                t.isIdentifier(path.node.callee.property) &&
                path.node.callee.property.name === 'triggerEvent' &&
                path.node.arguments[0]
              ) {
                const args = path.node.arguments
                const self = path.node.callee.object
                const key = 'on' + capitalize(args[0]['value'])
                const body = args[1] || t.stringLiteral('')

                /**
                 * 需将各个自定义事件在props中申明
                 * props: {
                 *  ...,
                 *  onXxx(){},
                 * }
                 */
                if (
                  propertiesNode.value.properties.findIndex(
                    v => key === (v && v.key && v.key.name)
                  ) === -1
                ) {
                  propertiesNode.value.properties.push(
                    t.objectMethod('method', t.identifier(key), [], t.blockStatement([]))
                  )
                }
                propertiesNode.value.properties.forEach(v => {
                  if (key === v.key.name && t.isObjectProperty(v)) {
                    console.error(
                      `properties中不能设置key: ${key},这会影响支付宝端自定义事件的派发`
                    )
                  }
                })

                /**
                 * this.triggerEvent(xxx, ...)
                 *     ↓
                 * this.props.onXxx ? this.props.onXxx({
                 *  detail: ...
                 * }) : void 0
                 */
                path.replaceWith(
                  t.ifStatement(
                    t.memberExpression(
                      t.memberExpression(self, t.identifier('props')),
                      t.identifier(key)
                    ),
                    t.blockStatement([
                      t.expressionStatement(
                        t.callExpression(
                          t.memberExpression(
                            t.memberExpression(self, t.identifier('props')),
                            t.identifier(key)
                          ),
                          [t.objectExpression([t.objectProperty(t.identifier('detail'), body)])]
                        )
                      ),
                    ])
                  )
                )
              }
            },
          })

          // 排序
          const _cont = []
          const arr = ['props', 'data', 'didMount', 'didUpdate', 'didUnmount', 'methods']
          arr.forEach(v => {
            const curr = cont.properties.find(v2 => v === v2.key.name)
            if (curr !== -1) _cont.push(curr)
          })
          cont.properties = _cont
        }
      },
    },
  }
}

module.exports = function(code, filename) {
  return transform(code, {
    plugins: [
      ast,
      'babel-plugin-transform-inline-consecutive-adds',
      'babel-plugin-minify-constant-folding',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-optional-chaining',
    ],
    // filename,
  })
    .code.trim()
    .replace(/;$/, '')
}
