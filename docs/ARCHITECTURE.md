# PicSlim - 아키텍처 문서

## 1. 시스템 아키텍처 개요

PicSlim은 **Tauri v2** 프레임워크를 기반으로 한 데스크톱 애플리케이션으로, 프론트엔드(React)와 백엔드(Rust)가 IPC로 통신하는 구조입니다.

```
┌───────────────────────────────────────────────────┐
│                    PicSlim App                     │
│                                                   │
│  ┌─────────────────────┐  ┌────────────────────┐  │
│  │   Frontend (WebView) │  │  Backend (Rust)    │  │
│  │                     │  │                    │  │
│  │  React 19           │◄─►  Tauri v2 Core    │  │
│  │  TypeScript         │IPC│                    │  │
│  │  Tailwind CSS v4    │  │  이미지 압축 엔진    │  │
│  │  Vite 7             │  │  파일 시스템 접근    │  │
│  │  DM Sans (self-host)│  │  OS 통합           │  │
│  └─────────────────────┘  └────────────────────┘  │
│                                                   │
│               Windows (WebView2)                  │
└───────────────────────────────────────────────────┘
```

## 2. 프론트엔드 아키텍처

### 2.1 레이어 구조

```
src/
├── main.tsx              ← 진입점 (ReactDOM.createRoot)
├── App.tsx               ← 루트 컴포넌트 (상태 조합 + 레이아웃)
├── types/index.ts        ← 타입 정의 계층
├── lib/tauri.ts          ← Tauri IPC 추상화 계층
├── hooks/                ← 비즈니스 로직 계층
│   ├── useSettings.ts
│   ├── useImageList.ts
│   ├── useCompression.ts
│   └── useDragDrop.ts
├── components/           ← UI 표현 계층
│   ├── Header.tsx
│   ├── DropZone.tsx
│   ├── ImageList.tsx     ← 요약 헤더 + 완료 카드 포함
│   ├── ImageItem.tsx     ← 포맷 배지 + 상태 인디케이터
│   ├── ProgressBar.tsx
│   ├── ActionBar.tsx
│   ├── Settings.tsx      ← 엔진 정보 + 버전 표시
│   └── PreviewModal.tsx  ← Before/After 비교 슬라이더
└── styles/globals.css    ← 테마 + 폰트 + 애니메이션 + 호버 스타일
```

### 2.2 스타일링 아키텍처

**하이브리드 방식**: 인라인 `style={}` + Tailwind CSS + CSS 클래스

```
globals.css
├── @font-face              ← DM Sans 셀프 호스팅 (4 weights)
├── @theme                  ← CSS 변수 (색상 팔레트)
├── 클래스 기반 호버 스타일    ← .image-row, .action-btn-primary, .remove-btn 등
├── @keyframes 애니메이션     ← fade-in, slide-in-right, shimmer, spin
├── .animate-* 유틸리티      ← 애니메이션 적용 클래스
└── @media (prefers-reduced-motion) ← 접근성
```

**스타일 적용 우선순위:**
1. 색상, 패딩, 폰트 크기 등 → 인라인 `style={}`
2. Flexbox 레이아웃 → Tailwind 클래스 (`flex`, `items-center`)
3. 호버/인터랙션 → `globals.css` 클래스 (`.action-btn-primary:hover`)
4. 애니메이션 → `globals.css` keyframe + `.animate-*` 클래스

### 2.3 상태 관리 패턴

별도의 상태 관리 라이브러리 없이 **커스텀 훅 패턴**으로 관리합니다.

```
App.tsx (상태 조합 허브)
  ├── useSettings()      → { settings, updateQuality, updateOutputDir }
  ├── useImageList()     → { images, addImages, removeImage, ... }
  ├── useCompression()   → { isCompressing, progress, startCompression }
  └── useDragDrop()      → (이벤트 핸들러 연결만, 상태 없음)
```

**AppState 상태 머신:**

```
empty ──[이미지 추가]──► ready ──[압축 시작]──► compressing ──[완료]──► done
  ▲                      │                                              │
  └──────[전체 초기화]────┘◄─────────────[전체 초기화]───────────────────┘
```

### 2.4 Tauri IPC 통신

프론트엔드에서 Rust 백엔드로의 통신은 `src/lib/tauri.ts`를 통해 추상화됩니다.

```typescript
// 단방향 요청-응답
invoke<T>("command_name", { args }) → Promise<T>

// 스트리밍 (압축 진행 이벤트)
Channel<CompressionEvent> → 실시간 콜백
```

**통신 흐름 (이미지 압축):**

```
Frontend                          Backend (Rust)
   │                                   │
   │  compress_images(images, settings, channel)
   │──────────────────────────────────►│
   │                                   │
   │  channel.send({start, id})        │ ← 각 이미지 처리 시작
   │◄──────────────────────────────────│
   │                                   │
   │  channel.send({complete, id, result})
   │◄──────────────────────────────────│ ← 각 이미지 완료
   │                                   │
   │  return CompressionResult[]       │
   │◄──────────────────────────────────│ ← 전체 완료
```

