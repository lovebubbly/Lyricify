/**
 * Apple Music Style Animation Physics
 * 
 * Spring physics and easing functions for smooth, bouncy animations
 * Inspired by damped harmonic oscillators and After Effects curves
 */

// ============================================
// Spring Physics Configuration
// ============================================

export interface SpringConfig {
    mass: number;      // 질량 - 높을수록 무겁고 느림
    stiffness: number; // 강성 - 높을수록 빠르고 탄력적
    damping: number;   // 감쇠 - 낮을수록 더 많이 튕김
}

// Apple Music 스타일 프리셋
export const SPRING_PRESETS = {
    // 기본 부드러운 스프링 (가사 전환)
    default: { mass: 1, stiffness: 170, damping: 26 },

    // 느긋한 스프링 (배경 움직임)
    gentle: { mass: 1.2, stiffness: 120, damping: 20 },

    // 탄력있는 스프링 (버튼 호버)
    bouncy: { mass: 0.8, stiffness: 200, damping: 15 },

    // 스냅 효과 (빠른 전환)
    snappy: { mass: 0.6, stiffness: 300, damping: 30 },

    // 젤리 효과 (띠용띠용)
    jelly: { mass: 1, stiffness: 150, damping: 12 },

    // 매우 부드러운 (스크롤)
    smooth: { mass: 1.5, stiffness: 100, damping: 25 },
} as const;

// ============================================
// CSS Cubic Bezier Easing Curves
// ============================================

// After Effects 스타일 이징 커브
export const EASING = {
    // Apple 기본 이징 (ease-out 변형)
    appleEase: 'cubic-bezier(0.25, 0.1, 0.25, 1)',

    // 스프링 시뮬레이션 (overshoot)
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',

    // 탄력있는 바운스
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',

    // 부드러운 진입
    easeOutQuint: 'cubic-bezier(0.22, 1, 0.36, 1)',

    // 부드러운 퇴장
    easeInQuint: 'cubic-bezier(0.64, 0, 0.78, 0)',

    // 양방향 부드러움
    easeInOutQuint: 'cubic-bezier(0.83, 0, 0.17, 1)',

    // 탄성 효과 (띠용)
    elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

    // 백스윙 효과
    backOut: 'cubic-bezier(0.34, 1.4, 0.64, 1)',

    // 슬로우 시작, 빠른 끝
    anticipate: 'cubic-bezier(0.36, 0, 0.66, -0.56)',
} as const;

// ============================================
// Animation Duration Presets (ms)
// ============================================

export const DURATION = {
    instant: 100,
    fast: 200,
    normal: 350,
    slow: 500,
    verySlow: 800,
    glacial: 1200,
} as const;

// ============================================
// Composite Animation Strings for CSS
// ============================================

export const TRANSITIONS = {
    // 가사 줄 전환 (Apple Music 스타일)
    lyricLine: `
    all 450ms ${EASING.spring},
    opacity 350ms ${EASING.easeOutQuint},
    filter 400ms ${EASING.easeOutQuint}
  `.replace(/\s+/g, ' ').trim(),

    // 폰트 크기/무게 변화
    typography: `
    font-size 400ms ${EASING.bounce},
    font-weight 300ms ${EASING.appleEase}
  `.replace(/\s+/g, ' ').trim(),

    // 스케일 효과
    scale: `transform 400ms ${EASING.spring}`,

    // 배경 펄스
    backgroundPulse: `
    opacity 2000ms ${EASING.easeInOutQuint},
    transform 3000ms ${EASING.easeInOutQuint}
  `.replace(/\s+/g, ' ').trim(),

    // 앨범 커버 호버
    albumHover: `transform 300ms ${EASING.bounce}`,

    // 블러 전환
    blur: `filter 500ms ${EASING.easeOutQuint}`,

    // 서브타이틀 등장
    subtitle: `
    opacity 300ms ${EASING.easeOutQuint},
    transform 400ms ${EASING.elastic}
  `.replace(/\s+/g, ' ').trim(),
} as const;

// ============================================
// Keyframe Animation Generators
// ============================================

/**
 * 활성 가사 줄에 미세한 "펀치" 효과 생성
 * Beat-reactive scaling
 */
export function generatePunchKeyframes(): string {
    return `
    @keyframes lyricPunch {
      0% { transform: scale(1); }
      15% { transform: scale(1.08); }
      30% { transform: scale(0.98); }
      50% { transform: scale(1.02); }
      70% { transform: scale(0.995); }
      100% { transform: scale(1); }
    }
  `;
}

