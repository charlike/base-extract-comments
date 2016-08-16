/*!
 * acorn-extract-comments <https://github.com/tunnckoCore/acorn-extract-comments>
 *
 * @copyright Copyright (c) 2015-2016, Charlike Mike Reagent.
 * @author Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * @license Released under the MIT license.
 */

'use strict'

var acorn = require('acorn/dist/acorn_loose')
var filter = require('arr-filter')
var extend = require('extend-shallow')
var stripShebang = require('strip-shebang')

/**
 * > Extract all code comments, including block/line and
 * also these that are marked as "ignored" like (`//!` and `/*!`)
 *
 * #### Ok 4
 * Foobar sentence. Again
 *
 * ```js
 * const fs = require('fs')
 * const extract = require('acorn-extract-comments')
 *
 * const str = fs.readFileSync('./index.js', 'utf8')
 * const comments = extract(str, {})
 * // => ['array', 'of', 'all', 'code', 'comments']
 * ```
 *
 * @example
 *
 * ```js
 * const flow = require('foobar')
 *
 * flow.define('hello', 'foo')
 * console.log(flow.hello) // => 'foo'
 * ```
 *
 * @param  {String} input String from which to get comments
 * @param  {Object=} opts Optional options, passed to `acorn`
 * @param  {Boolean} opts.ast if `true` the ast is added to the resulting array
 * @param  {Boolean} opts.line if `false` get only block comments, default `true`
 * @param  {Boolean} opts.block if `false` get line comments, default `true`
 * @param  {Boolean|Function} opts.preserve if `true` will get only comments that are **not** ignored
 * @param  {Boolean} opts.locations if `true` result will include `acorn` location object
 * @param  {Number} opts.ecmaVersion defaults to `acorn` default ecmaVersion + 1, so default is `7`
 * @return {Array} can have `.ast` property if `opts.ast: true`
 * @api public
 */

exports = module.exports = function extractAllComments (input, opts) {
  opts = extend({block: true, line: true}, opts)
  return acornExtractComments(input, opts)
}

/**
 * > Extract only line comments.
 *
 * @example
 *
 * ```js
 * const comments = extract(str, {block: false})
 * // => ['array', 'of', 'line', 'comments']
 * ```
 *
 * @example
 *
 * ```js
 * const comments = extract.line(str)
 * // => ['all', 'line', 'comments']
 * ```
 *
 * @param  {String} input string from which to get comments
 * @param  {Object} opts optional options, passed to `acorn`
 * @return {Array} can have `.ast` property if `opts.ast: true`
 * @api public
 */
exports.line = function extractLineComments (input, opts) {
  opts = extend({line: true}, opts)
  return acornExtractComments(input, opts)
}

/**
 * > Extract only block comments.
 *
 * **Example**
 *
 * ```js
 * const comments = extract(str, {line: false})
 * // => ['array', 'of', 'block', 'comments']
 * ```
 *
 * @example
 *
 * ```js
 * const comments = extract.block(str)
 * // => ['array', 'of', 'block', 'comments']
 * ```
 *
 * @param  {String} input string from which to get comments
 * @param  {Object} opts optional options, passed to `acorn`
 * @return {Array} can have `.ast` property if `opts.ast: true`
 * @api public
 */
exports.block = function extractBlockComments (input, opts) {
  opts = extend({block: true}, opts)
  return acornExtractComments(input, opts)
}

/*!
 * > Core logic to extract comments
 *
 * @param  {String} input string from which to get comments
 * @param  {Object} opts optional options, passed to `acorn`
 * @return {Array} can have `.ast` property if `opts.ast: true`
 * @api private
 */
function acornExtractComments (input, opts) {
  if (typeof input !== 'string') {
    throw new TypeError('acorn-extract-comments expect `input` to be a string')
  }
  if (!input.length) return []

  opts = extend({
    ast: false,
    line: false,
    block: false,
    preserve: false,
    locations: false,
    ecmaVersion: 7
  }, opts)

  /**
   * @author DataBg foo
   * @param {Object} foo okey maafaka
   */

  var comments = opts.onComment = []
  var ast = acorn.parse_dammit(stripShebang(input), opts)

  if (!comments.length) return []

  comments = filter(comments, function (comment) {
    var line = (opts.line && comment.type === 'Line') || false
    var block = (opts.block && comment.type === 'Block') || false
    var ignore = false
    if (typeof opts.preserve === 'boolean') {
      ignore = opts.preserve && defaultIsIgnore(comment.value)
    }
    if (typeof opts.preserve === 'function') {
      var preserve = opts.preserve(comment.value)
      ignore = typeof preserve === 'boolean' ? preserve : ignore
    }

    if (!ignore && line) return true
    if (!ignore && block) return true
    return false
  })

  comments.ast = opts.ast && ast || undefined
  return comments
}

/*! ~~
 * > Default ignore/preserve check function
 *
 * @param  {String} `val`
 * @return {String}
 * @api private
 */
function defaultIsIgnore (val) {
  return val.charCodeAt(0) === 33
}
