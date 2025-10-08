# 📖 마크다운 렌더링 가이드

GitHub Pages에서 마크다운 파일이 자동으로 HTML로 렌더링됩니다!

## ✨ 작동 방식

### Jekyll 자동 처리
모든 `.md` 파일은 Jekyll에 의해 자동으로 처리됩니다:
1. Front matter에서 레이아웃 정보 읽기
2. 마크다운 → HTML 변환
3. `_layouts/default.html` 템플릿 적용
4. 최종 HTML 페이지 생성

### Front Matter
모든 마크다운 파일 상단에 다음 정보가 있습니다:

```yaml
---
layout: default
title: 페이지 제목
lang: ko  # 또는 en
---
```

## 🎨 지원되는 기능

### 1. 기본 마크다운
```markdown
# 제목 1
## 제목 2
### 제목 3

**굵게**, *기울임*, ~~취소선~~

- 목록 항목
- 목록 항목

1. 번호 목록
2. 번호 목록

[링크](url)
![이미지](url)
```

### 2. 코드 하이라이팅
````markdown
```javascript
function hello() {
    console.log("Hello World!");
}
```

```python
def hello():
    print("Hello World!")
```
````

### 3. 표
```markdown
| 헤더1 | 헤더2 |
|-------|-------|
| 셀1   | 셀2   |
```

### 4. 인용구
```markdown
> 이것은 인용구입니다.
> 여러 줄도 가능합니다.
```

### 5. 수평선
```markdown
---
```

## 🔧 커스터마이징

### 레이아웃 수정
`_layouts/default.html` 파일을 수정하여 전체 페이지 디자인 변경:
- 헤더/푸터 수정
- 사이드바 항목 추가/제거
- CSS 스타일 조정

### 스타일 변경
`_layouts/default.html`의 `<style>` 태그 내부에서:

```css
:root {
    --primary-color: #667eea;    /* 메인 색상 */
    --secondary-color: #764ba2;  /* 보조 색상 */
    --text-color: #333;          /* 텍스트 색상 */
    --link-color: #667eea;       /* 링크 색상 */
}
```

## 📝 새 페이지 추가하기

### 1. 마크다운 파일 생성
```bash
# 영어 버전
touch docs/new-page.md

# 한국어 버전
touch docs/new-page.ko.md
```

### 2. Front Matter 추가
```yaml
---
layout: default
title: 새 페이지
lang: ko
---

# 새 페이지

내용을 여기에 작성...
```

또는 자동으로 추가:
```bash
node add-frontmatter.js
```

### 3. 네비게이션에 추가
`_layouts/default.html`의 사이드바 섹션에 링크 추가:

```html
<li><a href="{{ site.baseurl }}/docs/new-page{{ page.lang == 'ko' ? '.ko' : '' }}.md">새 페이지</a></li>
```

## 🌐 다국어 지원

### 파일 명명 규칙
- 영어: `filename.md`
- 한국어: `filename.ko.md`

### 언어 전환 버튼
페이지 상단의 언어 전환 버튼이 자동으로:
1. 현재 언어 감지
2. 대응하는 언어 페이지로 이동

## 🚀 배포 프로세스

### 1. 로컬 미리보기
```bash
# Python으로 로컬 서버 실행
python -m http.server 8000

# 또는 Jekyll로 실행 (Jekyll 설치 필요)
bundle exec jekyll serve

# http://localhost:8000 또는 localhost:4000 에서 확인
```

### 2. GitHub에 Push
```bash
git add .
git commit -m "Add new documentation"
git push origin main
```

### 3. 자동 배포
- GitHub Actions가 자동으로 Jekyll 빌드 실행
- 약 1-2분 후 사이트 업데이트 완료

## 🎯 URL 구조

모든 마크다운 파일은 그대로의 경로로 접근 가능:

```
원본: /Users/wogus/Project/pilot/apps-sdk/build/auth.ko.md
URL:  https://quantit-github.github.io/openai-apps-sdk-korean/build/auth.ko.md
```

## ⚡ 팁 & 트릭

### 1. 상대 링크 사용
```markdown
<!-- 좋음 -->
[인증](../build/auth.ko.md)

<!-- 나쁨 -->
[인증](https://quantit-github.github.io/openai-apps-sdk-korean/build/auth.ko.md)
```

### 2. 이미지 최적화
- 이미지는 `assets/images/` 폴더에 저장
- 크기를 적절히 조정 (너무 크지 않게)

### 3. 앵커 링크
```markdown
## 섹션 제목 {#custom-id}

[이 섹션으로 이동](#custom-id)
```

### 4. 코드 블록에 언어 지정
````markdown
```typescript  # 언어를 명시하면 하이라이팅 적용
const x = 1;
```
````

## 🐛 문제 해결

### 페이지가 렌더링되지 않는 경우
1. Front matter가 올바른지 확인
2. `_config.yml`의 exclude 목록 확인
3. GitHub Actions 로그 확인

### 스타일이 적용되지 않는 경우
1. 브라우저 캐시 삭제
2. `_layouts/default.html`의 CSS 확인

### 링크가 작동하지 않는 경우
1. 상대 경로 확인
2. 파일명 대소문자 확인
3. `.md` 확장자 포함 여부 확인

## 📚 참고 자료

- [Jekyll 공식 문서](https://jekyllrb.com/docs/)
- [Kramdown 문법](https://kramdown.gettalong.org/syntax.html)
- [GitHub Pages 가이드](https://docs.github.com/en/pages)
- [Markdown 가이드](https://www.markdownguide.org/)

## 🎉 완료!

이제 마크다운 파일을 작성하면 자동으로 아름다운 HTML 페이지로 변환됩니다!
