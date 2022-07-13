import { NodeTypes } from './ast'

const enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context = createParserContext(content)

  return createRoot(parseChildren(context))
}

function parseChildren(context) {
  const nodes: any[] = []

  let node
  const s = context.source

  if (s.startsWith('{{')) { // 说明处理的是插值表达式
    node = parseInterpolation(context)  
  } else if (s[0] === '<') { // 说明解析到了 标签
    if (/[a-z]/i.test(s[1])) {
      node = parseElement(context)
    }
  }

  nodes.push(node)

  return nodes
}

function parseElement(context: any) {
  // 实现
  // 1 解析 tag
  const element = parseTag(context, TagType.Start)

  parseTag(context, TagType.End)

  return element
}

function parseTag(context: any, tagType: TagType) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source)
  const tag = match[1]
  // 2 删除处理完成的代码
  advanceBy(context, match[0].length)
  advanceBy(context, 1)

  if (tagType === TagType.End) { // 如果是结束标签，直接返回，不需要返回元素信息
    return
  }

  return {
    type: NodeTypes.ELEMENT,
    tag
  }
}

function parseInterpolation (context) {
  // {{message}}
  const openDelimiter = '{{'
  const closeDelimiter = '}}'

  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  ) // 第二个参数 是 indexOf 开始查找的位置索引

  advanceBy(context, openDelimiter.length)

  const rawContentLength = closeIndex - openDelimiter.length

  const rawContent = context.source.slice(0, rawContentLength)
  const content = rawContent.trim()

  advanceBy(context, rawContentLength + closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content
    }
  }
}

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length)
}

function createRoot(children) {
  return {
    children
  }
}

function createParserContext(content: string): any {
  return {
    source: content
  }
}


