export const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && value === value

export const isString = (value: unknown): value is string => typeof value === 'string'

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'

export const isSymbol = (value: unknown): value is symbol => typeof value === 'symbol'

export const isFunction = <T extends Function = Function>(value: unknown): value is T =>
  typeof value === 'function'

export const isNull = (value: unknown): value is null => value === null

export const isUndefined = (value: unknown): value is undefined => value === undefined

const _isArray = Array.isArray
export const isArray = <T extends unknown[] = unknown[]>(value: unknown): value is T =>
  _isArray(value)

const _toString = Object.prototype.toString

type IAnyObject = Record<string, unknown>
export const isPlainObject = <T extends IAnyObject = IAnyObject>(value: unknown): value is T =>
  _toString.call(value) === '[object Object]'

export const getType = (value: unknown) => _toString.call(value)
