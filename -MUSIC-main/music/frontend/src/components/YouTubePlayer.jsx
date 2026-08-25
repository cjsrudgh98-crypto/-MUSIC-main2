import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function YouTubePlayer() {
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  const {
    currentTrack,
    isPlaying, // 추가: 재생 상태 동기화를 위해 가져오기
    togglePlay, // 추가: Media Session 핸들러용
    registerPlayer,
    handlePlayerStateChange
  } = usePlayer();

  const stateHandlerRef = useRef(handlePlayerStateChange);
  useEffect(() => {
    stateHandlerRef.current = handlePlayerStateChange;
  }, [handlePlayerStateChange]);

  // 1. YouTube IFrame API 스크립트 로드 및 Player 객체 생성 (1회 초기화)
  useEffect(() => {
    let isCancelled = false;

    const createPlayer = () => {
      if (isCancelled || playerRef.current || !containerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '100%',
        width: '100%',
        videoId: currentTrack?.youtubeVideoId || '',
        playerVars: {
          autoplay: 1,
          playsinline: 1,
          controls: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            registerPlayer(event.target);
            if (currentTrack?.youtubeVideoId) {
              event.target.playVideo();
            }
          },
          onStateChange: (event) => {
            if (stateHandlerRef.current) {
              stateHandlerRef.current(event);
            }
          },
          // 🛠️ 1. 유튜브 에러 코드별 세부 예외 처리 강화
          onError: (e) => {
            const errorCode = e.data;
            console.warn(`YouTube Player 에러 발생 (코드: ${errorCode})`);

            switch (errorCode) {
              case 2:
                console.error('요청된 매개변수 값이 잘못되었습니다.');
                break;
              case 5:
                console.error('HTML5 플레이어 관련 에러가 발생했습니다.');
                break;
              case 100:
                console.error('영상이 삭제되었거나 비공개 상태입니다.');
                // 필요시 에러 토스트나 다음 곡으로 넘어가는 함수 호출 가능
                break;
              case 101:
              case 150:
                console.error('해당 영상은 외부 재생이 허용되지 않습니다.');
                break;
              default:
                console.error('알 수 없는 유튜브 재생 오류가 발생했습니다.');
                break;
            }
          }
        },
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }

      const prevOnReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevOnReady === 'function') prevOnReady();
        createPlayer();
      };
    }

    return () => {
      isCancelled = true;
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
      playerRef.current = null;
      registerPlayer(null);
    };
  }, [registerPlayer]);

  // 2. 트랙이 바뀌었을 때 영상 로드 및 재생
  useEffect(() => {
    const player = playerRef.current;
    if (player && currentTrack?.youtubeVideoId && typeof player.loadVideoById === 'function') {
      player.loadVideoById(currentTrack.youtubeVideoId);
      player.playVideo();
    }
  }, [currentTrack?.youtubeVideoId]);

  // 🛠️ 3. 유튜브 재생 중 백그라운드 미디어 컨트롤 (MediaSession API) 연동
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack || currentTrack.type !== 'YOUTUBE') return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title || '유튜브 재생 중',
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

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '200px',
        height: '120px',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      <div ref={containerRef} />
    </div>
  );
}