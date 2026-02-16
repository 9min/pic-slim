# CLAUDE.md - PicSlim 프로젝트 가이드

## 프로젝트 개요

PicSlim은 이미지 용량 최적화 데스크톱 앱입니다. Tauri v2 + React + TypeScript + Rust 기반으로 Windows용 네이티브 앱을 제공합니다.

## 기술 스택

- **프론트엔드**: React 19, TypeScript 5.8, Tailwind CSS v4, Vite 7
- **백엔드**: Rust (Tauri v2)
- **이미지 압축 엔진**: mozjpeg (JPEG), imagequant + oxipng (PNG), gif crate (GIF)
- **빌드/배포**: GitHub Actions, NSIS 인스톨러 + 포터블 exe
- **코드 리뷰**: CodeRabbit AI (`.coderabbit.yaml`)
- **패키지 매니저**: npm

## 프로젝트 구조

```
pic-slim/
├── src/                          # React 프론트엔드
│   ├── main.tsx                  # 앱 진입점
│   ├── App.tsx                   # 메인 앱 컴포넌트
│   ├── types/index.ts            # TypeScript 타입 정의
│   ├── lib/tauri.ts              # Tauri invoke 래퍼
│   ├── hooks/                    # React 커스텀 훅
│   │   ├── useSettings.ts        # 설정 관리 (quality, output_dir)
│   │   ├── useImageList.ts       # 이미지 목록 상태 관리
│   │   ├── useCompression.ts     # 압축 프로세스 관리
│   │   └── useDragDrop.ts        # 드래그앤드롭 이벤트
│   ├── components/               # UI 컴포넌트
│   │   ├── Header.tsx            # 상단 헤더 (로고, 설정 버튼)
│   │   ├── DropZone.tsx          # 파일 드롭/선택 영역
│   │   ├── ImageList.tsx         # 이미지 목록 + 요약 카드 + 완료 카드
│   │   ├── ImageItem.tsx         # 개별 이미지 항목 (포맷 배지 포함)
│   │   ├── ProgressBar.tsx       # 진행률 바
│   │   ├── ActionBar.tsx         # 하단 액션 버튼 바
│   │   ├── Settings.tsx          # 설정 패널 (슬라이드오버) + 엔진 정보 + 버전
│   │   └── PreviewModal.tsx      # Before/After 비교 슬라이더 모달
│   └── styles/globals.css        # 글로벌 CSS + 테마 + 애니메이션 + 호버
├── public/
│   └── fonts/                    # DM Sans 셀프 호스팅 폰트
│       ├── DMSans-Regular.ttf
│       ├── DMSans-Medium.ttf
│       ├── DMSans-SemiBold.ttf
│       └── DMSans-Bold.ttf
├── src-tauri/                    # Rust 백엔드
│   ├── src/
│   │   ├── main.rs               # Tauri 진입점
│   │   ├── lib.rs                # 플러그인/커맨드 등록
│   │   ├── commands.rs           # Tauri 커맨드 핸들러
│   │   ├── utils.rs              # 유틸 (포맷 감지, 파일 크기 등)
│   │   ├── thumbnail.rs          # 썸네일/프리뷰 생성
│   │   └── compressor/           # 이미지 압축 엔진
│   │       ├── mod.rs            # 압축 디스패처
│   │       ├── jpeg.rs           # JPEG 압축 (mozjpeg)
│   │       ├── png.rs            # PNG 압축 (imagequant + oxipng)
│   │       └── gif.rs            # GIF 최적화
│   ├── Cargo.toml                # Rust 의존성
│   └── tauri.conf.json           # Tauri 설정
├── .github/workflows/
│   ├── ci.yml                    # PR 시 Lint + Type Check + Cargo Check
│   └── release.yml               # 태그 푸시 시 빌드 + GitHub Release
├── .coderabbit.yaml              # CodeRabbit AI 코드 리뷰 설정
├── package.json                  # Node 의존성
└── vite.config.ts                # Vite 설정
```

## 개발 명령어

```bash
# 프론트엔드 개발 서버
npm run dev

# Tauri 개발 모드 (프론트+백 동시 실행)
npm run tauri dev

# 프로덕션 빌드 (실행파일 + NSIS 인스톨러)
npm run tauri build

# TypeScript 타입 체크
npx tsc --noEmit

# 프론트엔드만 빌드
npm run build
```

## 빌드 결과물

```
src-tauri/target/debug/pic-slim.exe          # 디버그 빌드 (tauri dev)
src-tauri/target/release/pic-slim.exe        # 릴리스 빌드 (tauri build)
src-tauri/target/release/bundle/nsis/*.exe   # Windows 인스톨러 (tauri build)
```

## 코딩 컨벤션

### 프론트엔드 (TypeScript/React)

