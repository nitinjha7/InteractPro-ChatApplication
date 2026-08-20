import type { Extension } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { json } from '@codemirror/lang-json';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';

export const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'json', label: 'JSON' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
] as const;

export function getLanguageExtension(name: string): Extension {
  switch (name) {
    case 'typescript':
      return javascript({ typescript: true });
    case 'python':
      return python();
    case 'json':
      return json();
    case 'css':
      return css();
    case 'html':
      return html();
    default:
      return javascript();
  }
}
