import { useEffect, useRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { yCollab } from 'y-codemirror.next';
import * as Y from 'yjs';
import { SocketIOProvider } from 'y-socket.io';
import { getLanguageExtension } from './languages';

interface Props {
  sessionId: string;
  language: string;
  userName: string;
  userColor: string;
}

export default function CollaborativeEditor({ sessionId, language, userName, userColor }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [connected, setConnected] = useState(false);
  const [peers, setPeers] = useState(0);

  useEffect(() => {
    if (!hostRef.current) return;

    const doc = new Y.Doc();
    const provider = new SocketIOProvider(
      import.meta.env.VITE_APP_SERVER_URL,
      `session-${sessionId}`,
      doc,
      { autoConnect: true }
    );

    provider.awareness.setLocalStateField('user', { name: userName, color: userColor });

    const onStatus = () => setConnected(provider.synced);
    provider.on('sync', onStatus);
    (provider as any).on('status', onStatus);

    const onAwareness = () => setPeers(provider.awareness.getStates().size);
    provider.awareness.on('change', onAwareness);

    const ytext = doc.getText('code');

    const view = new EditorView({
      state: EditorState.create({
        doc: ytext.toString(),
        extensions: [
          basicSetup,
          oneDark,
          getLanguageExtension(language),
          yCollab(ytext, provider.awareness),
          EditorView.theme({ '&': { height: '100%' }, '.cm-scroller': { overflow: 'auto' } }),
        ],
      }),
      parent: hostRef.current,
    });

    return () => {
      provider.awareness.off('change', onAwareness);
      provider.off('sync', onStatus);
      (provider as any).off('status', onStatus);
      // clear our own awareness entry immediately instead of waiting on the
      // server's ~30s stale-client timeout, which was leaving ghost peers
      // in the "N people here" count after every navigation/reload
      provider.awareness.setLocalState(null);
      view.destroy();
      provider.destroy();
      doc.destroy();
    };
  }, [sessionId, language, userName, userColor]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-dark-accent/30 px-4 py-2 text-sm text-dark-muted">
        <span>{connected ? 'Connected' : 'Connecting…'}</span>
        <span>
          {peers} {peers === 1 ? 'person' : 'people'} here
        </span>
      </div>
      <div ref={hostRef} className="min-h-0 flex-1" />
    </div>
  );
}