- 컴포넌트: 함수 컴포넌트 + default export
- 상태 관리: 커스텀 훅 패턴 (`useXxx`)
- 스타일: **인라인 `style={}` 우선** + Tailwind CSS 레이아웃 유틸리티 보조 (`flex`, `items-center` 등)
  - 색상, 패딩, 폰트 등 디자인 값은 인라인 style로 직접 지정
  - Flexbox 레이아웃 등은 Tailwind 클래스 사용 가능
  - 호버/인터랙션은 `globals.css`의 클래스 기반 (`.image-row`, `.action-btn-primary` 등)
  - 애니메이션은 `globals.css`의 커스텀 keyframe (`.animate-fade-in`, `.animate-shimmer` 등)
- 폰트: DM Sans (셀프 호스팅, `public/fonts/`)
- 타입: `src/types/index.ts`에 중앙 정의
- Tauri 통신: `src/lib/tauri.ts`에 invoke 래퍼 함수로 추상화
- 한국어 UI: 모든 사용자 대면 텍스트는 한국어
- 접근성: `aria-label`, `aria-hidden`, `role`, `prefers-reduced-motion` 지원

### 백엔드 (Rust)

- Tauri 커맨드: `commands.rs`에 `#[tauri::command]` 함수 정의
- 에러 처리: `.map_err(|e| format!("한국어 설명: {}", e))` 패턴
- 병렬 처리: rayon의 `par_iter()` 사용
- 이벤트 스트리밍: Tauri `Channel<T>`로 프론트엔드에 실시간 진행 상태 전송
- 압축 전략: 압축 결과가 원본보다 크면 원본 복사

### Git 워크플로우

- **main 직접 푸시 절대 금지** - 어떤 경우에도 main에 직접 commit/push하지 않는다
- 모든 변경은 반드시 feature/fix 브랜치 생성 → PR 생성 → 리뷰 통과 후 머지
- PR 생성 시: CodeRabbit AI 자동 코드 리뷰 (한국어)
- 머지 조건: CodeRabbit 리뷰 코멘트 전체 resolve + CI 통과
- 릴리스: `v*` 태그 푸시 시 자동 빌드 + GitHub Release (draft) + 포터블 exe 첨부
- Branch Protection: `enforce_admins: true` (admin도 직접 푸시 불가)

## Tauri 커맨드 (프론트-백 인터페이스)

| 커맨드 | 설명 | 입력 | 출력 |
|--------|------|------|------|
| `load_images` | 이미지 파일 로드 | `paths: string[]` | `ImageFileInfo[]` |
| `compress_images` | 이미지 배치 압축 | `images, settings, on_event` | `CompressionResult[]` |
| `open_output_folder` | 출력 폴더 열기 | `path: string` | `void` |
| `get_default_output_dir` | 기본 출력 디렉토리 | 없음 | `string` |
| `get_image_preview` | 이미지 프리뷰 생성 | `path: string` | `string (base64)` |

## 지원 이미지 포맷

| 포맷 | 압축 방식 | 라이브러리 |
|------|----------|-----------|
| JPEG | Lossy (quality 기반) | mozjpeg |
| PNG | Lossy (imagequant) + Lossless (oxipng) | imagequant, lodepng, oxipng |
| GIF | 프레임 재인코딩 | gif crate |

## 디자인 시스템

### 테마 색상 (`globals.css @theme`)

| 변수 | 용도 |
|------|------|
| `--color-accent` (#2563EB) | 주요 액션, 버튼 |
| `--color-success` (#16A34A) | 압축 완료, 절약 표시 |
| `--color-danger` (#DC2626) | 에러, 삭제 |
| `--color-text-primary` (#111827) | 본문 텍스트 |
| `--color-text-tertiary` (#9CA3AF) | 보조 텍스트 |
| `--color-border` (#E5E7EB) | 구분선 |

### 포맷별 배지 색상

| 포맷 | 배경 | 텍스트 | 테두리 |
|------|------|--------|--------|
| JPG | #FFFBEB | #D97706 | #FDE68A |
| PNG | #EFF6FF | #2563EB | #BFDBFE |
| GIF | #F5F3FF | #7C3AED | #DDD6FE |

## 주의사항

- Rust 컴파일에 NASM이 필요함 (mozjpeg 빌드 의존성)
- Windows 전용 앱 (NSIS 인스톨러 타깃)
- 썸네일은 128x128 JPEG base64, 프리뷰는 800x800 JPEG base64
- 설정은 localStorage에 저장 (`picslim_settings` 키)
- 기본 출력 디렉토리: `%USERPROFILE%\Pictures\PicSlim`
- 기본 압축 품질: 90 (범위: 60-95)
- DM Sans 폰트는 `public/fonts/`에 셀프 호스팅 (오프라인 Tauri 앱 대응)