## 3. 백엔드 아키텍처 (Rust)

### 3.1 모듈 구조

```
src-tauri/src/
├── main.rs          ← OS 진입점
├── lib.rs           ← Tauri Builder 설정 (플러그인, 커맨드 등록)
├── commands.rs      ← IPC 커맨드 핸들러 (프론트엔드 인터페이스)
├── utils.rs         ← 공통 유틸리티
├── thumbnail.rs     ← 썸네일/프리뷰 생성
└── compressor/      ← 이미지 압축 엔진
    ├── mod.rs       ← 포맷별 디스패처 + CompressionResult 타입
    ├── jpeg.rs      ← JPEG 압축 (mozjpeg)
    ├── png.rs       ← PNG 압축 (imagequant + oxipng)
    └── gif.rs       ← GIF 최적화 (gif crate)
```

### 3.2 이미지 압축 파이프라인

#### JPEG 압축

```
입력 파일 → image crate (디코딩) → RGB 버퍼
    → mozjpeg (progressive + optimize scans)
    → 출력 파일
```

#### PNG 압축 (2단계)

```
입력 파일 → lodepng (디코딩) → RGBA 버퍼
    → imagequant (lossy: 색상 양자화, 팔레트 축소)
    → lodepng (팔레트 기반 인코딩)
    → oxipng (lossless: DEFLATE 최적화, 청크 제거)
    → 출력 파일

* imagequant 실패 시 → oxipng lossless-only 폴백
```

#### GIF 최적화

```
입력 파일 → gif crate (프레임별 디코딩)
    → 프레임 재인코딩 (글로벌 팔레트 적용)
    → 출력 파일
```

#### 안전장치

```
압축 결과 크기 >= 원본 크기 → 원본 파일을 출력 경로에 복사
```

### 3.3 병렬 처리

rayon의 `par_iter()`를 사용하여 이미지를 CPU 코어 수만큼 병렬 압축합니다.

```rust
images.par_iter().map(|img| {
    on_event.send(start);     // 시작 이벤트 (스레드 안전)
    let result = compress();  // 이미지 압축
    on_event.send(complete);  // 완료 이벤트
    result
}).collect()
```

### 3.4 썸네일 시스템

- **썸네일** (128x128): 이미지 로드 시 즉시 생성, JPEG base64 인코딩
- **프리뷰** (800x800): 사용자 요청 시 on-demand 생성, JPEG base64 인코딩
- `image` crate의 `thumbnail()` 메서드 사용 (비율 유지)
- PreviewModal에서 원본/압축 프리뷰 모두 로드하여 Before/After 비교

## 4. 데이터 흐름

### 4.1 이미지 로드 플로우

```
사용자 액션 (드래그앤드롭 / 파일선택)
    │
    ▼
useDragDrop / DropZone
    │ paths: string[]
    ▼
App.tsx: setIsLoading(true) → 로딩 스피너 오버레이 표시
    │
    ▼
lib/tauri.ts → invoke("load_images", {paths})
    │
    ▼
[Rust] commands::load_images()
    ├── 파일 존재 확인
    ├── 포맷 감지 (확장자 기반)
    ├── 메타데이터 읽기 (크기)
    ├── 썸네일 생성 (128x128 base64)
    └── UUID 할당
    │
    ▼
ImageFileInfo[] → 프론트엔드
    │
    ▼
useImageList.addImages()
    ├── 중복 필터링 (path 기반)
    └── status: "pending" 할당
    │
    ▼
App.tsx: setIsLoading(false) → 로딩 스피너 해제
```

### 4.2 압축 플로우

```
사용자 클릭: "압축 시작"
    │
    ▼
useCompression.startCompression(images, settings)
    │ pending 상태 이미지만 필터
    ▼
lib/tauri.ts → invoke("compress_images", {images, settings, channel})
    │
    ▼
[Rust] commands::compress_images()
    ├── 출력 디렉토리 생성
    └── rayon par_iter ──┬── [Thread 1] compress(img1) → channel.send(event)
                         ├── [Thread 2] compress(img2) → channel.send(event)
                         └── [Thread N] compress(imgN) → channel.send(event)
    │
    ▼ (각 이벤트마다)
handleEvent()
    ├── "start"    → updateImageStatus(id, "compressing")
    ├── "complete" → updateImageResult(id, result) → status: "done"
    └── "error"    → updateImageResult(id, result) → status: "error"
    │
    ▼ (전체 완료 시)
ImageList
    ├── 요약 헤더: 총 절약 용량/비율 실시간 갱신
    └── 완료 카드: "압축 완료 - N개 이미지에서 총 X 절약" 표시
```

### 4.3 Before/After 프리뷰 플로우