/**
 * 부드러운 플로팅 애니메이션 (배경 요소용)
 */
export function generateFloatKeyframes(): string {
    return `
    @keyframes gentleFloat {
      0%, 100% { 
        transform: translateY(0) scale(1); 
        opacity: 0.7;
      }
      25% { 
        transform: translateY(-10px) scale(1.02); 
        opacity: 0.8;
      }
      50% { 
        transform: translateY(-5px) scale(1.05); 
        opacity: 0.85;
      }
      75% { 
        transform: translateY(-15px) scale(1.02); 
        opacity: 0.75;
      }
    }
  `;
}

/**
 * 앨범 커버 미세 회전/호흡 (레코드판 느낌)
 */
export function generateBreathingKeyframes(): string {
    return `
    @keyframes albumBreathing {
      0%, 100% { 
        transform: scale(1) rotate(0deg);
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      }
      50% { 
        transform: scale(1.02) rotate(0.5deg);
        box-shadow: 0 25px 80px rgba(0,0,0,0.6);
      }
    }
  `;
}

/**
 * 메쉬 그라디언트 느린 움직임
 */
export function generateMeshKeyframes(): string {
    return `
    @keyframes meshMove {
      0% { 
        transform: scale(1.2) rotate(0deg); 
        filter: hue-rotate(0deg);
      }
      33% { 
        transform: scale(1.25) rotate(2deg); 
        filter: hue-rotate(10deg);
      }
      66% { 
        transform: scale(1.22) rotate(-1deg); 
        filter: hue-rotate(-5deg);
      }
      100% { 
        transform: scale(1.2) rotate(0deg); 
        filter: hue-rotate(0deg);
      }
    }
  `;
}

/**
 * 펄스 글로우 효과 (활성 줄 하이라이트)
 */
export function generateGlowPulseKeyframes(): string {
    return `
    @keyframes glowPulse {
      0%, 100% { 
        text-shadow: 0 2px 20px rgba(255,255,255,0.3);
      }
      50% { 
        text-shadow: 0 4px 40px rgba(255,255,255,0.5), 
                     0 0 60px rgba(255,255,255,0.2);
      }
    }
  `;
}

// ============================================
// Style Object Generators
// ============================================

/**
 * 활성/비활성 가사 줄 스타일 생성
 */
export function getLyricLineStyle(
    isActive: boolean,
    relativeIndex: number,
    fontSize: number
): React.CSSProperties {
    const distance = Math.abs(relativeIndex);

    if (isActive) {
        return {
            opacity: 1,
            transform: 'scale(1) translateX(0)',
            filter: 'blur(0px)',
            transition: TRANSITIONS.lyricLine,
            fontSize: fontSize,
            fontWeight: 700,
            animation: 'glowPulse 3s ease-in-out infinite',
        };
    }

    // 거리에 따른 점진적 페이드
    const opacity = Math.max(0.15, 0.5 - distance * 0.12);
    const blur = Math.min(distance * 1.2, 4);
    const scale = Math.max(0.85, 1 - distance * 0.03);
    const translateX = -8 * distance;

    return {
        opacity,
        transform: `scale(${scale}) translateX(${translateX}px)`,
        filter: `blur(${blur}px)`,
        transition: TRANSITIONS.lyricLine,
        fontSize: fontSize * 0.75,
        fontWeight: 500,
        transformOrigin: 'left center',
    };
}

/**
 * 앨범 커버 스타일 (호버 효과 포함)
 */
export function getAlbumCoverStyle(isHovered: boolean): React.CSSProperties {
    return {
        width: '280px',
        height: '280px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: isHovered
            ? '0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(255,255,255,0.1)'
            : '0 20px 60px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)',
        transform: isHovered ? 'scale(1.03)' : 'scale(1)',
        transition: TRANSITIONS.albumHover,
        animation: 'albumBreathing 6s ease-in-out infinite',
    };
}

/**
 * 다이나믹 배경 스타일
 */
export function getDynamicBackgroundStyle(blurIntensity: number): React.CSSProperties {
    return {
        position: 'absolute' as const,
        inset: '-10%',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: `blur(${blurIntensity}px) saturate(1.3)`,
        animation: 'meshMove 20s ease-in-out infinite',
        opacity: 0.85,
    };
}

// ============================================
// All Keyframes as Injectable CSS
// ============================================

export const ALL_KEYFRAMES = `
  ${generatePunchKeyframes()}
  ${generateFloatKeyframes()}
  ${generateBreathingKeyframes()}
  ${generateMeshKeyframes()}
  ${generateGlowPulseKeyframes()}
`;
