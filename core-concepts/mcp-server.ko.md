---
layout: default
title: MCP Server
lang: ko
---

# MCP Server

Apps SDK에서 Model Context Protocol이 어떻게 작동하는지 이해합니다.

## What is MCP?

[Model Context Protocol](https://modelcontextprotocol.io/) (MCP)은 대규모 언어 모델 클라이언트를 외부 도구 및 리소스에 연결하기 위한 개방형 사양입니다. MCP 서버는 모델이 대화 중에 호출할 수 있는 **도구**를 노출하고, 지정된 매개변수에 따라 결과를 반환합니다.
도구 결과와 함께 다른 리소스(메타데이터)도 반환될 수 있으며, 여기에는 Apps SDK에서 인터페이스를 렌더링하는 데 사용할 수 있는 인라인 html이 포함됩니다.

Apps SDK에서 MCP는 서버, 모델 및 UI를 동기화 상태로 유지하는 백본입니다. 와이어 형식, 인증 및 메타데이터를 표준화함으로써 ChatGPT가 내장 도구를 추론하는 것과 동일한 방식으로 앱을 추론할 수 있게 합니다.

## Protocol building blocks

Apps SDK를 위한 최소 MCP 서버는 세 가지 기능을 구현합니다:

- **List tools** - 서버는 JSON Schema 입력 및 출력 계약과 선택적 주석을 포함하여 지원하는 도구를 광고합니다.
- **Call tools** - 모델이 사용할 도구를 선택하면, 사용자 의도에 해당하는 인수와 함께 `call_tool` 요청을 보냅니다. 서버는 작업을 실행하고 모델이 파싱할 수 있는 구조화된 콘텐츠를 반환합니다.
- **Return components** - 도구가 반환하는 구조화된 콘텐츠 외에도, 각 도구는 (메타데이터에서) ChatGPT 클라이언트에서 렌더링할 인터페이스를 나타내는 [embedded resource](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#embedded-resources)를 선택적으로 가리킬 수 있습니다.

프로토콜은 전송 방식에 구애받지 않으며, Server-Sent Events 또는 Streamable HTTP를 통해 서버를 호스팅할 수 있습니다. Apps SDK는 두 옵션을 모두 지원하지만 Streamable HTTP를 권장합니다.

## Why Apps SDK standardises on MCP

MCP를 통해 작업하면 즉시 여러 이점을 얻을 수 있습니다:

- **Discovery integration** - 모델은 퍼스트파티 커넥터와 동일한 방식으로 도구 메타데이터와 표면 설명을 사용하여 자연어 검색 및 런처 순위를 지원합니다. 자세한 내용은 [Discovery](user-interaction.md#discovery)를 참조하세요.
- **Conversation awareness** - 구조화된 콘텐츠와 컴포넌트 상태가 대화를 통해 흐릅니다. 모델은 JSON 결과를 검사하고, 후속 턴에서 ID를 참조하거나, 나중에 컴포넌트를 다시 렌더링할 수 있습니다.
- **Multiclient support** - MCP는 자체 설명적이므로 커스텀 클라이언트 코드 없이도 ChatGPT 웹 및 모바일에서 커넥터가 작동합니다.
- **Extensible auth** - 사양에는 보호된 리소스 메타데이터, OAuth 2.1 플로우 및 동적 클라이언트 등록이 포함되어 있어 독점 핸드셰이크를 발명하지 않고도 액세스를 제어할 수 있습니다.

## Next steps

MCP가 처음이라면 다음 리소스로 시작하는 것이 좋습니다:

- [Model Context Protocol specification](https://modelcontextprotocol.io/specification)
- Official SDKs: [Python SDK (official; includes FastMCP module)](https://github.com/modelcontextprotocol/python-sdk) and [TypeScript](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) for local debugging

MCP 프리미티브에 익숙해지면 구현 세부 사항을 위해 [Set up your server](../build/mcp-server.md) 가이드로 이동할 수 있습니다.
