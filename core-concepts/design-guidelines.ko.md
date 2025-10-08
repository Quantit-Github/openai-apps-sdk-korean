---
layout: default
title: App Design Guidelines
lang: ko
---

# App Design Guidelines

Apps SDK를 기반으로 구축하는 개발자를 위한 디자인 가이드라인입니다.

## Overview

앱은 ChatGPT 내부에 존재하는 개발자가 구축한 경험입니다. 대화 흐름을 방해하지 않고 사용자가 할 수 있는 일을 확장하며, 가벼운 카드, 캐러셀, 전체 화면 뷰 및 기타 디스플레이 모드를 통해 나타나 ChatGPT의 명확성, 신뢰 및 음성을 유지하면서 인터페이스에 원활하게 통합됩니다.

![Example apps in the ChatGPT mobile interface](https://developers.openai.com/images/apps-sdk/overview.png)

이 가이드라인은 ChatGPT 내부에서 고품질의 일관되고 사용자 친화적인 경험을 구축하는 데 필요한 모든 것을 제공합니다.

## Best practices

앱은 대화 흐름을 방해하지 않고 ChatGPT 내에서 직접 의미 있는 작업을 수행하는 데 도움이 될 때 가장 가치가 있습니다. 목표는 실제 가치를 추가하는 방식으로 ChatGPT를 확장하면서 일관되고 유용하며 신뢰할 수 있는 느낌의 경험을 디자인하는 것입니다. 좋은 사용 사례에는 승차 예약, 음식 주문, 가용성 확인 또는 배송 추적이 포함됩니다. 이는 대화형이고 시간 제한이 있으며 명확한 행동 유도로 시각적으로 요약하기 쉬운 작업입니다.

좋지 않은 사용 사례에는 웹사이트의 긴 형식 콘텐츠 붙여넣기, 복잡한 다단계 워크플로 요구 또는 광고나 관련 없는 메시지에 공간 사용이 포함됩니다.

### Principles

- **Conversational**: 경험은 ChatGPT의 자연스러운 확장처럼 느껴져야 하며, 대화 흐름과 UI에 원활하게 맞아야 합니다.
- **Intelligent**: 도구는 대화 컨텍스트를 인식하고 사용자 의도를 지원하고 예측해야 합니다. 응답과 UI는 개별적으로 관련성 있게 느껴져야 합니다.
- **Simple**: 각 상호작용은 단일하고 명확한 작업이나 결과에 초점을 맞춰야 합니다. 정보와 UI는 컨텍스트를 지원하기 위한 절대 최소한으로 축소되어야 합니다.
- **Responsive**: 도구는 빠르고 가벼워야 하며 대화를 압도하지 않고 향상시켜야 합니다.
- **Accessible**: 디자인은 보조 기술에 의존하는 사용자를 포함하여 광범위한 사용자를 지원해야 합니다.

### Boundaries

ChatGPT는 음성, 크롬, 스타일, 내비게이션 및 작성기와 같은 시스템 수준 요소를 제어합니다. 개발자는 시스템 프레임워크 내에서 콘텐츠, 브랜드 존재감 및 작업을 커스터마이징하여 가치를 제공합니다.

이러한 균형은 모든 앱이 ChatGPT에 네이티브한 느낌을 유지하면서도 고유한 브랜드 가치를 표현할 수 있도록 보장합니다.

### Good use cases

좋은 앱은 이러한 질문의 대부분에 "예"라고 대답해야 합니다:

- **이 작업이 대화에 자연스럽게 맞는가?** (예: 예약, 주문, 일정 잡기, 빠른 조회)
- **시간 제한이 있거나 액션 지향적인가?** (명확한 시작과 끝이 있는 짧거나 중간 길이의 작업)
- **정보가 그 순간에 가치가 있는가?** (사용자가 즉시 행동할 수 있거나 더 깊이 들어가기 전에 간결한 미리보기를 얻을 수 있음)
- **시각적으로 간단하게 요약할 수 있는가?** (하나의 카드, 몇 가지 주요 세부 사항, 명확한 CTA)
- **ChatGPT를 추가적이거나 차별화된 방식으로 확장하는가?**

### Poor use cases

다음과 같은 도구 디자인을 피하세요:

- 웹사이트나 앱에 더 적합한 **긴 형식 또는 정적 콘텐츠** 표시.
- 인라인 또는 전체 화면 디스플레이 모드를 초과하는 **복잡한 다단계 워크플로** 요구.
- **광고, 업셀 또는 관련 없는 메시지**에 공간 사용.
- 다른 사람이 볼 수 있는 카드에서 직접 **민감하거나 개인적인 정보** 표시.
- **ChatGPT의 시스템 기능 복제** (예: 입력 작성기 재생성).

이러한 모범 사례를 따르면 도구가 볼트온 경험이 아닌 ChatGPT의 자연스러운 확장처럼 느껴질 것입니다.

## Display modes

디스플레이 모드는 개발자가 ChatGPT 내부에서 경험을 만드는 데 사용하는 표면입니다. 파트너가 대화에 네이티브한 느낌의 콘텐츠와 작업을 표시할 수 있게 해줍니다. 각 모드는 빠른 확인부터 몰입형 워크플로까지 특정 유형의 상호작용을 위해 설계되었습니다.

이를 일관되게 사용하면 경험이 간단하고 예측 가능하게 유지됩니다.

### Inline

인라인 디스플레이 모드는 대화 흐름에 직접 나타납니다. 인라인 표면은 현재 항상 생성된 모델 응답 전에 나타납니다. 모든 앱은 처음에 인라인으로 나타납니다.

![Examples of inline cards and carousels in ChatGPT](https://developers.openai.com/images/apps-sdk/inline_display_mode.png)

**Layout**

- **Icon & tool call**: 앱 이름과 아이콘이 있는 레이블.
- **Inline display**: 모델 응답 위에 앱 콘텐츠가 포함된 가벼운 디스플레이.
- **Follow-up**: 위젯 이후에 표시되는 짧은 모델 생성 응답으로 편집, 다음 단계 또는 관련 작업을 제안합니다. 카드와 중복되는 콘텐츠를 피하세요.

#### Inline card

대화에 직접 포함된 가볍고 단일 목적의 위젯입니다. 빠른 확인, 간단한 작업 또는 시각적 보조 장치를 제공합니다.

![Examples of inline cards](https://developers.openai.com/images/apps-sdk/inline_cards.png)

**When to use**

- 단일 작업 또는 결정 (예: 예약 확인).
- 소량의 구조화된 데이터 (예: 지도, 주문 요약 또는 빠른 상태).
- 완전히 자체 포함된 위젯 또는 도구 (예: 오디오 플레이어 또는 점수 카드).

**Layout**

![Diagram of inline cards](https://developers.openai.com/images/apps-sdk/inline_card_layout.png)

- **Title**: 카드가 문서 기반이거나 재생 목록의 노래와 같은 상위 요소가 있는 항목을 포함하는 경우 제목을 포함합니다.
- **Expand**: 카드에 지도나 대화형 다이어그램과 같은 리치 미디어 또는 상호작용이 포함된 경우 전체 화면 디스플레이 모드를 열도록 사용합니다.
- **Show more**: 목록에 여러 결과가 표시되는 경우 추가 항목을 공개하는 데 사용합니다.
- **Edit controls**: 대화를 압도하지 않고 ChatGPT 응답에 대한 인라인 지원을 제공합니다.
- **Primary actions**: 카드 하단에 배치된 두 개의 작업으로 제한합니다. 작업은 대화 턴 또는 도구 호출을 수행해야 합니다.

**Interaction**

![Diagram of interaction patterns for inline cards](https://developers.openai.com/images/apps-sdk/inline_card_interaction.png)

카드는 간단한 직접 상호작용을 지원합니다.

- **States**: 편집한 내용이 유지됩니다.
- **Simple direct edits**: 적절한 경우 인라인 편집 가능한 텍스트를 통해 사용자가 모델을 프롬프트할 필요 없이 빠른 편집을 할 수 있습니다.
- **Dynamic layout**: 카드 레이아웃은 모바일 뷰포트의 높이까지 콘텐츠에 맞게 높이를 확장할 수 있습니다.

**Rules of thumb**

- **카드당 기본 작업 제한**: 하나의 기본 CTA와 하나의 선택적 보조 CTA로 최대 두 개의 작업을 지원합니다.
- **카드 내에서 깊은 탐색 또는 여러 뷰 금지.** 카드에는 여러 드릴인, 탭 또는 더 깊은 탐색이 포함되어서는 안 됩니다. 이를 별도의 카드나 도구 작업으로 분할하는 것을 고려하세요.
- **중첩된 스크롤 금지**. 카드는 콘텐츠에 자동으로 맞춰지고 내부 스크롤을 방지해야 합니다.
- **중복 입력 금지**. 카드에서 ChatGPT 기능을 복제하지 마세요.

![Examples of patterns to avoid in inline cards](https://developers.openai.com/images/apps-sdk/inline_card_rules.png)

#### Inline carousel

나란히 표시된 카드 세트로, 사용자가 여러 옵션을 빠르게 스캔하고 선택할 수 있게 해줍니다.

![Example of inline carousel](https://developers.openai.com/images/apps-sdk/inline_carousel.png)

**When to use**

- 유사한 항목의 작은 목록 제시 (예: 레스토랑, 재생 목록, 이벤트).
- 항목에 단순한 행보다 더 많은 시각적 콘텐츠와 메타데이터가 있습니다.

**Layout**

![Diagram of inline carousel](https://developers.openai.com/images/apps-sdk/inline_carousel_layout.png)

- **Image**: 항목에는 항상 이미지 또는 비주얼이 포함되어야 합니다.
- **Title**: 캐러셀 항목에는 일반적으로 콘텐츠를 설명하는 제목이 포함되어야 합니다.
- **Metadata**: 메타데이터를 사용하여 응답 컨텍스트에서 항목에 대한 가장 중요하고 관련성 있는 정보를 표시합니다. 두 줄 이상의 텍스트를 표시하지 마세요.
- **Badge**: 적절한 경우 배지를 사용하여 지원 컨텍스트를 표시합니다.
- **Actions**: 가능한 경우 항목당 단일하고 명확한 CTA를 제공합니다.

**Rules of thumb**

- 스캔 가능성을 위해 **캐러셀당 3-8개 항목**을 유지합니다.
- 메타데이터를 가장 관련성 있는 세부 사항으로 줄이고 최대 세 줄로 제한합니다.
- 각 카드에는 단일 선택적 CTA가 있을 수 있습니다 (예: "Book" 또는 "Play").
- 카드 전체에서 일관된 시각적 계층을 사용합니다.

### Fullscreen

인라인 카드를 넘어 확장되는 몰입형 경험으로, 사용자에게 다단계 워크플로나 더 깊은 탐색을 위한 공간을 제공합니다. ChatGPT 작성기는 오버레이 상태로 유지되어 사용자가 전체 화면 뷰의 컨텍스트에서 자연스러운 대화를 통해 "앱과 대화"를 계속할 수 있게 합니다.

![Example of fullscreen](https://developers.openai.com/images/apps-sdk/fullscreen.png)

**When to use**

- 단일 카드로 축소할 수 없는 리치 작업 (예: 핀이 있는 탐색 가능한 지도, 리치 편집 캔버스 또는 대화형 다이어그램).
- 자세한 콘텐츠 탐색 (예: 부동산 목록, 메뉴).

**Layout**

![Diagram of fullscreen](https://developers.openai.com/images/apps-sdk/fullscreen_layout.png)

- **System close**: 시트 또는 뷰를 닫습니다.
- **Fullscreen view**: 콘텐츠 영역.
- **Composer**: ChatGPT의 네이티브 작성기로, 사용자가 전체 화면 뷰의 컨텍스트에서 후속 조치를 취할 수 있게 합니다.

**Interaction**

![Interaction patterns for fullscreen](https://developers.openai.com/images/apps-sdk/fullscreen_interaction_a.png)

- **Chat sheet**: 전체 화면 표면과 함께 대화 컨텍스트를 유지합니다.
- **Thinking**: 작성기 입력이 "반짝거려" 응답이 스트리밍 중임을 표시합니다.
- **Response**: 모델이 응답을 완료하면 작성기 위에 임시로 잘린 스니펫이 표시됩니다. 탭하면 채팅 시트가 열립니다.

**Rules of thumb**

- **시스템 작성기와 함께 작동하도록 UX를 디자인하세요**. 작성기는 전체 화면에서 항상 존재하므로 경험이 도구 호출을 트리거할 수 있고 사용자에게 자연스럽게 느껴지는 대화형 프롬프트를 지원하는지 확인하세요.
- **전체 화면을 사용하여 참여를 심화**시키되, 네이티브 앱을 통째로 복제하지 마세요.

### Picture-in-picture (PiP)

게임이나 비디오와 같은 진행 중이거나 라이브 세션에 최적화된 ChatGPT 내부의 지속적인 플로팅 창입니다. PiP는 대화가 계속되는 동안 표시되고 사용자 프롬프트에 대한 응답으로 동적으로 업데이트될 수 있습니다.

![Example of picture-in-picture](https://developers.openai.com/images/apps-sdk/pip.png)

**When to use**

- 게임, 라이브 협업, 퀴즈 또는 학습 세션과 같은 **대화와 병렬로 실행되는 활동**.
- 예를 들어 게임 라운드를 계속하거나 사용자 요청에 따라 라이브 데이터를 새로 고침하는 등 **PiP 위젯이 채팅 입력에 반응할 수 있는 상황**.

**Interaction**

![Interaction patterns for picture-in-picture](https://developers.openai.com/images/apps-sdk/fullscreen_interaction.png)

- **Activated:** 스크롤 시 PiP 창이 뷰포트 상단에 고정된 상태로 유지됩니다
- **Pinned:** 사용자가 닫거나 세션이 종료될 때까지 PiP가 고정된 상태로 유지됩니다.
- **Session ends:** PiP가 인라인 위치로 돌아가고 스크롤되어 사라집니다.

**Rules of thumb**

- 사용자가 시스템 작성기를 통해 상호작용할 때 **PiP 상태가 업데이트되거나 응답할 수 있는지 확인**하세요.
- 세션이 종료되면 **PiP를 자동으로 닫습니다**.
- 인라인이나 전체 화면에 더 적합한 **컨트롤이나 정적 콘텐츠로 PiP를 과부하하지 마세요**.

## Visual design guidelines

일관된 모양과 느낌은 파트너가 구축한 도구가 ChatGPT의 자연스러운 부분처럼 느껴지게 만드는 것입니다. 시각적 가이드라인은 파트너 경험이 친숙하고 접근 가능하며 신뢰할 수 있게 유지되도록 보장하면서도 적절한 위치에서 브랜드 표현을 위한 공간을 남겨둡니다.

이러한 원칙은 시스템 명확성을 유지하면서 파트너가 서비스를 차별화할 수 있는 공간을 제공하는 방식으로 색상, 타입, 간격 및 이미지를 사용하는 방법을 설명합니다.

### Why this matters

시각적 및 UX 일관성은 ChatGPT의 전반적인 사용자 경험을 보호합니다. 이러한 가이드라인을 따르면 파트너는 도구가 사용자에게 친숙하게 느껴지고, 시스템에 대한 신뢰를 유지하며, 주의를 분산시키지 않고 가치를 제공할 수 있도록 보장합니다.

### Color

시스템 정의 팔레트는 작업과 응답이 항상 ChatGPT와 일관성 있게 느껴지도록 보장합니다. 파트너는 액센트, 아이콘 또는 인라인 이미지를 통해 브랜딩을 추가할 수 있지만 시스템 색상을 재정의해서는 안 됩니다.

![Color palette](https://developers.openai.com/images/apps-sdk/color.png)

**Rules of thumb**

- 텍스트, 아이콘 및 구분선과 같은 공간 요소에 시스템 색상을 사용합니다.
- 로고나 아이콘과 같은 파트너 브랜드 액센트는 배경이나 텍스트 색상을 재정의해서는 안 됩니다.
- ChatGPT의 미니멀한 모양을 깨는 커스텀 그라디언트나 패턴을 피합니다.
- 앱 디스플레이 모드 내부의 기본 버튼에 브랜드 액센트 색상을 사용합니다.

![Example color usage](https://developers.openai.com/images/apps-sdk/color_usage_1.png)

*액센트와 배지에 브랜드 색상을 사용합니다. 텍스트 색상이나 다른 핵심 컴포넌트 스타일을 변경하지 마세요.*

![Example color usage](https://developers.openai.com/images/apps-sdk/color_usage_2.png)

*텍스트 영역의 배경에 색상을 적용하지 마세요.*

### Typography

ChatGPT는 플랫폼 네이티브 시스템 글꼴(iOS의 SF Pro, Android의 Roboto)을 사용하여 기기 전체에서 가독성과 접근성을 보장합니다.

![Typography](https://developers.openai.com/images/apps-sdk/typography.png)

**Rules of thumb**

- 항상 시스템 글꼴 스택을 상속하고 제목, 본문 텍스트 및 캡션에 대한 시스템 크기 조정 규칙을 준수합니다.
- 굵게, 기울임꼴 또는 강조 표시와 같은 파트너 스타일링은 구조적 UI가 아닌 콘텐츠 영역 내에서만 사용합니다.
- 가능한 한 글꼴 크기의 변형을 제한하고 body 및 body-small 크기를 선호합니다.

![Example typography](https://developers.openai.com/images/apps-sdk/typography_usage.png)

*전체 화면 모드에서도 커스텀 글꼴을 사용하지 마세요. 가능한 경우 시스템 글꼴 변수를 사용하세요.*

### Spacing & layout

일관된 여백, 패딩 및 정렬은 파트너 콘텐츠를 대화 내에서 스캔 가능하고 예측 가능하게 유지합니다.

![Spacing & layout](https://developers.openai.com/images/apps-sdk/spacing.png)

**Rules of thumb**

- 카드, 컬렉션 및 인스펙터 패널에 시스템 그리드 간격을 사용합니다.
- 패딩을 일관되게 유지하고 텍스트를 꽉 채우거나 가장자리에서 가장자리로 배치하지 마세요.
- 가능한 경우 시스템 지정 모서리 라운드를 준수하여 모양을 일관되게 유지합니다.
- 헤드라인, 지원 텍스트 및 CTA가 명확한 순서로 시각적 계층을 유지합니다.

### Icons & imagery

시스템 아이콘은 시각적 명확성을 제공하고, 파트너 로고와 이미지는 사용자가 브랜드 컨텍스트를 인식하는 데 도움이 됩니다.

![Icons](https://developers.openai.com/images/apps-sdk/icons.png)

**Rules of thumb**

- 시스템 아이콘 또는 ChatGPT의 시각적 세계에 맞는 커스텀 아이콘(단색 및 아웃라인)을 사용합니다.
- 응답의 일부로 로고를 포함하지 마세요. ChatGPT는 위젯이 렌더링되기 전에 항상 로고와 앱 이름을 추가합니다.
- 모든 이미지는 왜곡을 피하기 위해 강제 종횡비를 따라야 합니다.

![Icons & imagery](https://developers.openai.com/images/apps-sdk/iconography.png)

### Accessibility

모든 파트너 경험은 가능한 한 광범위한 청중이 사용할 수 있어야 합니다. 접근성은 요구 사항이지 옵션이 아닙니다.

**Rules of thumb**

- 텍스트와 배경은 최소 대비 비율(WCAG AA)을 유지해야 합니다.
- 모든 이미지에 대체 텍스트를 제공합니다.
- 레이아웃을 깨지 않고 텍스트 크기 조정을 지원합니다.

## Tone & proactivity

톤과 프로액티비티는 파트너 도구가 ChatGPT 내부에 표시되는 방식에 중요합니다. 파트너는 가치 있는 콘텐츠를 제공하지만 전반적인 경험은 항상 ChatGPT처럼 느껴져야 합니다: 명확하고 도움이 되며 신뢰할 수 있습니다. 이러한 가이드라인은 도구가 커뮤니케이션하는 방법과 사용자에게 다시 표시되어야 하는 시기를 정의합니다.

### Tone ownership

- ChatGPT는 전반적인 **음성**을 설정합니다.
- 파트너는 해당 프레임워크 내에서 **콘텐츠**를 제공합니다.
- 결과는 원활해야 합니다: 파트너 콘텐츠가 ChatGPT의 자연스럽고 대화적인 톤을 깨지 않고 컨텍스트와 작업을 추가합니다.

### Content guidelines

- 콘텐츠를 **간결하고 스캔 가능하게** 유지합니다.
- 항상 **컨텍스트 중심**: 콘텐츠는 사용자가 요청한 것에 응답해야 합니다.
- **스팸, 전문 용어 또는 홍보 언어**를 피합니다.
- 브랜드 개성보다 **도움과 명확성**에 초점을 맞춥니다.

### Proactivity rules

프로액티비티는 적절한 시간에 적절한 정보를 표시하여 사용자를 돕습니다. 항상 관련성 있고 결코 방해가 되지 않아야 합니다.

- **허용됨**: 사용자 의도와 관련된 컨텍스트 넛지 또는 리마인더.
  - 예: "주문이 픽업 준비되었습니다" 또는 "차량이 도착하고 있습니다."
- **허용되지 않음**: 원하지 않는 프로모션, 업셀 또는 명확한 컨텍스트 없이 재참여를 시도하는 반복적인 시도.
  - 예: "최신 거래를 확인하세요" 또는 "오랫동안 사용하지 않으셨나요? 다시 오세요."

### Transparency

- 도구가 다시 표시되는 **이유와 시기**를 항상 표시합니다.
- 사용자가 넛지의 목적을 이해할 수 있도록 충분한 컨텍스트를 제공합니다.
- 프로액티비티는 중단이 아닌 대화의 자연스러운 연속처럼 느껴져야 합니다.

### Why this matters

파트너 도구가 말하고 재참여하는 방식은 사용자 신뢰를 정의합니다. 일관된 톤과 신중한 프로액티비티 전략은 사용자가 통제력을 유지하고 명확한 가치를 보며 ChatGPT를 신뢰할 수 있고 유용한 인터페이스로 계속 신뢰하도록 보장합니다.
