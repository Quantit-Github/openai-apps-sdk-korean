---
layout: default
title: 서버 설정하기
lang: ko
---

# 서버 설정하기

MCP 서버를 생성하고 구성합니다.

## 개요

MCP 서버는 모든 Apps SDK 통합의 기반입니다. 서버는 모델이 호출할 수 있는 도구를 노출하고, 인증을 적용하며, ChatGPT 클라이언트가 인라인으로 렌더링하는 구조화된 데이터와 컴포넌트 HTML을 패키징합니다. 이 가이드는 Python과 TypeScript 예제를 통해 핵심 구성 요소를 안내합니다.

## SDK 선택하기

Apps SDK는 MCP 사양을 구현하는 모든 서버를 지원하지만, 공식 SDK가 시작하기에 가장 빠른 방법입니다:

- **Python SDK (공식)** - 공식 FastMCP 모듈을 포함하여 빠른 프로토타이핑에 적합합니다. [modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk)에서 저장소를 확인하세요. 이것은 커뮤니티 "FastMCP" 프로젝트와는 별개입니다.
- **TypeScript SDK (공식)** - 스택이 이미 Node/React인 경우 이상적입니다. `@modelcontextprotocol/sdk`를 사용하세요. 문서: [modelcontextprotocol.io](https://modelcontextprotocol.io/).

SDK와 선호하는 웹 프레임워크(FastAPI 또는 Express가 일반적인 선택입니다)를 설치하세요.

## 도구 정의하기

도구는 ChatGPT와 백엔드 간의 계약입니다. 명확한 머신 이름, 사람이 이해하기 쉬운 제목, 그리고 JSON 스키마를 정의하여 모델이 각 도구를 언제 그리고 어떻게 호출할지 알 수 있도록 합니다. 여기서 인증 힌트, 상태 문자열, 컴포넌트 구성을 포함한 도구별 메타데이터도 연결합니다.

### 컴포넌트 템플릿 지정하기

구조화된 데이터를 반환하는 것 외에도, MCP 서버의 각 도구는 디스크립터에서 HTML UI 템플릿을 참조해야 합니다. 이 HTML 템플릿은 ChatGPT에서 iframe으로 렌더링됩니다.

1. **템플릿 등록** - `mimeType`이 `text/html+skybridge`이고 본문에 컴파일된 JS/CSS 번들을 로드하는 리소스를 노출합니다. 리소스 URI(예: `ui://widget/kanban-board.html`)는 컴포넌트의 표준 ID가 됩니다.
2. **도구를 템플릿에 연결** - 도구 디스크립터 내부에서 `_meta["openai/outputTemplate"]`을 동일한 URI로 설정합니다. 선택적 `_meta` 필드를 사용하면 컴포넌트가 도구 호출을 시작할 수 있는지 또는 사용자 정의 상태 텍스트를 표시할 수 있는지 선언할 수 있습니다.
3. **신중한 버전 관리** - 호환성이 깨지는 컴포넌트 변경 사항을 배포할 때는 새 리소스 URI를 등록하고 도구 메타데이터를 함께 업데이트하세요. ChatGPT는 템플릿을 적극적으로 캐싱하므로 고유한 URI(또는 캐시 무효화된 파일 이름)를 사용하면 오래된 자산이 로드되는 것을 방지할 수 있습니다.

템플릿과 메타데이터가 준비되면, ChatGPT는 각 도구 응답의 `structuredContent` 페이로드를 사용하여 iframe을 하이드레이트합니다.

다음은 예제입니다:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync } from "node:fs";

// Create an MCP server
const server = new McpServer({
  name: "kanban-server",
  version: "1.0.0"
});

// Load locally built assets (produced by your component build)
const KANBAN_JS = readFileSync("web/dist/kanban.js", "utf8");
const KANBAN_CSS = (() => {
  try {
    return readFileSync("web/dist/kanban.css", "utf8");
  } catch {
    return ""; // CSS optional
  }
})();

