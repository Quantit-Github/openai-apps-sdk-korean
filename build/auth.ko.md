---
layout: default
title: 인증
lang: ko
---

# 인증

Apps SDK 앱을 위한 인증 패턴입니다.

## 사용자 인증

많은 Apps SDK 앱은 읽기 전용 익명 모드로 동작할 수 있지만, 고객별 데이터를 노출하거나 쓰기 작업을 하는 경우 사용자 인증이 필요합니다.

기존 백엔드와 연결하거나 사용자 간 데이터를 공유해야 할 때 자체 인증 서버와 통합할 수 있습니다.

## OAuth 2.1을 사용한 커스텀 인증

외부 시스템(CRM 레코드, 독점 API, 공유 데이터셋)과 통신해야 할 때 [MCP 인증 사양](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization)을 준수하는 완전한 OAuth 2.1 플로우를 통합할 수 있습니다.

### 구성 요소

- **리소스 서버** — 도구를 노출하고 각 요청에서 액세스 토큰을 검증하는 MCP 서버입니다.
- **인증 서버** — 토큰을 발급하고 검색 메타데이터를 게시하는 신원 공급자(Auth0, Okta, Cognito 또는 커스텀 구현)입니다.
- **클라이언트** — 사용자를 대신하는 ChatGPT입니다. 동적 클라이언트 등록과 PKCE를 지원합니다.

### 필수 엔드포인트

인증 서버는 다음을 제공해야 합니다:

- `/.well-known/oauth-protected-resource` — MCP 엔드포인트를 위한 인증 서버와 필수 스코프를 나열합니다.
- `/.well-known/openid-configuration` — 검색 문서. 다음을 포함해야 합니다:
  - `authorization_endpoint`
  - `token_endpoint` (주로 `/oauth/token`)
  - `jwks_uri`
  - `registration_endpoint`
- `token_endpoint` — 코드+PKCE 교환을 받아들이고 액세스 토큰을 반환합니다.
- `registration_endpoint` — 동적 클라이언트 등록 요청을 받아들이고 `client_id`를 반환합니다.

### 실제 플로우

- ChatGPT는 MCP 서버에서 보호된 리소스 메타데이터를 조회합니다. 공식 Python SDK의 FastMCP 모듈에서 `AuthSettings`로 이를 구성할 수 있습니다.
- ChatGPT는 `registration_endpoint`를 사용하여 인증 서버에 자신을 등록하고 `client_id`를 얻습니다.
- 사용자가 처음 도구를 호출할 때 ChatGPT 클라이언트는 OAuth 인증 코드 + PKCE 플로우를 시작합니다. 사용자는 인증하고 요청된 스코프에 동의합니다.
- ChatGPT는 인증 코드를 액세스 토큰으로 교환하고 후속 MCP 요청에 이를 첨부합니다(`Authorization: Bearer <token>`).
- 서버는 도구를 실행하기 전에 각 요청마다 토큰을 검증합니다(발급자, 대상, 만료, 스코프).

### 검증 구현

공식 Python SDK의 FastMCP 모듈은 토큰 검증을 위한 헬퍼를 제공합니다. 간단한 예시:

파일: `server.py`

```python
from mcp.server.fastmcp import FastMCP
from mcp.server.auth.settings import AuthSettings
from mcp.server.auth.provider import TokenVerifier, AccessToken

class MyVerifier(TokenVerifier):
    async def verify_token(self, token: str) -> AccessToken | None:
        payload = validate_jwt(token, jwks_url)
        if "user" not in payload.get("permissions", []):
            return None
        return AccessToken(
            token=token,
            client_id=payload["azp"],
            subject=payload["sub"],
            scopes=payload.get("permissions", []),
            claims=payload,
        )

mcp = FastMCP(
    name="kanban-mcp",
    stateless_http=True,
    token_verifier=MyVerifier(),
    auth=AuthSettings(
        issuer_url="https://your-tenant.us.auth0.com",
        resource_server_url="https://example.com/mcp",
        required_scopes=["user"],
    ),
)
```

검증이 실패하면 `401 Unauthorized`와 보호된 리소스 메타데이터를 가리키는 `WWW-Authenticate` 헤더로 응답합니다. 이는 클라이언트에게 OAuth 플로우를 다시 실행하도록 알립니다.

