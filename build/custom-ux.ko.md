---
layout: default
title: 커스텀 UX 구축하기
lang: ko
---

# 커스텀 UX 구축하기

커스텀 UI 컴포넌트 및 앱 페이지를 구축합니다.

## 개요

UI 컴포넌트는 구조화된 도구 결과를 사람 친화적인 UI로 변환합니다. Apps SDK 컴포넌트는 일반적으로 iframe 내부에서 실행되고, `window.openai` API를 통해 호스트와 통신하며, 대화와 인라인으로 렌더링되는 React 컴포넌트입니다. 이 가이드는 컴포넌트 프로젝트를 구조화하고, 번들링하며, MCP 서버와 연결하는 방법을 설명합니다.

## window.openai API 이해하기

`window.openai`는 iframe과 ChatGPT 간의 브리지입니다. 컴포넌트 스캐폴딩을 시작하기 전에 데이터, 상태 및 레이아웃 관련 사항을 연결하는 방법을 이해하기 위해 이 빠른 참조를 사용하세요.

- 호스트가 제공하는 레이아웃 전역 변수: `displayMode`, `maxHeight`, `theme`, `locale`
- 현재 메시지에 범위가 지정된 도구 페이로드: `toolInput`, `toolOutput`, 그리고 호스트에 의해 지속되는 `widgetState`
- iframe에서 호출할 수 있는 액션: `setWidgetState`, `callTool`, `sendFollowupTurn`, `requestDisplayMode`
- 구독할 수 있는 이벤트: `openai:set_globals`와 `openai:tool_response`

### 도구 데이터 접근하기

MCP 호출 결과의 `structuredContent` 출력에 접근하려면 `window.openai.toolOutput`에서 읽으세요. 입력값의 경우 `window.openai.toolInput`을 사용합니다.

```typescript
const toolInput = window.openai?.toolInput as { city?: string } | undefined;
const toolOutput = window.openai?.toolOutput as PizzaListState | undefined;

const places = toolOutput?.places ?? [];
const favorites = toolOutput?.favorites ?? [];

useEffect(() => {
  if (!toolOutput) return;
  // keep analytics, caches, or derived data in sync with the latest tool response
}, [toolOutput]);
```

### 컴포넌트 상태 지속하기

렌더링 간에 UI 결정(즐겨찾기, 필터 또는 임시저장)을 기억하고 싶을 때 `window.openai.setWidgetState`를 사용하세요. 호스트가 사용자가 떠난 곳에서 컴포넌트를 복원할 수 있도록 의미 있는 변경 후마다 새 스냅샷을 저장하세요.

마운트 시 먼저 `widgetState`에서 읽고, 상태가 아직 설정되지 않은 경우 `toolOutput`으로 폴백합니다.

```typescript
async function persistFavorites(favorites: string[]) {
  const places = window.openai?.toolOutput?.places ?? [];
  await window.openai?.setWidgetState?.({
    __v: 1,
    places,
    favorites,
  });
}

const initial: PizzaListState =
  window.openai?.widgetState ??
  window.openai?.toolOutput ?? {
    places: [],
    favorites: [],
  };
```

### 서버 액션 트리거하기

`window.openai.callTool`을 사용하면 컴포넌트가 직접 MCP 도구 호출을 수행할 수 있습니다. 직접적인 조작(데이터 새로고침, 근처 레스토랑 가져오기)에 이를 사용하세요. 가능한 경우 도구를 멱등하게 설계하고, 모델이 후속 턴에서 추론할 수 있는 업데이트된 구조화 콘텐츠를 반환하도록 하세요.