// UI resource (no inline data assignment; host will inject data)
server.registerResource(
  "kanban-widget",
  "ui://widget/kanban-board.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/kanban-board.html",
        mimeType: "text/html+skybridge",
        text: `
<div id="kanban-root"></div>
${KANBAN_CSS ? `<style>${KANBAN_CSS}</style>` : ""}
<script type="module">${KANBAN_JS}</script>
        `.trim(),
      },
    ],
  })
);

server.registerTool(
  "kanban-board",
  {
    title: "Show Kanban Board",
    _meta: {
      "openai/outputTemplate": "ui://widget/kanban-board.html",
      "openai/toolInvocation/invoking": "Displaying the board",
      "openai/toolInvocation/invoked": "Displayed the board"
    },
    inputSchema: { tasks: z.string() }
  },
  async () => {
    return {
      content: [{ type: "text", text: "Displayed the kanban board!" }],
      structuredContent: {}
    };
  }
);
```

## 도구가 반환하는 데이터 구조화하기

도구 응답의 각 도구 결과는 ChatGPT와 컴포넌트가 페이로드를 소비하는 방식을 형성하는 세 가지 필드를 포함할 수 있습니다:

- **`structuredContent`** - 컴포넌트를 하이드레이트하는 데 사용되는 구조화된 데이터입니다. 예를 들어 플레이리스트의 트랙, 부동산 앱의 주택, 칸반 앱의 작업 등입니다. ChatGPT는 이 객체를 `window.openai.toolOutput`으로 iframe에 주입하므로 UI에 필요한 데이터로 범위를 제한하세요. 모델은 이러한 값을 읽고 설명하거나 요약할 수 있습니다.
- **`content`** - 모델이 그대로 받는 선택적 자유 형식 텍스트(Markdown 또는 일반 문자열)입니다.
- **`_meta`** - 컴포넌트에만 전달되는 임의의 JSON입니다. 드롭다운을 지원하는 전체 위치 집합과 같이 모델의 추론에 영향을 주어서는 안 되는 데이터에 사용하세요. `_meta`는 모델에게 표시되지 않습니다.

컴포넌트는 세 필드를 모두 수신하지만, `structuredContent`와 `content`만 모델에게 표시됩니다. 컴포넌트 아래의 텍스트를 제어하려면 [`widgetDescription`](#add-component-descriptions)을 사용하세요.

Kanban 예제를 계속하면, 보드 데이터를 가져오고 세 가지 필드를 반환하여 모델에 추가 컨텍스트를 노출하지 않고 컴포넌트를 하이드레이트합니다:

```typescript
async function loadKanbanBoard() {
  const tasks = [
    { id: "task-1", title: "Design empty states", assignee: "Ada", status: "todo" },
    { id: "task-2", title: "Wireframe admin panel", assignee: "Grace", status: "in-progress" },
    { id: "task-3", title: "QA onboarding flow", assignee: "Lin", status: "done" }
  ];

  return {
    columns: [
      { id: "todo", title: "To do", tasks: tasks.filter((task) => task.status === "todo") },
      { id: "in-progress", title: "In progress", tasks: tasks.filter((task) => task.status === "in-progress") },
      { id: "done", title: "Done", tasks: tasks.filter((task) => task.status === "done") }
    ],
    tasksById: Object.fromEntries(tasks.map((task) => [task.id, task])),
    lastSyncedAt: new Date().toISOString()
  };
}

