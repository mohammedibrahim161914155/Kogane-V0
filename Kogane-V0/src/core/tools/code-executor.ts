import type { ToolDefinition } from '@/types'

interface CodeExecutorResult {
  result: unknown
  logs: string[]
  error?: string
}

export async function executeCode(code: string, timeout = 5000): Promise<CodeExecutorResult> {
  return new Promise((resolve) => {
    const logs: string[] = []

    const iframe = document.createElement('iframe')
    iframe.setAttribute('sandbox', 'allow-scripts')
    iframe.style.display = 'none'
    document.body.appendChild(iframe)

    const cleanup = () => {
      window.removeEventListener('message', handleMessage)
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe)
      }
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return

      const { type, data } = event.data

      if (type === 'log') {
        logs.push(data)
      } else if (type === 'result') {
        cleanup()
        resolve({ result: data.result, logs, error: data.error })
      }
    }

    window.addEventListener('message', handleMessage)

    const timeoutId = setTimeout(() => {
      cleanup()
      resolve({ result: null, logs, error: 'Execution timeout (5s)' })
    }, timeout)

    const scriptContent = `
      (function() {
        const originalConsole = console;
        const logs = [];
        
        console = {
          log: (...args) => {
            parent.postMessage({ type: 'log', data: args.map(a => String(a)).join(' ') }, '*');
          },
          error: (...args) => {
            parent.postMessage({ type: 'log', data: '[ERROR] ' + args.map(a => String(a)).join(' ') }, '*');
          },
          warn: (...args) => {
            parent.postMessage({ type: 'log', data: '[WARN] ' + args.map(a => String(a)).join(' ') }, '*');
          }
        };

        try {
          const result = eval(${JSON.stringify(code)});
          parent.postMessage({ type: 'result', data: { result: String(result) } }, '*');
        } catch (e) {
          parent.postMessage({ type: 'result', data: { result: null, error: e.message } }, '*');
        }
      })();
    `

    iframe.srcdoc = `<script>${scriptContent}<\/script>`

    clearTimeout(timeoutId)
  })
}

export const codeExecutorTool: ToolDefinition = {
  name: 'code_executor',
  description: 'Execute JavaScript code in a sandboxed environment. Returns the result or error.',
  parameters: {
    code: { type: 'string', description: 'JavaScript code to execute' },
  },
  execute: async (args) => {
    const code = args.code as string
    return executeCode(code)
  },
}