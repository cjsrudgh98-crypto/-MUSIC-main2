import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { usePlayer } from '../context/PlayerContext';

export default function HlsAudioPlayer() {
  const { currentTrack, isPlaying, togglePlay } = usePlayer();
  const audioRef = useRef(null);

  // 1. HLS 스트림 바인딩 및 오디오 초기화 + 예외 처리
  useEffect(() => {
    if (!currentTrack || currentTrack.type === 'YOUTUBE' || !currentTrack.streamUrl) return;

    const audio = audioRef.current;
    if (!audio) return;

    let hls = null;

    if (Hls.isSupported() && currentTrack.streamUrl.endsWith('.m3u8')) {
      hls = new Hls({
        maxBufferLength: 30,
        fragLoadingMaxRetry: 3,
        manifestLoadingMaxRetry: 3,
      });

      hls.loadSource(currentTrack.streamUrl);
      hls.attachMedia(audio);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isPlaying) audio.play().catch(() => {});
      });

      // 🛠️ HLS 에러 발생 시 예외 처리 및 복구 로직 추가
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.warn('HLS 에러 감지:', data);

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('네트워크 에러 발생. 복구를 시도합니다...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('미디어 파싱 에러 발생. 복구를 시도합니다...');
              hls.recoverMediaError();
              break;
            default:
              console.error('복구 불가능한 에러 발생. 플레이어를 재시작합니다.');
              hls.destroy();
              break;
          }
        }
      });
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari Native HLS 지원
      audio.src = currentTrack.streamUrl;
      if (isPlaying) audio.play().catch(() => {});
    } else {
      // 일반 오디오 URL
      audio.src = currentTrack.streamUrl;
      if (isPlaying) audio.play().catch(() => {});
    }

    // 네이티브 오디오 태그 자체의 에러 핸들링
    const handleAudioError = (e) => {
      console.error('오디오 재생 중 에러 발생:', e);
    };
    audio.addEventListener('error', handleAudioError);

    return () => {
      audio.removeEventListener('error', handleAudioError);
      if (hls) {
        hls.destroy();
      }
    };
  }, [currentTrack]);

  // 2. 재생 / 일시정지 상태 동기화
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || currentTrack.type === 'YOUTUBE') return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // 3. Notification / 백그라운드 미디어 컨트롤 (MediaSession API)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title || '재생 중인 곡',
      artist: currentTrack.artist || '알 수 없는 아티스트',
      artwork: [
        {
          src: currentTrack.thumbnailUrl || '/default-album.png',
          sizes: '512x512',
          type: 'image/jpeg',
        },
      ],
    });

    navigator.mediaSession.setActionHandler('play', () => togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => togglePlay());
  }, [currentTrack, togglePlay]);

  return <audio ref={audioRef} style={{ display: 'none' }} />;
}