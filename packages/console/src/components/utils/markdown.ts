import rehypePrettyCode from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

const preprocessor = () => (tree: any) => {
  visit(tree, (node: any) => {
    if (node?.type === 'element' && node?.tagName === 'pre') {
      node.properties.class = 'p-4 rounded-lg'
    }
  })
}

// for more follow:
// https://chris.lu/web_development/tutorials/next-js-static-first-mdx-starterkit/code-highlighting-plugin
export async function processMarkdown(markdownContent: string) {
  const file = await unified()
    .use(remarkParse) // Parse markdown
    .use(remarkGfm) // Support GFM (tables, etc.)
    .use(remarkRehype) // Turn markdown into HTML
    .use(rehypePrettyCode, {
      theme: 'github-light-default',
      keepBackground: false,
    })
    .use(preprocessor)
    .use(rehypeStringify) // Turn HTML into a string
    .process(markdownContent)

  return String(file)
}