### 인증 공급자 선택

[Auth0](https://auth0.com/)는 널리 사용되는 옵션으로 기본적으로 동적 클라이언트 등록, RBAC, 토큰 검사를 지원합니다. 구성 방법:

- Auth0 대시보드에서 API를 생성하고 식별자를 기록합니다(토큰 대상으로 사용됨).
- RBAC를 활성화하고 권한(예: `user`)을 추가하여 액세스 토큰에 포함되도록 합니다.
- OIDC 동적 애플리케이션 등록을 켜서 ChatGPT가 커넥터마다 클라이언트를 생성할 수 있도록 합니다.
- 동적으로 생성된 클라이언트에 대해 최소 하나의 로그인 연결을 활성화하여 사용자가 로그인할 수 있도록 합니다.

Okta, Azure AD, 커스텀 OAuth 2.1 서버도 필수 메타데이터를 노출하는 한 동일한 패턴을 따를 수 있습니다.

## 테스트 및 배포

- **로컬 테스트** — 빠르게 반복할 수 있도록 단기 유효 토큰을 발급하는 개발 테넌트로 시작합니다.
- **도그푸딩** — 인증이 작동하면 광범위하게 배포하기 전에 신뢰할 수 있는 테스터에게만 접근을 제한합니다. 특정 도구나 전체 커넥터에 대한 연결을 요구할 수 있습니다.
- **순환** — 토큰 취소, 갱신, 스코프 변경을 계획합니다. 서버는 누락되거나 오래된 토큰을 인증되지 않은 것으로 처리하고 유용한 오류 메시지를 반환해야 합니다.

인증이 갖춰지면 ChatGPT 사용자에게 사용자별 데이터와 쓰기 작업을 안심하고 노출할 수 있습니다.

## securitySchemes를 사용한 도구별 인증

서로 다른 도구는 종종 서로 다른 접근 요구 사항을 가집니다. 인증 없이 도구를 나열하면 검색과 개발자 편의성이 향상되지만, 필요한 도구에 대해 호출 시점에 인증을 적용해야 합니다. 메타데이터에 요구 사항을 선언하면 클라이언트가 사용자를 안내하는 데 도움이 되지만, 서버는 여전히 적용의 진실의 원천으로 남습니다.

권장 사항:

- 서버를 검색 가능하게 유지(나열에 인증 불필요)
- 도구 호출별로 인증 적용

스코프와 의미론:

- 지원되는 스킴 유형(초기):
  - "noauth" — 익명으로 호출 가능
  - "oauth2" — OAuth 2.0 필요; 선택적 스코프
- 누락된 필드: 서버 기본 정책 상속
- "noauth"와 "oauth2" 모두 있는 경우: 익명으로 작동하지만 인증하면 더 많은 동작 가능
- 서버는 클라이언트 힌트와 관계없이 적용해야 함

각 도구의 일급 `securitySchemes` 필드에 인증 요구 사항을 선언해야 합니다. 클라이언트는 이를 사용하여 사용자를 안내하지만, 서버는 여전히 모든 호출마다 토큰/스코프를 검증해야 합니다.

예시(공개 + 선택적 인증) — TypeScript SDK

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

declare const server: McpServer;

server.registerTool(
  "search",
  {
    title: "Public Search",
    description: "Search public documents.",
    inputSchema: {
      type: "object",
      properties: { q: { type: "string" } },
      required: ["q"],
    },
    securitySchemes: [
      { type: "noauth" },
      { type: "oauth2", scopes: ["search.read"] },
    ],
  },
  async ({ input }) => {
    return {
      content: [{ type: "text", text: `Results for ${input.q}` }],
      structuredContent: {},
    };
  }
);
```

예시(인증 필요) — TypeScript SDK

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

declare const server: McpServer;

server.registerTool(
  "create_doc",
  {
    title: "Create Document",
    description: "Make a new doc in your account.",
    inputSchema: {
      type: "object",
      properties: { title: { type: "string" } },
      required: ["title"],
    },
    securitySchemes: [{ type: "oauth2", scopes: ["docs.write"] }],
  },
  async ({ input }) => {
    return {
      content: [{ type: "text", text: `Created doc: ${input.title}` }],
      structuredContent: {},
    };
  }
);
```