server.registerTool(
  "kanban-board",
  {
    title: "Show Kanban Board",
    _meta: {
      "openai/outputTemplate": "ui://widget/kanban-board.html",
      "openai/toolInvocation/invoking": "Displaying the board",
      "openai/toolInvocation/invoked": "Displayed the board"
    },
    inputSchema: { tasks: z.string() }
  },
  async () => {
    const board = await loadKanbanBoard();

    return {
      structuredContent: {
        columns: board.columns.map((column) => ({
          id: column.id,
          title: column.title,
          tasks: column.tasks.slice(0, 5) // keep payload concise for the model
        }))
      },
      content: [{ type: "text", text: "Here's your latest board. Drag cards in the component to update status." }],
      _meta: {
        tasksById: board.tasksById, // full task map for the component only
        lastSyncedAt: board.lastSyncedAt
      }
    };
  }
);
```

## 컴포넌트 빌드하기

이제 MCP 서버 스캐폴드 설정이 완료되었으므로, [사용자 정의 UX 빌드하기 페이지](custom-ux.md)의 지침에 따라 컴포넌트 경험을 구축하세요.

## 로컬에서 실행하기

1. 컴포넌트 번들을 빌드합니다([사용자 정의 UX 빌드하기 페이지](custom-ux.md#bundle-for-the-iframe)의 지침 참조).
2. MCP 서버를 시작합니다.
3. [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)를 `http://localhost:<port>/mcp`로 지정하고, 도구를 나열하고 호출합니다.

Inspector는 응답에 구조화된 콘텐츠와 컴포넌트 메타데이터가 모두 포함되어 있는지 검증하고 컴포넌트를 인라인으로 렌더링합니다.

## 공개 엔드포인트 노출하기