```
사용자 클릭: 압축 완료된 이미지 썸네일
    │
    ▼
PreviewModal 열림
    ├── getImagePreview(image.path)       → 원본 프리뷰
    └── getImagePreview(image.output_path) → 압축 프리뷰
    │
    ▼
Before/After 슬라이더 표시
    ├── 왼쪽: 원본 (clip-path로 슬라이더 위치만큼 노출)
    ├── 오른쪽: 압축 (전체 이미지)
    └── 마우스 드래그 / 키보드 조작으로 비교
```

## 5. 설정 영속화

```
useSettings hook
    │
    ├── 초기화: localStorage.getItem("picslim_settings")
    │   └── 없으면 → invoke("get_default_output_dir") 으로 기본값 설정
    │
    └── 변경 시: localStorage.setItem("picslim_settings", JSON.stringify(settings))
```

설정 스키마:
```json
{
  "quality": 90,
  "output_dir": "C:\\Users\\{user}\\Pictures\\PicSlim"
}
```

## 6. 빌드 & 배포

### CI/CD 파이프라인 (GitHub Actions)

두 개의 워크플로우로 분리되어 있습니다.

**ci.yml** (PR 시 실행):
```
PR to main
    │
    ▼
[Job: Lint & Type Check] (ubuntu-latest)
    ├── npm ci
    └── npx tsc --noEmit
    │
    ▼
[Job: Build (Windows)] (windows-latest)
    ├── Node.js 22 + Rust stable + NASM 설치
    ├── npm ci
    └── tauri-action (빌드 검증)
```

**release.yml** (태그 푸시 시 실행):
```
Push tag v*
    │
    ▼
[Job: Build & Release] (windows-latest)
    ├── Node.js 22 + Rust stable + NASM 설치
    ├── npm ci
    ├── tauri-action (빌드 + NSIS 인스톨러 생성)
    ├── 포터블 exe 업로드 (PicSlim_v*_portable.exe)
    └── GitHub Release (draft) + 인스톨러 + 포터블 exe 첨부
```

### 코드 리뷰 (CodeRabbit AI)

```
PR 생성/업데이트
    │
    ▼
CodeRabbit 자동 리뷰 (한국어)
    ├── 경로별 컨텍스트 지시사항 적용
    ├── 수정 필요 시 → Changes Requested 리뷰
    └── 리뷰 코멘트 미해결 시 → 머지 차단 (branch protection)
```

### Branch Protection (main)

| 규칙 | 설정 |
|------|------|
| 필수 상태 체크 | CI / Lint & Type Check 통과 |
| strict 모드 | main 대비 최신 상태여야 머지 가능 |
| 대화 해결 필수 | CodeRabbit 리뷰 코멘트 모두 resolve |
| force push 차단 | 활성화 |
| 브랜치 삭제 차단 | 활성화 |
| admin bypass 차단 | `enforce_admins: true` |

### 프로덕션 빌드 최적화 (Cargo.toml)

```toml
[profile.release]
strip = true          # 디버그 심볼 제거
lto = true            # 링크 타임 최적화
codegen-units = 1     # 최대 최적화 (빌드 느림, 실행 빠름)
opt-level = "s"       # 바이너리 크기 최적화
```

## 7. 의존성 맵

### 프론트엔드

```
react 19 ─── react-dom 19
@tauri-apps/api 2 ─── @tauri-apps/plugin-dialog 2
                  └── @tauri-apps/plugin-opener 2
tailwindcss 4 ─── @tailwindcss/vite 4
vite 7 ─── @vitejs/plugin-react 4
typescript 5.8
```

### 백엔드

```
tauri 2 ─── tauri-plugin-dialog 2
        └── tauri-plugin-opener 2
image 0.25 ─── (이미지 디코딩/리사이즈)
mozjpeg 0.10 ── (JPEG 압축)
imagequant 4 ── (PNG 색상 양자화)
lodepng 3 ───── (PNG 디코딩/인코딩)
oxipng 10 ───── (PNG lossless 최적화)
gif 0.13 ────── (GIF 처리)
rayon 1.10 ──── (병렬 처리)
uuid 1 ──────── (이미지 ID 생성)
base64 0.22 ─── (썸네일 인코딩)
serde 1 ─────── (직렬화)
serde_json 1 ── (JSON 직렬화)
```

## 8. 보안 고려사항

- **CSP**: null (Tauri 로컬 앱이므로 외부 리소스 로드 없음)
- **파일 시스템**: 모든 파일 접근은 Rust 백엔드 커맨드를 통해서만 가능
- **사용자 입력**: 파일 경로는 OS 다이얼로그 또는 드래그앤드롭으로만 수집 (사용자 직접 입력 없음)
- **capabilities**: Tauri capabilities 파일로 권한 제어 (`src-tauri/capabilities/default.json`)
- **폰트**: 외부 CDN 대신 셀프 호스팅 (`public/fonts/`)으로 네트워크 의존성 제거
