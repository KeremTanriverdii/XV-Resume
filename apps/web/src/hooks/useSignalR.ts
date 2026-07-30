'use client';

import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

export interface ProgressMessage {
  resumeId: string;
  message: string;
  progressPercentage: number;
}

export function useSignalR(resumeId?: string) {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [progress, setProgress] = useState<ProgressMessage | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const hubUrl = apiUrl.replace(/\/api\/?$/, '') + '/hubs/resume';

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (!connection) return;

    connection
      .start()
      .then(() => {
        if (resumeId) {
          connection.invoke('JoinResumeGroup', resumeId).catch(console.error);
        }

        connection.on('ReceiveProgress', (id: string, message: string, progressPercentage: number) => {
          setProgress({ resumeId: id, message, progressPercentage });
        });

        connection.on('ReceiveCompleted', (id: string, message: string) => {
          setIsCompleted(true);
          setProgress({ resumeId: id, message, progressPercentage: 100 });
        });

        connection.on('ReceiveError', (id: string, errMessage: string) => {
          setError(errMessage);
        });
      })
      .catch((err) => console.warn('SignalR Connection Failed:', err));

    return () => {
      if (resumeId && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke('LeaveResumeGroup', resumeId).catch(() => {});
      }
      connection.stop().catch(() => {});
    };
  }, [connection, resumeId]);

  return { progress, isCompleted, error };
}
