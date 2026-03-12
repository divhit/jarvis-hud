'use client';

import React from 'react';
import { useJarvisStore } from '@/stores/jarvisStore';

export default function InboxPanel() {
  const inbox = useJarvisStore((s) => s.inbox);
  const inboxLoading = useJarvisStore((s) => s.inboxLoading);
  const inboxLastSync = useJarvisStore((s) => s.inboxLastSync);
  const fetchInbox = useJarvisStore((s) => s.fetchInbox);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ fontSize: '8px', letterSpacing: '3px', color: '#0088FF', opacity: 0.7 }}>
          COMMUNICATIONS // INBOX
        </div>
        <button
          onClick={fetchInbox}
          disabled={inboxLoading}
          style={{
            background: 'none',
            border: '1px solid rgba(0,255,255,0.2)',
            color: inboxLoading ? '#004466' : '#00AAAA',
            fontSize: '6px',
            letterSpacing: '1px',
            padding: '2px 6px',
            borderRadius: '2px',
            cursor: inboxLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {inboxLoading ? 'SYNCING...' : 'REFRESH'}
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '8px',
        fontSize: '9px',
      }}>
        <div style={{
          padding: '3px 8px',
          border: '1px solid rgba(0,255,255,0.2)',
          borderRadius: '2px',
        }}>
          <span style={{ color: '#006688' }}>UNREAD </span>
          <span style={{ color: '#00FFFF', fontWeight: 700 }}>{inbox.unread}</span>
        </div>
        <div style={{
          padding: '3px 8px',
          border: '1px solid rgba(255,68,68,0.3)',
          borderRadius: '2px',
        }}>
          <span style={{ color: '#884444' }}>URGENT </span>
          <span style={{ color: '#FF4444', fontWeight: 700 }}>{inbox.urgent}</span>
        </div>
      </div>

      {inboxLoading ? (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{
            fontSize: '8px',
            color: '#00AAAA',
            letterSpacing: '2px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            QUERYING HERMES...
          </div>
          <div style={{ fontSize: '6px', color: '#004466' }}>
            THIS MAY TAKE 30-120 SECONDS
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {inbox.emails.map((email, i) => (
            <div
              key={i}
              style={{
                padding: '6px 8px',
                border: `1px solid ${i === 0 ? 'rgba(255,68,68,0.2)' : 'rgba(0,255,255,0.08)'}`,
                borderRadius: '2px',
                borderLeft: `2px solid ${i === 0 ? '#FF4444' : '#00FFFF44'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{
                  fontSize: '8px',
                  fontWeight: 700,
                  color: i === 0 ? '#FF8888' : '#00AAAA',
                }}>
                  {email.from}
                </span>
                <span style={{ fontSize: '6px', color: '#004466' }}>{email.time}</span>
              </div>
              <div style={{
                fontSize: '7px',
                color: '#888888',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {email.subject}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: '6px', color: '#004466', marginTop: '4px', textAlign: 'right' }}>
        LAST SYNC: {inboxLastSync}
      </div>
    </div>
  );
}
