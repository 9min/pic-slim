# PicSlim

<p align="center">
  <img src="app-icon.png" width="128" height="128" alt="PicSlim Icon">
</p>

<p align="center">
  <strong>이미지 용량 최적화 데스크톱 앱</strong><br>
  드래그 & 드롭으로 간편하게, 업계 최고 수준의 압축 엔진으로 빠르게
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows-blue" alt="Platform">
  <img src="https://img.shields.io/badge/version-0.1.0-green" alt="Version">
  <img src="https://img.shields.io/badge/license-All%20Rights%20Reserved-red" alt="License">
</p>

---

## 주요 기능

- **원클릭 일괄 압축** - 이미지를 드래그앤드롭하고 버튼 한 번이면 끝
- **고품질 압축 엔진** - JPEG(mozjpeg), PNG(imagequant + oxipng), GIF 지원
- **멀티스레드 병렬 처리** - Rust + rayon 기반으로 CPU 코어를 모두 활용
- **Before/After 비교** - 슬라이더로 원본과 압축 이미지를 시각적으로 비교
- **절약량 실시간 표시** - 압축 중/후 절약 용량과 비율을 한눈에 확인
- **가볍고 빠른 네이티브 앱** - Tauri 기반으로 Electron 대비 작은 바이너리

## 지원 포맷

| 포맷 | 압축 엔진 | 방식 |
|------|----------|------|
| JPEG | mozjpeg | Progressive + Optimize Scans |
| PNG | imagequant + oxipng | Lossy 양자화 + Lossless 최적화 |
| GIF | gif crate | 프레임 재인코딩 |

## 설치

### 릴리스 다운로드

[Releases](../../releases) 페이지에서 다운로드하세요.

- **인스톨러** (`PicSlim_v*_x64-setup.exe`) - 설치 후 실행
- **포터블** (`PicSlim_v*_portable.exe`) - 설치 없이 바로 실행

### 직접 빌드

**사전 요구사항:**
- [Node.js](https://nodejs.org/) 22+
- [Rust](https://rustup.rs/) stable
- [NASM](https://www.nasm.us/) (mozjpeg 빌드에 필요)

```bash
# 의존성 설치
npm install

# 개발 모드 실행
npm run tauri dev

# 프로덕션 빌드 (실행파일 + 인스톨러)
npm run tauri build
```

빌드 결과물:
```
src-tauri/target/release/pic-slim.exe              # 실행파일
src-tauri/target/release/bundle/nsis/PicSlim_*.exe  # 인스톨러
```

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Vite 7 |
| Backend | Rust, Tauri v2 |
| 압축 | mozjpeg, imagequant, oxipng, gif |
| CI/CD | GitHub Actions |
| 코드 리뷰 | CodeRabbit AI |

## 프로젝트 구조

```
src/                  # React 프론트엔드
  ├── components/     # UI 컴포넌트
  ├── hooks/          # 커스텀 훅 (상태 관리)
  ├── lib/            # Tauri IPC 래퍼
  └── types/          # TypeScript 타입

src-tauri/src/        # Rust 백엔드
  ├── commands.rs     # Tauri 커맨드
  ├── compressor/     # JPEG/PNG/GIF 압축 엔진
  └── thumbnail.rs    # 썸네일/프리뷰 생성
```

## 라이선스

**All Rights Reserved.** 소스 코드는 열람만 허용됩니다. 저작권자의 사전 서면 동의 없이 다음 행위가 금지됩니다:

- 복사, 복제, 수정, 배포
- 상업적 또는 비상업적 사용
- 2차 저작물 생성
- 서브라이선싱

자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

---

Made by **9min**
