'use client';

import { useEffect, useRef, useState } from 'react';
import { getWsClient } from '@/lib/forex/websocket/wsClient';
import type { ServerMessage } from '@/types/forex/websocket';
import { usePriceStore } from '@/store/forex/priceStore';
import { useSignalStore } from '@/store/forex/signalStore';
import { useNewsStore } from '@/store/newsStore';
import { useAgentStore } from '@/store/agentStore';

export type WsStatus = 'connecting' | 'connected' | 'disconnected';

export function useForexWebSocket(pairs: string[]) {
  const [status, setStatus] = useState<WsStatus>('connecting');
  const cleanupRef = useRef<(() => void) | null>(null);
  const setPrice = usePriceStore((s) => s.setPrice);
  const addSignal = useSignalStore((s) => s.addSignal);
  const updateSignal = useSignalStore((s) => s.updateSignal);
  const addNewsEvent = useNewsStore((s) => s.addEvent);
  const addReasoning = useAgentStore((s) => s.addReasoning);
  const setAgentStatus = useAgentStore((s) => s.setAgentStatus);
  const addVerifiedSignal = useAgentStore((s) => s.addVerifiedSignal);

  useEffect(() => {
    const client = getWsClient();

    const removeHandler = client.addHandler((msg: ServerMessage) => {
      switch (msg.type) {
        case 'CONNECTED':
          setStatus('connected');
          break;
        case 'PRICE_UPDATE':
          setPrice(msg.data);
          break;
        case 'SIGNAL_NEW':
          addSignal(msg.data);
          break;
        case 'SIGNAL_UPDATE':
          updateSignal(msg.data.id, msg.data);
          break;
        case 'NEWS_EVENT':
          addNewsEvent(msg.data);
          break;
        case 'AGENT_REASONING':
          addReasoning(msg.data);
          break;
        case 'AGENT_STATUS':
          setAgentStatus(msg.agentName, msg.status);
          break;
        case 'VERIFIED_SIGNAL':
          addVerifiedSignal(msg.data);
          break;
        default:
          break;
      }
    });

    client.connect();
    client.subscribe(pairs);
    setStatus('connecting');

    // Monitor connection status via polling
    const interval = setInterval(() => {
      setStatus(client.isConnected ? 'connected' : 'disconnected');
    }, 3000);

    cleanupRef.current = () => {
      removeHandler();
      clearInterval(interval);
    };

    return () => cleanupRef.current?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs.join(',')]);

  return status;
}