ChatGPT는 HTTPS가 필요합니다. 개발 중에는 [ngrok](https://ngrok.com/)과 같은 터널링 서비스를 사용할 수 있습니다.

별도의 터미널 창에서 다음을 실행하세요:

```bash
ngrok http <port>
# Forwarding: https://<subdomain>.ngrok.app -> http://127.0.0.1:<port>
```

개발자 모드에서 커넥터를 생성할 때 결과 URL을 사용하세요. 프로덕션의 경우, 콜드 스타트 지연 시간이 짧은 HTTPS 엔드포인트에 배포하세요([앱 배포하기](../deploy/deploy-your-app.md) 참조).

## 인증 및 스토리지 추가하기

서버가 익명 트래픽을 처리하면, 사용자 ID 또는 지속성이 필요한지 결정하세요. [인증](auth.md) 및 [스토리지](storage.md) 가이드는 OAuth 2.1 플로우, 토큰 검증 및 사용자 상태 관리를 추가하는 방법을 보여줍니다.

이러한 구성 요소가 준비되면 컴포넌트 번들과 쌍을 이룰 수 있는 기능적인 MCP 서버가 완성됩니다.

## 고급 기능

### 컴포넌트에서 시작하는 도구 액세스 허용하기

컴포넌트에서 시작하는 도구 액세스를 허용하려면, `_meta.openai/widgetAccessible: true`로 도구를 표시해야 합니다:

```json
"_meta": {
  "openai/outputTemplate": "ui://widget/kanban-board.html",
  "openai/widgetAccessible": true
}
```

### 컴포넌트 콘텐츠 보안 정책 정의하기

ChatGPT 내에서 광범위하게 배포되기 전에 위젯은 엄격한 콘텐츠 보안 정책(CSP)을 가져야 합니다. MCP 검토 프로세스의 일부로 스냅샷된 CSP가 검사됩니다.

CSP를 선언하려면, 컴포넌트 리소스에 `csp` 하위 속성이 있는 `openai/widget` 메타 속성을 포함해야 합니다.

```typescript
server.registerResource(
  "html",
  "ui://widget/widget.html",
  {},
  async (req) => ({
    contents: [
      {
        uri: "ui://widget/widget.html",
        mimeType: "text/html",
        text: `
<div id="kitchen-sink-root"></div>
<link rel="stylesheet" href="https://persistent.oaistatic.com/ecosystem-built-assets/kitchen-sink-2d2b.css">
<script type="module" src="https://persistent.oaistatic.com/ecosystem-built-assets/kitchen-sink-2d2b.js"></script>
        `.trim(),
        _meta: {
          "openai/widgetCSP": {
            connect_domains: [],
            resource_domains: ["https://persistent.oaistatic.com"],
          }
        },
      },
    ],
  })
);
```

CSP는 두 개의 URL 배열을 정의해야 합니다: `connect_domains`와 `resource_domains`. 이러한 URL은 궁극적으로 다음 CSP 정의로 매핑됩니다:

```javascript
`script-src 'self' ${resources}`,
`img-src 'self' data: ${resources}`,
`font-src 'self' ${resources}`,
`connect-src 'self' ${connects}`,
```

### 컴포넌트 서브도메인 구성하기

컴포넌트는 구성 가능한 서브도메인도 지원합니다. 공개 API 키(예: Google Maps)가 있고 특정 출처 또는 리퍼러로 액세스를 제한해야 하는 경우, 컴포넌트를 렌더링할 서브도메인을 설정할 수 있습니다.

기본적으로 모든 컴포넌트는 `https://web-sandbox.oaiusercontent.com`에서 렌더링됩니다.

```json
"openai/widgetDomain": "https://chatgpt.com"
```

동적 이중 레벨 서브도메인을 지원할 수 없으므로, `chatgpt.com` 출처를 `chatgpt-com`으로 변환하여 최종 컴포넌트 도메인이 `https://chatgpt-com.web-sandbox.oaiusercontent.com`이 됩니다.

이러한 도메인이 각 파트너에게 고유하다는 것을 약속할 수 있습니다.

전용 서브도메인을 사용하더라도 브라우저 쿠키의 저장 또는 액세스는 여전히 허용되지 않습니다.

컴포넌트 도메인을 구성하면 데스크톱 전체 화면 보기에서 ChatGPT punchout 버튼도 활성화됩니다.

### 도구 호출 시 상태 문자열 구성하기

더 나은 UX를 위해 호출 중 및 호출 후에 짧고 현지화된 상태 문자열을 제공할 수도 있습니다:

```json
"_meta": {
  "openai/outputTemplate": "ui://widget/kanban-board.html",
  "openai/toolInvocation/invoking": "Organizing tasks...",
  "openai/toolInvocation/invoked": "Board refreshed."
}
```

### 현지화된 콘텐츠 제공하기

ChatGPT는 커넥터를 전 세계 사용자에게 노출하며, 클라이언트는 [MCP 초기화 핸드셰이크](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle) 중에 사용자가 선호하는 로케일을 알립니다. 로케일 태그는 [IETF BCP 47](https://www.rfc-editor.org/rfc/bcp/bcp47.txt)을 따릅니다(예: `en-US`, `fr-FR`, `es-419`). 서버가 지원되는 로케일을 반환하지 않으면 ChatGPT는 여전히 커넥터를 렌더링하지만 현지화를 사용할 수 없다는 것을 사용자에게 알립니다. 최신 클라이언트는 `_meta["openai/locale"]`을 설정하며, 이전 빌드는 이전 버전과의 호환성을 위해 여전히 `_meta["webplus/i18n"]`을 전송할 수 있습니다.

`initialize` 중에 클라이언트는 `_meta["openai/locale"]`에 요청된 로케일을 포함합니다:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "roots": { "listChanged": true },
      "sampling": {},
      "elicitation": {}
    },
    "_meta": {
      "openai/locale": "en-GB"
    },
    "clientInfo": {
      "name": "ChatGPT",
      "title": "ChatGPT",
      "version": "1.0.0"
    }
  }
}
```

현지화를 지원하는 서버는 [RFC 4647](https://datatracker.ietf.org/doc/html/rfc4647) 조회 규칙을 사용하여 가장 가까운 일치 항목을 협상하고 제공할 로케일로 응답해야 합니다. 클라이언트가 정확한 UI 메시지를 표시할 수 있도록 해결된 태그와 함께 `_meta["openai/locale"]`을 반환합니다:

```json
"_meta": {
  "openai/outputTemplate": "ui://widget/kanban-board.html",
  "openai/locale": "en"
}
```

ChatGPT의 모든 후속 MCP 요청은 `_meta["openai/locale"]`(또는 이전 빌드에서는 `_meta["webplus/i18n"]`)에 요청된 로케일을 반복합니다. 클라이언트가 사용자가 받은 번역을 알 수 있도록 응답에 동일한 메타데이터 키를 포함하세요. 로케일이 지원되지 않으면 가장 가까운 일치 항목으로 대체하고(예: 요청이 `es-419`일 때 `es`로 응답) 서버 측에서 관리하는 문자열만 번역하세요. 캐시된 구조화된 데이터, 컴포넌트 props 및 프롬프트 템플릿은 모두 해결된 로케일을 존중해야 합니다.

핸들러 내부에서 세션 또는 요청 컨텍스트와 함께 해결된 로케일을 유지하세요. `structuredContent` 또는 컴포넌트 props에서 반환되는 숫자, 날짜, 통화 및 자연어 응답의 형식을 지정할 때 사용하세요. MCP Inspector와 다양한 `_meta` 값을 사용한 테스트는 로케일 전환 로직이 엔드 투 엔드로 실행되는지 확인하는 데 도움이 됩니다.

### 클라이언트 컨텍스트 힌트 검사하기

작업 단계 요청은 서버가 새 프로토콜 필드 없이 응답을 미세 조정할 수 있도록 `_meta.openai/*` 아래에 추가 힌트를 포함할 수 있습니다. ChatGPT는 현재 다음을 전달합니다:

- `_meta["openai/userAgent"]` - 클라이언트를 식별하는 문자열(예: `ChatGPT/1.2025.012`)
- `_meta["openai/userLocation"]` - 국가, 지역, 도시, 시간대 및 대략적인 좌표를 암시하는 대략적인 위치 객체

이러한 값은 권고 사항으로만 처리하고, 권한 부여에 의존하지 마세요. 주로 형식 지정, 지역 콘텐츠 또는 분석을 조정하는 데 유용합니다. 로그할 때는 해결된 로케일과 함께 저장하고 서비스 경계 외부에 공유하기 전에 정리하세요. 클라이언트는 언제든지 두 필드 중 하나를 생략할 수 있습니다.

### 컴포넌트 설명 추가하기

컴포넌트 설명은 클라이언트가 도구의 컴포넌트를 렌더링할 때 모델에 표시됩니다. 이는 모델이 표시되는 내용을 이해하는 데 도움이 되어 모델이 응답에서 중복 콘텐츠를 반환하는 것을 방지합니다. 개발자는 도구 페이로드에서 직접 모델의 응답을 조정하려고 시도하지 않아야 합니다. MCP의 모든 클라이언트가 도구 컴포넌트를 렌더링하는 것은 아니기 때문입니다. 이 메타데이터를 사용하면 rich-UI 클라이언트가 이러한 경험만 조정하면서 다른 곳에서 이전 버전과의 호환성을 유지할 수 있습니다.

이 필드를 사용하려면, MCP 서버 내부의 리소스 템플릿에 `openai/widgetDescription`을 설정하세요. 아래 예제를 참조하세요:

**참고:** 설명이 적용되려면 개발 모드에서 MCP의 액션을 새로 고쳐야 합니다. 이 방법으로만 다시 로드할 수 있습니다.

```typescript
server.registerResource("html", "ui://widget/widget.html", {}, async () => ({
  contents: [
    {
      uri: "ui://widget/widget.html",
      mimeType: "text/html",
      text: componentHtml,
      _meta: {
        "openai/widgetDescription": "Renders an interactive UI showcasing the zoo animals returned by get_zoo_animals.",
      },
    },
  ],
}));

server.registerTool(
  "get_zoo_animals",
  {
    title: "get_zoo_animals",
    description: "Lists zoo animals and facts about them",
    inputSchema: { count: z.number().int().min(1).max(20).optional() },
    annotations: {
      readOnlyHint: true,
    },
    _meta: {
      "openai/outputTemplate": "ui://widget/widget.html",
    },
  },
  async ({ count = 10 }, _extra) => {
    const animals = generateZooAnimals(count);
    return {
      content: [],
      structuredContent: { animals },
    };
  }
);
```

### 컴포넌트 테두리 옵트인하기

"카드" 레이아웃에 더 적합한 위젯은 적절한 경우 ChatGPT가 렌더링하는 테두리를 선택할 수 있습니다.

이 필드를 사용하려면, MCP 서버 내부의 리소스 템플릿에 `"openai/widgetPrefersBorder": true`를 설정하세요.
