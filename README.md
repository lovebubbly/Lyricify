# 🎵 Lyricify

**Lyricify**는 SRT 자막 파일을 기반으로 아름다운 가사 비디오를 생성하는 웹 애플리케이션입니다. 앨범 아트에서 색상을 추출하여 자동으로 어울리는 배경을 생성하고, 실시간 미리보기와 함께 영상을 렌더링할 수 있습니다.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![Remotion](https://img.shields.io/badge/Remotion-4.0-purple?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript)

## ✨ 주요 기능

- **🎨 자동 색상 팔레트 추출** - 앨범 아트에서 색상을 추출하여 조화로운 배경 그라데이션을 자동 생성
- **📝 듀얼 자막 지원** - 메인 가사와 보조 가사(번역/발음)를 동시에 표시
- **🎬 실시간 프리뷰** - 오디오와 함께 가사 싱크를 바로 확인
- **⚙️ 커스터마이징** - 폰트 크기, 블러 강도, 해상도, FPS 등 세부 설정 가능
- **🌈 Spring Physics 애니메이션** - 자연스럽고 부드러운 가사 전환 효과

## 🛠️ 기술 스택

| 분류 | 기술 |
|------|------|
| **프레임워크** | Next.js 16 (App Router) |
| **UI 라이브러리** | React 19 |
| **영상 렌더링** | Remotion 4.0 |
| **애니메이션** | Framer Motion 12 |
| **아이콘** | Lucide React |
| **색상 추출** | ColorThief |
| **언어** | TypeScript 5 |

## 📁 프로젝트 구조

```
src/
├── app/              # Next.js App Router
├── components/       # React 컴포넌트
│   ├── FileUpload    # 파일 업로드 컴포넌트
│   ├── Sidebar       # 설정 사이드바
│   ├── Slider        # 슬라이더 컨트롤
│   ├── VideoPreview  # 비디오 미리보기
│   └── LoadingOverlay # 로딩 오버레이
├── lib/              # 유틸리티 함수
│   ├── srtParser     # SRT 파일 파서
│   ├── colorExtractor # 색상 추출기
│   └── audioUtils    # 오디오 유틸리티
├── remotion/         # Remotion 비디오 컴포넌트
└── types/            # TypeScript 타입 정의
```

## 🚀 시작하기

### 필수 조건

- Node.js 18 이상
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/yunseongcho/Lyricify.git
cd Lyricify

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 앱을 확인할 수 있습니다.

### 사용법

1. **오디오 파일** (.mp3, .wav 등) 업로드
2. **앨범 아트** (.jpg, .png 등) 업로드
3. **메인 자막** (.srt) 파일 업로드
4. (선택) **보조 자막** (.srt) 업로드
5. 설정 조정 후 **렌더링** 버튼 클릭

### Scripts

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start

# Remotion 미리보기
npm run remotion:preview

# 비디오 렌더링
npm run remotion:render
```

## 📄 SRT 파일 형식

표준 SRT 형식을 지원합니다:

```srt
1
00:00:05,000 --> 00:00:08,000
첫 번째 가사 라인

2
00:00:08,500 --> 00:00:12,000
두 번째 가사 라인
```

## 📜 라이선스

MIT License - 자유롭게 사용하세요.

---

Made with ❤️ by Yunseong Cho
