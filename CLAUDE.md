# CLAUDE.md - PicSlim 프로젝트 가이드

## 프로젝트 개요

PicSlim은 이미지 용량 최적화 데스크톱 앱입니다. Tauri v2 + React + TypeScript + Rust 기반으로 Windows용 네이티브 앱을 제공합니다.

## 기술 스택

- **프론트엔드**: React 19, TypeScript 5.8, Tailwind CSS v4, Vite 7
- **백엔드**: Rust (Tauri v2)
- **이미지 압축 엔진**: mozjpeg (JPEG), imagequant + oxipng (PNG), gif crate (GIF)
- **빌드/배포**: GitHub Actions, NSIS 인스톨러
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
│   │   ├── ImageList.tsx         # 이미지 목록 컨테이너
│   │   ├── ImageItem.tsx         # 개별 이미지 항목
│   │   ├── ProgressBar.tsx       # 진행률 바
│   │   ├── ActionBar.tsx         # 하단 액션 버튼 바
│   │   ├── Settings.tsx          # 설정 패널 (슬라이드오버)
│   │   └── PreviewModal.tsx      # 이미지 미리보기 모달
│   └── styles/globals.css        # 글로벌 CSS + Tailwind 테마
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
├── .github/workflows/build.yml   # CI/CD 파이프라인
├── package.json                  # Node 의존성
└── vite.config.ts                # Vite 설정
```

## 개발 명령어

```bash
# 프론트엔드 개발 서버
npm run dev

# Tauri 개발 모드 (프론트+백 동시 실행)
npm run tauri dev

# 프로덕션 빌드
npm run tauri build

# TypeScript 타입 체크
npx tsc --noEmit

# 프론트엔드만 빌드
npm run build
```

## 코딩 컨벤션

### 프론트엔드 (TypeScript/React)

- 컴포넌트: 함수 컴포넌트 + default export
- 상태 관리: 커스텀 훅 패턴 (`useXxx`)
- 스타일: Tailwind CSS 유틸리티 클래스 (인라인)
- 타입: `src/types/index.ts`에 중앙 정의
- Tauri 통신: `src/lib/tauri.ts`에 invoke 래퍼 함수로 추상화
- 한국어 UI: 모든 사용자 대면 텍스트는 한국어

### 백엔드 (Rust)

- Tauri 커맨드: `commands.rs`에 `#[tauri::command]` 함수 정의
- 에러 처리: `.map_err(|e| format!("한국어 설명: {}", e))` 패턴
- 병렬 처리: rayon의 `par_iter()` 사용
- 이벤트 스트리밍: Tauri `Channel<T>`로 프론트엔드에 실시간 진행 상태 전송
- 압축 전략: 압축 결과가 원본보다 크면 원본 복사

### 공통

- 커밋 메시지: 한국어 가능
- 파일 경로: Windows 호환 필수 (`PathBuf` 사용)
- 보안: CSP null (Tauri 로컬 앱), 파일 시스템 접근은 Tauri 커맨드 통해서만

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

## 주의사항

- Rust 컴파일에 NASM이 필요함 (mozjpeg 빌드 의존성)
- Windows 전용 앱 (NSIS 인스톨러 타깃)
- 썸네일은 128x128 JPEG base64, 프리뷰는 800x800 JPEG base64
- 설정은 localStorage에 저장 (`picslim_settings` 키)
- 기본 출력 디렉토리: `%USERPROFILE%\Pictures\PicSlim`
