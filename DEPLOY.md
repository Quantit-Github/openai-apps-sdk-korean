# 📚 Apps SDK Documentation - GitHub Pages 배포 가이드

이 문서는 Apps SDK 문서 사이트를 GitHub Pages로 배포하는 방법을 설명합니다.

## 🎯 배포된 사이트 구조

```
https://quantit-github.github.io/openai-apps-sdk-korean/
├── index.html                 # 메인 랜딩 페이지 (한/영 지원)
├── 404.html                   # 404 에러 페이지
├── README.md / README.ko.md   # 소개 페이지
├── SUMMARY.md / SUMMARY.ko.md # 목차
├── core-concepts/             # 핵심 개념 문서들
├── plan/                      # 계획 관련 문서들
├── build/                     # 빌드 가이드
├── deploy/                    # 배포 가이드
├── guides/                    # 각종 가이드
└── resources/                 # 리소스 및 참고자료
```

## 🚀 배포 방법

### 1단계: Repository 설정

1. GitHub에서 이 repository를 생성합니다
2. 로컬 코드를 push합니다:

```bash
git add .
git commit -m "Initial commit with documentation"
git branch -M main
git remote add origin https://github.com/quantit-github/openai-apps-sdk-korean.git
git push -u origin main
```

### 2단계: GitHub Pages 활성화

1. GitHub repository 페이지로 이동
2. **Settings** → **Pages** 메뉴로 이동
3. **Source** 섹션에서:
   - **Branch**: `main` 선택
   - **Folder**: `/ (root)` 선택
4. **Save** 클릭

또는 GitHub Actions를 사용한 자동 배포:

1. **Settings** → **Pages** → **Source**에서 **GitHub Actions** 선택
2. 이미 `.github/workflows/deploy.yml` 파일이 있으므로 자동으로 배포됩니다

### 3단계: 설정 파일 확인

`_config.yml` 파일이 올바르게 설정되어 있는지 확인하세요:

```yaml
url: https://quantit-github.github.io
baseurl: /openai-apps-sdk-korean
```

### 4단계: 배포 확인

- 배포는 자동으로 시작됩니다 (약 1-2분 소요)
- **Actions** 탭에서 배포 진행 상황을 확인할 수 있습니다
- 완료 후 `https://quantit-github.github.io/openai-apps-sdk-korean/` 에서 사이트를 확인하세요

## 🌍 다국어 지원

### 언어 전환
- 랜딩 페이지에서 우측 상단의 언어 버튼으로 전환 가능
- 한국어(`.ko.md`)와 영어(`.md`) 버전이 모두 제공됩니다
- 사용자의 언어 선택은 localStorage에 저장됩니다

### 파일 구조
```
README.md       # 영어 버전
README.ko.md    # 한국어 버전
```

모든 문서는 동일한 구조로 `.ko.md` 확장자를 가진 한국어 버전이 있습니다.

## ✨ 주요 기능

### 1. 반응형 디자인
- 모바일, 태블릿, 데스크톱 모두 지원
- 자동으로 화면 크기에 맞춰 레이아웃 조정

### 2. 빠른 네비게이션
- 카테고리별로 정리된 문서 링크
- 아이콘으로 각 섹션 구분
- 호버 효과로 사용자 경험 향상

### 3. SEO 최적화
- 메타 태그 설정
- sitemap 자동 생성
- 검색 엔진 최적화

### 4. 404 페이지
- 커스텀 404 에러 페이지
- 영문 페이지를 찾을 때 한글 버전 자동 제안

## 🔧 커스터마이징

### 색상 변경
`index.html`의 CSS에서 주요 색상을 변경할 수 있습니다:

```css
/* 메인 그라디언트 색상 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 버튼 및 링크 색상 */
color: #667eea;
```

### 로고 추가
1. `assets/` 폴더에 로고 이미지 추가
2. `_config.yml`에서 로고 경로 설정:
```yaml
logo: /assets/logo.png
```

### Google Analytics 추가
`_config.yml`에서 다음 줄의 주석을 제거하고 ID를 입력하세요:
```yaml
google_analytics: UA-XXXXXXXXX-X
```

## 📝 문서 업데이트

새로운 문서를 추가하거나 수정한 후:

```bash
git add .
git commit -m "Update documentation"
git push
```

GitHub Actions가 자동으로 사이트를 재배포합니다.

## 🔍 트러블슈팅

### 사이트가 404 에러를 표시하는 경우
1. `_config.yml`의 `baseurl` 설정 확인
2. GitHub Pages 설정에서 올바른 브랜치가 선택되었는지 확인
3. `.nojekyll` 파일이 있는지 확인 (이미 포함됨)

### CSS가 적용되지 않는 경우
1. 브라우저 캐시를 지우고 새로고침 (Ctrl+Shift+R / Cmd+Shift+R)
2. `index.html` 파일의 경로가 올바른지 확인

### 한글이 깨지는 경우
1. 모든 파일이 UTF-8 인코딩인지 확인
2. HTML 파일의 `<meta charset="UTF-8">` 태그 확인

## 📚 추가 리소스

- [GitHub Pages 공식 문서](https://docs.github.com/en/pages)
- [Jekyll 문서](https://jekyllrb.com/docs/)
- [Markdown 가이드](https://www.markdownguide.org/)

## 💡 팁

1. **로컬 테스트**: Python을 사용해 로컬에서 미리보기
   ```bash
   python -m http.server 8000
   # http://localhost:8000 에서 확인
   ```

2. **자동 배포**: main 브랜치에 push하면 자동으로 배포됩니다

3. **커스텀 도메인**: GitHub Pages 설정에서 커스텀 도메인을 연결할 수 있습니다

## 🎉 완료!

이제 Apps SDK 문서 사이트가 GitHub Pages에 배포되었습니다!

사이트 주소: `https://quantit-github.github.io/openai-apps-sdk-korean/`
