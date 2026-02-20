import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

function CodeBlock({ children, className, ...props }: React.HTMLAttributes<HTMLPreElement> & { 'data-language'?: string }) {
  const [copied, setCopied] = React.useState(false)
  const code = typeof children === 'string' ? children : ''

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group">
      <pre className={cn('relative p-4 overflow-x-auto rounded-lg', className)} {...props}>
        <code>{children}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={copyToClipboard}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )
}

function InlineCode({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <code className={cn('px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-mono text-sm', className)} {...props}>
      {children}
    </code>
  )
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          code: InlineCode,
          pre: CodeBlock,
          a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="border-collapse border border-border">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border px-4 py-2 bg-secondary text-left font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-2">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}