참고로 도구는 [컴포넌트에 의해 시작될 수 있도록 표시](https://developers.openai.com/apps-sdk/build/mcp-server#allow-component-initiated-tool-access)되어야 합니다.

```typescript
async function refreshPlaces(city: string) {
  await window.openai?.callTool("refresh_pizza_list", { city });
}
```

### 대화형 후속 질문 보내기

`window.openai.sendFollowupTurn`을 사용하여 사용자가 질문한 것처럼 메시지를 대화에 삽입하세요.

```typescript
await window.openai?.sendFollowupTurn({
  prompt: "Draft a tasting itinerary for the pizzerias I favorited.",
});
```

### 대체 레이아웃 요청하기

UI에 지도, 테이블 또는 내장 편집기와 같은 더 많은 공간이 필요한 경우 호스트에게 컨테이너 변경을 요청하세요. `window.openai.requestDisplayMode`는 인라인, PiP 또는 전체화면 프레젠테이션을 협상합니다.

```typescript
await window.openai?.requestDisplayMode({ mode: "fullscreen" });
// Note: on mobile, PiP may be coerced to fullscreen
```

### 호스트 업데이트에 응답하기

호스트는 언제든지 레이아웃, 테마 또는 로케일을 변경할 수 있습니다. `window.openai`의 전역 변수를 읽고 `openai:set_globals`를 수신하여 조건이 변경될 때 크기 조정, 스타일 재지정 또는 재렌더링을 수행할 수 있습니다.

`window.openai` 전역 변수를 사용하여 레이아웃 및 테마 변경에 응답하세요:

- `window.openai.displayMode`는 컴포넌트가 인라인, picture-in-picture 또는 전체화면인지 알려줍니다.
- `window.openai.maxHeight`는 스크롤바가 나타나기 전에 사용할 수 있는 세로 공간을 나타냅니다.
- `window.openai.locale`은 사용자의 로케일(BCP 47 태그)을 반환하며 iframe의 `lang` 속성과 일치합니다.
- 테마나 레이아웃 변경에 반응해야 하는 경우 `openai:set_globals` window 이벤트를 수신하세요.

### 도구 응답 구독하기

도구 호출은 사용자, 어시스턴트 또는 자체 컴포넌트에서 시작될 수 있습니다. 백그라운드 액션이 완료될 때마다 UI 상태를 새로고침하려면 `openai:tool_response`를 구독하세요. 메모리 누수를 방지하기 위해 언마운트 시 구독을 취소하는 것을 잊지 마세요.

```typescript
React.useEffect(() => {
  function onToolResponse(
    e: CustomEvent<{ tool: { name: string; args: Record<string, unknown> } }>
  ) {
    if (e.detail.tool.name === "refresh_pizza_list") {
      // Optionally update local UI after background tool calls
      // e.detail.tool.args.city contains the city that was refreshed
    }
  }
  window.addEventListener("openai:tool_response", onToolResponse as EventListener);
  return () => window.removeEventListener("openai:tool_response", onToolResponse as EventListener);
}, []);
```

### 호스트 지원 네비게이션 사용하기

Skybridge(샌드박스 런타임)는 iframe의 히스토리를 ChatGPT의 UI에 미러링합니다. React Router와 같은 표준 라우팅 API를 사용하면 호스트가 네비게이션 컨트롤을 컴포넌트와 동기화합니다.

Router 설정 (React Router의 `BrowserRouter`):

```typescript
export default function PizzaListRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PizzaListApp />}>
          <Route path="place/:placeId" element={<PizzaListApp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

프로그래매틱 네비게이션:

```typescript
const navigate = useNavigate();

function openDetails(placeId: string) {
  navigate(`place/${placeId}`, { replace: false });
}

function closeDetails() {
  navigate("..", { replace: true });
}
```

## 컴포넌트 프로젝트 스캐폴딩하기

이제 `window.openai` API를 이해했으니 컴포넌트 프로젝트를 스캐폴딩할 차례입니다.

모범 사례로, 컴포넌트 코드를 서버 로직과 분리하여 유지하세요. 일반적인 레이아웃은 다음과 같습니다:

```
app/
  server/            # MCP server (Python or Node)
  web/               # Component bundle source
    package.json
    tsconfig.json
    src/component.tsx
    dist/component.js   # Build output
```

프로젝트를 생성하고 의존성을 설치합니다 (Node 18+ 권장):

```bash
cd app/web
npm init -y
npm install react@^18 react-dom@^18
npm install -D typescript esbuild
```

컴포넌트에 드래그 앤 드롭, 차트 또는 기타 라이브러리가 필요한 경우 지금 추가하세요. 번들 크기를 줄이기 위해 의존성 세트를 최소화하세요.

## React 컴포넌트 작성하기

엔트리 파일은 컴포넌트를 `root` 엘리먼트에 마운트하고 `window.openai.toolOutput` 또는 지속된 상태에서 초기 데이터를 읽어야 합니다.

[예제 페이지](https://developers.openai.com/apps-sdk/build/examples#pizzaz-list-source)에서 몇 가지 예제 앱을 제공했습니다. 예를 들어, 피자 레스토랑 목록인 "Pizza list" 앱의 경우, 소스 코드에서 볼 수 있듯이 피자 목록 React 컴포넌트는 다음을 수행합니다:

- **호스트 셸에 마운트.** Skybridge HTML 템플릿은 `div#pizzaz-list-root`를 노출합니다. 컴포넌트는 `createRoot(document.getElementById("pizzaz-list-root")).render(<PizzaListApp />)`로 마운트되어 전체 UI가 iframe 내부에 캡슐화됩니다.
- **호스트 전역 변수 구독.** `PizzaListApp` 내부에서 `useOpenAiGlobal("displayMode")` 및 `useOpenAiGlobal("maxHeight")`와 같은 훅이 `window.openai`에서 직접 레이아웃 기본 설정을 읽습니다. 이를 통해 커스텀 postMessage 배관 없이도 인라인과 전체화면 레이아웃 간에 목록이 반응형을 유지합니다.
- **도구 출력에서 렌더링.** 컴포넌트는 `window.openai.toolOutput`을 도구가 반환한 장소의 권위 있는 소스로 취급합니다. `widgetState`는 새로고침 후 UI가 복원되도록 사용자별 상태(즐겨찾기 또는 필터)를 제공합니다.
- **상태 지속 및 호스트 액션 호출.** 사용자가 즐겨찾기를 토글하면 컴포넌트는 React 상태를 업데이트하고 즉시 새로운 즐겨찾기 배열로 `window.openai.setWidgetState`를 호출합니다. 선택적 버튼은 더 많은 공간이나 새 데이터가 필요할 때 `window.openai.requestDisplayMode({ mode: "fullscreen" })` 또는 `window.openai.callTool("refresh_pizza_list", { city })`를 트리거할 수 있습니다.

### Pizzaz 컴포넌트 갤러리 탐색하기

[Apps SDK 예제](https://developers.openai.com/apps-sdk/build/examples)에서 여러 예제 컴포넌트를 제공합니다. 자체 UI를 구성할 때 이를 청사진으로 취급하세요:

**Pizzaz List** - 즐겨찾기 및 행동 유도 버튼이 있는 순위 카드 목록.

![Screenshot of the Pizzaz list component](https://developers.openai.com/images/apps-sdk/pizzaz-list.png)

**Pizzaz Carousel** - 미디어 중심 레이아웃을 시연하는 embla 기반 수평 스크롤러.

![Screenshot of the Pizzaz carousel component](https://developers.openai.com/images/apps-sdk/pizzaz-carousel.png)

**Pizzaz Map** - 전체화면 인스펙터 및 호스트 상태 동기화가 있는 Mapbox 통합.

![Screenshot of the Pizzaz map component](https://developers.openai.com/images/apps-sdk/pizzaz-map.png)

**Pizzaz Album** - 단일 장소에 대한 심층 탐색을 위해 구축된 스택형 갤러리 뷰.

![Screenshot of the Pizzaz album component](https://developers.openai.com/images/apps-sdk/pizzaz-album.png)

**Pizzaz Video** - 오버레이 및 전체화면 컨트롤이 있는 스크립트 플레이어.

각 예제는 자산을 번들링하고, 호스트 API를 연결하고, 실제 대화를 위한 상태를 구조화하는 방법을 보여줍니다. 사용 사례에 가장 가까운 것을 복사하고 도구 응답에 맞게 데이터 레이어를 조정하세요.

### React 헬퍼 훅

많은 Apps SDK 프로젝트는 뷰를 테스트 가능하게 유지하기 위해 `window.openai` 접근을 작은 훅으로 래핑합니다. 이 예제 훅은 호스트 `openai:set_globals` 이벤트를 수신하고 React 컴포넌트가 단일 전역 값을 구독할 수 있도록 합니다:

```typescript
export function useOpenAiGlobal<K extends keyof WebplusGlobals>(
  key: K
): WebplusGlobals[K] {
  return useSyncExternalStore(
    (onChange) => {
      const handleSetGlobal = (event: SetGlobalsEvent) => {
        const value = event.detail.globals[key];
        if (value === undefined) {
          return;
        }

        onChange();
      };

      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal, {
        passive: true,
      });

      return () => {
        window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
      };
    },
    () => window.openai[key]
  );
}
```

이를 `useWidgetState` 훅과 결합하여 호스트에 지속된 위젯 상태를 로컬 React 상태와 정렬된 상태로 유지하세요:

```typescript
export function useWidgetState<T extends WidgetState>(
  defaultState: T | (() => T)
): readonly [T, (state: SetStateAction<T>) => void];
export function useWidgetState<T extends WidgetState>(
  defaultState?: T | (() => T | null) | null
): readonly [T | null, (state: SetStateAction<T | null>) => void];
export function useWidgetState<T extends WidgetState>(
  defaultState?: T | (() => T | null) | null
): readonly [T | null, (state: SetStateAction<T | null>) => void] {
  const widgetStateFromWindow = useWebplusGlobal("widgetState") as T;

  const [widgetState, _setWidgetState] = useState<T | null>(() => {
    if (widgetStateFromWindow != null) {
      return widgetStateFromWindow;
    }

    return typeof defaultState === "function"
      ? defaultState()
      : defaultState ?? null;
  });

  useEffect(() => {
    _setWidgetState(widgetStateFromWindow);
  }, [widgetStateFromWindow]);

  const setWidgetState = useCallback(
    (state: SetStateAction<T | null>) => {
      _setWidgetState((prevState) => {
        const newState = typeof state === "function" ? state(prevState) : state;

        if (newState != null) {
          window.openai.setWidgetState(newState);
        }

        return newState;
      });
    },
    [window.openai.setWidgetState]
  );

  return [widgetState, setWidgetState] as const;
}
```

위의 훅을 사용하면 ChatGPT에 지속성을 위임하면서도 React 컴포넌트에서 최신 도구 출력, 레이아웃 전역 변수 또는 위젯 상태를 직접 읽을 수 있습니다.

## iframe용 번들링하기

React 컴포넌트 작성을 완료하면 서버가 인라인할 수 있는 단일 JavaScript 모듈로 빌드할 수 있습니다:

```json
// package.json
{
  "scripts": {
    "build": "esbuild src/component.tsx --bundle --format=esm --outfile=dist/component.js"
  }
}
```

`npm run build`를 실행하여 `dist/component.js`를 생성합니다. esbuild가 누락된 의존성에 대해 불평하는 경우, `web/` 디렉토리에서 `npm install`을 실행했는지, 그리고 import가 설치된 패키지 이름과 일치하는지 확인하세요 (예: `@react-dnd/html5-backend` vs `react-dnd-html5-backend`).

## 서버 응답에 컴포넌트 임베드하기

MCP 서버 응답에 컴포넌트를 임베드하는 방법은 [서버 설정 문서](https://developers.openai.com/apps-sdk/build/mcp-server)를 참조하세요.

컴포넌트 UI 템플릿은 프로덕션을 위한 권장 경로입니다.

개발 중에는 React 코드가 변경될 때마다 컴포넌트 번들을 다시 빌드하고 서버를 핫 리로드할 수 있습니다.
