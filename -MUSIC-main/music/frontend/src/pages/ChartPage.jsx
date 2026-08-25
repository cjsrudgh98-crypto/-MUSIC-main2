import React from 'react';
import { usePlayer } from '../context/PlayerContext';

const DUMMY_TOP_100 = [
  {
    id: 1,
    rank: 1,
    title: "Magnetic",
    artist: "ILLIT (아일릿)",
    album: "SUPER REAL ME",
    thumbnailUrl: "https://img.youtube.com/vi/7q_Y9Sv0Z40/hqdefault.jpg",
    youtubeVideoId: "7q_Y9Sv0Z40",
    change: "UP",
    diff: 2
  },
  {
    id: 2,
    rank: 2,
    title: "It's Me",
    artist: "ILLIT (아일릿)",
    album: "SUPER REAL ME",
    thumbnailUrl: "https://img.youtube.com/vi/V_2sggu9swg/hqdefault.jpg",
    youtubeVideoId: "V_2sggu9swg",
    change: "SAME",
    diff: 0
  },
  {
    id: 3,
    rank: 3,
    title: "Supernova",
    artist: "aespa",
    album: "Armageddon",
    thumbnailUrl: "https://img.youtube.com/vi/pUNnHzt0kc4/hqdefault.jpg",
    youtubeVideoId: "pUNnHzt0kc4",
    change: "DOWN",
    diff: 1
  },
];

export default function ChartPage() {
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  return (
    <div style={{ padding: '30px', color: '#fff', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>실시간 TOP 100 차트</h2>
        <p style={{ color: '#a0a0a0', fontSize: '14px' }}>가장 사랑받는 트렌디한 음악을 실시간으로 확인해보세요.</p>
      </div>

      <div style={{
        background: 'rgba(20, 10, 30, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 0, 128, 0.2)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        {/* 헤더 그리드 비율 조정 (곡 정보 칸을 넓힘) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '70px 3fr 2fr 80px',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#a0a0a0',
          fontSize: '13px',
          fontWeight: '600',
          alignItems: 'center'
        }}>
          <span>순위</span>
          <span>곡 정보</span>
          <span>앨범</span>
          <span style={{ textAlign: 'center' }}>재생</span>
        </div>

        {DUMMY_TOP_100.map((track) => {
          const isCurrent = currentTrack?.id === track.id;

          return (
            <div
              key={track.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '70px 3fr 2fr 80px',
                alignItems: 'center',
                padding: '12px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                background: isCurrent ? 'rgba(255, 0, 128, 0.15)' : 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => playTrack(track)}
            >
              {/* 순위 및 변동 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: track.rank <= 3 ? '#ff0080' : '#fff', width: '22px', textAlign: 'center' }}>
                  {track.rank}
                </span>
                <span style={{ fontSize: '11px', color: track.change === 'UP' ? '#ff4d4d' : track.change === 'DOWN' ? '#4da6ff' : '#888' }}>
                  {track.change === 'UP' ? `▲${track.diff}` : track.change === 'DOWN' ? `▼${track.diff}` : '-'}
                </span>
              </div>

              {/* 곡 정보 (썸네일 + 제목 + 아티스트) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <img
                  src={track.thumbnailUrl}
                  alt={track.title}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    flexShrink: 0,
                    background: '#222'
                  }}
                />
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: isCurrent ? '#ff0080' : '#fff', marginBottom: '4px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {track.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#a0a0a0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {track.artist}
                  </div>
                </div>
              </div>

              {/* 앨범명 */}
              <div style={{ fontSize: '13px', color: '#cccccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {track.album}
              </div>

              {/* 재생 버튼 */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); playTrack(track); }}
                  style={{
                    background: isCurrent && isPlaying ? '#ff0080' : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  {isCurrent && isPlaying ? '❚❚' : '▶'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}