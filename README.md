# OpenAI Apps SDK

ChatGPT용 네이티브 앱을 구축하기 위한 프레임워크입니다. Apps SDK는 현재 개발자들이 애플리케이션을 구축하고 테스트할 수 있도록 프리뷰 버전으로 제공되고 있습니다.

## 개요

Apps SDK를 통해 개발자는 다음을 수행할 수 있습니다:
- ChatGPT 네이티브 앱 경험 설계
- 대화형 앱 컴포넌트 구축
- 커스텀 사용자 인터랙션 생성
- ChatGPT에 앱 배포 및 연결

---

## 목차

1. [Core Concepts](#core-concepts)
   - [MCP Servers](#mcp-servers)
   - [User Interaction](#user-interaction)
   - [App Design Guidelines](#app-design-guidelines)
2. [Plan](#plan)
   - [Research Use Cases](#research-use-cases)
   - [Define Tools](#define-tools)
   - [Design Components](#design-components)
3. [Build](#build)
   - [Set up your server](#set-up-your-server)
   - [Build a custom UX](#build-a-custom-ux)
   - [Authentication](#authentication)
   - [Storage](#storage)
   - [Examples](#examples)
4. [Deploy](#deploy)
5. [Guides](#guides)
6. [Resources](#resources)
7. [Reference](#reference)
8. [App Developer Guidelines](#app-developer-guidelines)

---

## Core Concepts

### MCP Servers

Apps SDK가 Model Context Protocol과 어떻게 작동하는지 이해합니다.

#### What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) is an open specification for connecting large language model clients to external tools and resources. An MCP server exposes **tools** that a model can call during a conversation, and return results given specified parameters. Other resources (metadata) can be returned along with tool results, including the inline html that we can use in the Apps SDK to render an interface.

With Apps SDK, MCP is the backbone that keeps server, model, and UI in sync. By standardising the wire format, authentication, and metadata, it lets ChatGPT reason about your app the same way it reasons about built-in tools.

#### Protocol building blocks

A minimal MCP server for Apps SDK implements three capabilities:

1. **List tools** – your server advertises the tools it supports, including their JSON Schema input and output contracts and optional annotations.
2. **Call tools** – when a model selects a tool to use, it sends a `call_tool` request with the arguments corresponding to the user intent. Your server executes the action and returns structured content the model can parse.
3. **Return components** – in addition to structured content returned by the tool, each tool (in its metadata) can optionally point to an [embedded resource](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#embedded-resources) that represents the interface to render in the ChatGPT client.

The protocol is transport agnostic, you can host the server over Server-Sent Events or Streamable HTTP. Apps SDK supports both options, but we recommend Streamable HTTP.

#### Why Apps SDK standardises on MCP

Working through MCP gives you several benefits out of the box:

- **Discovery integration** – the model consumes your tool metadata and surface descriptions the same way it does for first-party connectors, enabling natural-language discovery and launcher ranking. See [Discovery](/apps-sdk/concepts/user-interaction) for details.
- **Conversation awareness** – structured content and component state flow through the conversation. The model can inspect the JSON result, refer to IDs in follow-up turns, or render the component again later.
- **Multiclient support** – MCP is self-describing, so your connector works across ChatGPT web and mobile without custom client code.
- **Extensible auth** – the specification includes protected resource metadata, OAuth 2.1 flows, and dynamic client registration so you can control access without inventing a proprietary handshake.

#### Next steps

If you're new to MCP, we recommend starting with the following resources:

- [Model Context Protocol specification](https://modelcontextprotocol.io/specification)
- Official SDKs: [Python SDK (official; includes FastMCP module)](https://github.com/modelcontextprotocol/python-sdk) and [TypeScript](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) for local debugging

Once you are comfortable with the MCP primitives, you can move on to the [Set up your server](/apps-sdk/build/mcp-server) guide for implementation details.

---

### User Interaction

How users find, engage with, activate and manage apps that are available in ChatGPT.

#### Discovery

Discovery refers to the different ways a user or the model can find out about your app and the tools it provides: natural-language prompts, directory browsing, and proactive [entry points](/apps-sdk/concepts/entry-points). Apps SDK leans on your tool metadata and past usage to make intelligent choices. Good discovery hygiene means your app appears when it should and stays quiet when it should not.

##### Named mention

When a user mentions the name of your app at the beginning of a prompt, your app will be surfaced automatically in the response. The user must specify your app name at the beginning of their prompt. If they do not, your app can also appear as a suggestion through in-conversation discovery.

##### In-conversation discovery

When a user sends a prompt, the model evaluates:

- **Conversation context** – the chat history, including previous tool results, memories, and explicit tool preferences
- **Conversation brand mentions and citations** - whether your brand is explicitly requested in the query or is surfaced as a source/citation in search results.
- **Tool metadata** – the names, descriptions, and parameter documentation you provide in your MCP server.
- **User linking state** – whether the user already granted access to your app, or needs to connect it before the tool can run.

You influence in-conversation discovery by:

1. Writing action-oriented [tool descriptions](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool) ("Use this when the user wants to view their kanban board") rather than generic copy.
2. Writing clear [component descriptions](/apps-sdk/reference#add-component-descriptions) on the resource UI template metadata.
3. Regularly testing your golden prompt set in ChatGPT developer mode and logging precision/recall.

If the assistant selects your tool, it handles arguments, displays confirmation if needed, and renders the component inline. If no linked tool is an obvious match, the model will default to built-in capabilities, so keep evaluating and improving your metadata.

##### Directory

The directory will give users a browsable surface to find apps outside of a conversation. Your listing in this directory will include:

- App name and icon
- Short and long descriptions
- Tags or categories (where supported)
- Optional onboarding instructions or screenshots

#### Entry points

Once a user links your app, ChatGPT can surface it through several entry points. Understanding each surface helps you design flows that feel native and discoverable.

##### In-conversation entry

Linked tools are always on in the model's context. When the user writes a prompt, the assistant decides whether to call your tool based on the conversation state and metadata you supplied. Best practices:

- Keep tool descriptions action oriented so the model can disambiguate similar apps.
- Return structured content that references stable IDs so follow-up prompts can mutate or summarise prior results.
- Provide `_meta` [hints](/apps-sdk/reference#tool-descriptor-parameters) so the client can streamline confirmation and rendering.

When a call succeeds, the component renders inline and inherits the current theme, composer, and confirmation settings.

##### Launcher

The launcher (available from the + button in the composer) is a high-intent entry point where users can explicitly choose an app. Your listing should include a succinct label and icon. Consider:

- **Deep linking** – include starter prompts or entry arguments so the user lands on the most useful tool immediately.
- **Context awareness** – the launcher ranks apps using the current conversation as a signal, so keep metadata aligned with the scenarios you support.

---

### App Design Guidelines

Design guidelines for developers building on the Apps SDK.

#### Overview

Apps are developer-built experiences that live inside ChatGPT. They extend what users can do without breaking the flow of conversation, appearing through lightweight cards, carousels, fullscreen views, and other display modes that integrate seamlessly into ChatGPT's interface while maintaining its clarity, trust, and voice.

These guidelines will give you everything you need to begin building high-quality, consistent, and user-friendly experiences inside ChatGPT.

#### Best practices

Apps are most valuable when they help people accomplish meaningful tasks directly within ChatGPT, without breaking the conversational flow. The goal is to design experiences that feel consistent, useful, and trustworthy while extending ChatGPT in ways that add real value. Good use cases include booking a ride, ordering food, checking availability, or tracking a delivery. These are tasks that are conversational, time bound, and easy to summarize visually with a clear call to action.

Poor use cases include pasting in long form content from a website, requiring complex multi step workflows, or using the space for ads or irrelevant messaging.

#### Principles

- **Conversational**: Experiences should feel like a natural extension of ChatGPT, fitting seamlessly into the conversational flow and UI.
- **Intelligent**: Tools should be aware of conversation context, supporting and anticipating user intent. Responses and UI should feel individually relevant.
- **Simple**: Each interaction should focus on a single clear action or outcome. Information and UI should be reduced to the absolute minimum to support the context.
- **Responsive**: Tools should feel fast and lightweight, enhancing conversation rather than overwhelming it.
- **Accessible**: Designs must support a wide range of users, including those who rely on assistive technologies.

#### Boundaries

ChatGPT controls system-level elements such as voice, chrome, styles, navigation, and composer. Developers provide value by customizing content, brand presence, and actions inside the system framework.

This balance ensures that all apps feel native to ChatGPT while still expressing unique brand value.

##### Good use cases

A good app should answer "yes" to most of these questions:

- **Does this task fit naturally into a conversation?** (for example, booking, ordering, scheduling, quick lookups)
- **Is it time-bound or action-oriented?** (short or medium duration tasks with a clear start and end)
- **Is the information valuable in the moment?** (users can act on it right away or get a concise preview before diving deeper)
- **Can it be summarized visually and simply?** (one card, a few key details, a clear CTA)
- **Does it extend ChatGPT in a way that feels additive or differentiated?**

##### Poor use cases

Avoid designing tools that:

- Display **long-form or static content** better suited for a website or app.
- Require **complex multi-step workflows** that exceed the inline or fullscreen display modes.
- Use the space for **ads, upsells, or irrelevant messaging**.
- Surface **sensitive or private information** directly in a card where others might see it.
- **Duplicate ChatGPT's system functions** (for example, recreating the input composer).

By following these best practices, your tool will feel like a natural extension of ChatGPT rather than a bolt-on experience.

#### Display modes

Display modes are the surfaces developers use to create experiences inside ChatGPT. They allow partners to show content and actions that feel native to conversation. Each mode is designed for a specific type of interaction, from quick confirmations to immersive workflows.

Using these consistently helps experiences stay simple and predictable.

##### Inline

The inline display mode appears directly in the flow of the conversation. Inline surfaces currently always appear before the generated model response. Every app initially appears inline.

###### Layout

- **Icon & tool call**: A label with the app name and icon.
- **Inline display**: A lightweight display with app content embedded above the model response.
- **Follow-up**: A short, model-generated response shown after the widget to suggest edits, next steps, or related actions. Avoid content that is redundant with the card.

##### Inline card

Lightweight, single-purpose widgets embedded directly in conversation. They provide quick confirmations, simple actions, or visual aids.

###### When to use

- A single action or decision (for example, confirm a booking).
- Small amounts of structured data (for example, a map, order summary, or quick status).
- A fully self-contained widget or tool (e.g., an audio player or a score card).

###### Layout

- **Title**: Include a title if your card is document-based or contains items with a parent element, like songs in a playlist.
- **Expand**: Use to open a fullscreen display mode if the card contains rich media or interactivity like a map or an interactive diagram.
- **Show more**: Use to disclose additional items if multiple results are presented in a list.
- **Edit controls**: Provide inline support for ChatGPT responses without overwhelming the conversation.
- **Primary actions**: Limit to two actions, placed at bottom of card. Actions should perform either a conversation turn or a tool call.

###### Interaction

Cards support simple direct interaction.

- **States**: Edits made are persisted.
- **Simple direct edits**: If appropriate, inline editable text allows users to make quick edits without needing to prompt the model.
- **Dynamic layout**: Card layout can expand its height to match its contents up to the height of the mobile viewport.

###### Rules of thumb

- **Limit primary actions per card**: Support up to two actions maximum, with one primary CTA and one optional secondary CTA.
- **No deep navigation or multiple views within a card.** Cards should not contain multiple drill-ins, tabs, or deeper navigation. Consider splitting these into separate cards or tool actions.
- **No nested scrolling**. Cards should auto-fit their content and prevent internal scrolling.
- **No duplicative inputs**. Don't replicate ChatGPT features in a card.

##### Inline carousel

A set of cards presented side-by-side, letting users quickly scan and choose from multiple options.

###### When to use

- Presenting a small list of similar items (for example, restaurants, playlists, events).
- Items have more visual content and metadata than will fit in simple rows.

###### Layout

- **Image**: Items should always include an image or visual.
- **Title**: Carousel items should typically include a title to explain the content.
- **Metadata**: Use metadata to show the most important and relevant information about the item in the context of the response. Avoid showing more than two lines of text.
- **Badge**: Use the badge to show supporting context where appropriate.
- **Actions**: Provide a single clear CTA per item whenever possible.

###### Rules of thumb

- Keep to **3–8 items per carousel** for scannability.
- Reduce metadata to the most relevant details, with three lines max.
- Each card may have a single, optional CTA (for example, "Book" or "Play").
- Use consistent visual hierarchy across cards.

##### Fullscreen

Immersive experiences that expand beyond the inline card, giving users space for multi-step workflows or deeper exploration. The ChatGPT composer remains overlaid, allowing users to continue "talking to the app" through natural conversation in the context of the fullscreen view.

###### When to use

- Rich tasks that cannot be reduced to a single card (for example, an explorable map with pins, a rich editing canvas, or an interactive diagram).
- Browsing detailed content (for example, real estate listings, menus).

###### Layout

- **System close**: Closes the sheet or view.
- **Fullscreen view**: Content area.
- **Composer**: ChatGPT's native composer, allowing the user to follow up in the context of the fullscreen view.

###### Interaction

- **Chat sheet**: Maintain conversational context alongside the fullscreen surface.
- **Thinking**: The composer input "shimmers" to show that a response is streaming.
- **Response**: When the model completes its response, an ephemeral, truncated snippet displays above the composer. Tapping it opens the chat sheet.

###### Rules of thumb

- **Design your UX to work with the system composer**. The composer is always present in fullscreen, so make sure your experience supports conversational prompts that can trigger tool calls and feel natural for users.
- **Use fullscreen to deepen engagement**, not to replicate your native app wholesale.

##### Picture-in-picture (PiP)

A persistent floating window inside ChatGPT optimized for ongoing or live sessions like games or videos. PiP remains visible while the conversation continues, and it can update dynamically in response to user prompts.

###### When to use

- **Activities that run in parallel with conversation**, such as a game, live collaboration, quiz, or learning session.
- **Situations where the PiP widget can react to chat input**, for example continuing a game round or refreshing live data based on a user request.

###### Interaction

- **Activated:** On scroll, the PiP window stays fixed to the top of the viewport
- **Pinned:** The PiP remains fixed until the user dismisses it or the session ends.
- **Session ends:** The PiP returns to an inline position and scrolls away.

###### Rules of thumb

- **Ensure the PiP state can update or respond** when users interact through the system composer.
- **Close PiP automatically** when the session ends.
- **Do not overload PiP with controls or static content** better suited for inline or fullscreen.

#### Visual design guidelines

A consistent look and feel is what makes partner-built tools feel like a natural part of ChatGPT. Visual guidelines ensure partner experiences remain familiar, accessible, and trustworthy, while still leaving room for brand expression in the right places.

These principles outline how to use color, type, spacing, and imagery in ways that preserve system clarity while giving partners space to differentiate their service.

###### Why this matters

Visual and UX consistency protects the overall user experience of ChatGPT. By following these guidelines, partners ensure their tools feel familiar to users, maintain trust in the system, and deliver value without distraction.

###### Color

System-defined palettes ensure actions and responses always feel consistent with ChatGPT. Partners can add branding through accents, icons, or inline imagery, but should not redefine system colors.

###### Rules of thumb

- Use system colors for text, icons, and spatial elements like dividers.
- Partner brand accents such as logos or icons should not override backgrounds or text colors.
- Avoid custom gradients or patterns that break ChatGPT's minimal look.
- Use brand accent colors on primary buttons inside app display modes.

###### Typography

ChatGPT uses platform-native system fonts (SF Pro on iOS, Roboto on Android) to ensure readability and accessibility across devices.

###### Rules of thumb

- Always inherit the system font stack, respecting system sizing rules for headings, body text, and captions.
- Use partner styling such as bold, italic, or highlights only within content areas, not for structural UI.
- Limit variation in font size as much as possible, preferring body and body-small sizes.

###### Spacing & layout

Consistent margins, padding, and alignment keep partner content scannable and predictable inside conversation.

###### Rules of thumb

- Use system grid spacing for cards, collections, and inspector panels.
- Keep padding consistent and avoid cramming or edge-to-edge text.
- Respect system specified corner rounds when possible to keep shapes consistent.
- Maintain visual hierarchy with headline, supporting text, and CTA in a clear order.

###### Icons & imagery

System iconography provides visual clarity, while partner logos and images help users recognize brand context.

###### Rules of thumb

- Use either system icons or custom iconography that fits within ChatGPT's visual world — monochromatic and outlined.
- Do not include your logo as part of the response. ChatGPT will always append your logo and app name before the widget is rendered.
- All imagery must follow enforced aspect ratios to avoid distortion.

###### Accessibility

Every partner experience should be usable by the widest possible audience. Accessibility is a requirement, not an option.

###### Rules of thumb

- Text and background must maintain a minimum contrast ratio (WCAG AA).
- Provide alt text for all images.
- Support text resizing without breaking layouts.

#### Tone & proactivity

Tone and proactivity are critical to how partner tools show up inside ChatGPT. Partners contribute valuable content, but the overall experience must always feel like ChatGPT: clear, helpful, and trustworthy. These guidelines define how your tool should communicate and when it should resurface to users.

###### Tone ownership

- ChatGPT sets the overall **voice**.
- Partners provide **content** within that framework.
- The result should feel seamless: partner content adds context and actions without breaking ChatGPT's natural, conversational tone.

###### Content guidelines

- Keep content **concise and scannable**.
- Always **context-driven**: content should respond to what the user asked for.
- Avoid **spam, jargon, or promotional language**.
- Focus on **helpfulness and clarity** over brand personality.

###### Proactivity rules

Proactivity helps users by surfacing the right information at the right time. It should always feel relevant and never intrusive.

- **Allowed**: contextual nudges or reminders tied to user intent.
  - Example: "Your order is ready for pickup" or "Your ride is arriving."
- **Not allowed**: unsolicited promotions, upsells, or repeated attempts to re-engage without clear context.
  - Example: "Check out our latest deals" or "Haven't used us in a while? Come back."

###### Transparency

- Always show **why and when** your tool is resurfacing.
- Provide enough context so users understand the purpose of the nudge.
- Proactivity should feel like a natural continuation of the conversation, not an interruption.

###### Why this matters

The way partner tools speak and re-engage defines user trust. A consistent tone and thoughtful proactivity strategy ensure users remain in control, see clear value, and continue to trust ChatGPT as a reliable, helpful interface.

---

## Plan

### Research Use Cases

Identify and prioritize Apps SDK use cases.

#### Why start with use cases

Every successful Apps SDK app starts with a crisp understanding of what the user is trying to accomplish. Discovery in ChatGPT is model-driven: the assistant chooses your app when your tool metadata, descriptions, and past usage align with the user's prompt and memories. That only works if you have already mapped the tasks the model should recognize and the outcomes you can deliver.

Use this page to capture your hypotheses, pressure-test them with prompts, and align your team on scope before you define tools or build components.

#### Gather inputs

Begin with qualitative and quantitative research:

- **User interviews and support requests** – capture the jobs-to-be-done, terminology, and data sources users rely on today.
- **Prompt sampling** – list direct asks (e.g., "show my Jira board") and indirect intents ("what am I blocked on for the launch?") that should route to your app.
- **System constraints** – note any compliance requirements, offline data, or rate limits that will influence tool design later.

Document the user persona, the context they are in when they reach for ChatGPT, and what success looks like in a single sentence for each scenario.

#### Define evaluation prompts

Decision boundary tuning is easier when you have a golden set to iterate against. For each use case:

1. **Author at least five direct prompts** that explicitly reference your data, product name, or verbs you expect the user to say.
2. **Draft five indirect prompts** where the user states a goal but not the tool ("I need to keep our launch tasks organized").
3. **Add negative prompts** that should _not_ trigger your app so you can measure precision.

Use these prompts later in [Optimize metadata](/apps-sdk/guides/optimize-metadata) to hill-climb on recall and precision without overfitting to a single request.

#### Scope the minimum lovable feature

For each use case decide:

- **What information must be visible inline** to answer the question or let the user act.
- **Which actions require write access** and whether they should be gated behind confirmation in developer mode.
- **What state needs to persist** between turns—for example, filters, selected rows, or draft content.

Rank the use cases based on user impact and implementation effort. A common pattern is to ship one P0 scenario with a high-confidence component, then expand to P1 scenarios once discovery data confirms engagement.

#### Translate use cases into tooling

Once a scenario is in scope, draft the tool contract:

- Inputs: the parameters the model can safely provide. Keep them explicit, use enums when the set is constrained, and document defaults.
- Outputs: the structured content you will return. Add fields the model can reason about (IDs, timestamps, status) in addition to what your UI renders.
- Component intent: whether you need a read-only viewer, an editor, or a multiturn workspace. This influences the [component planning](/apps-sdk/plan/components) and storage model later.

Review these drafts with stakeholders—especially legal or compliance teams—before you invest in implementation. Many integrations require PII reviews or data processing agreements before they can ship to production.

#### Prepare for iteration

Even with solid planning, expect to revise prompts and metadata after your first dogfood. Build time into your schedule for:

- Rotating through the golden prompt set weekly and logging tool selection accuracy.
- Collecting qualitative feedback from early testers in ChatGPT developer mode.
- Capturing analytics (tool calls, component interactions) so you can measure adoption.

These research artifacts become the backbone for your roadmap, changelog, and success metrics once the app is live.

---

### Define Tools

Plan and define tools for your assistant.

#### Tool-first thinking

In Apps SDK, tools are the contract between your MCP server and the model. They describe what the connector can do, how to call it, and what data comes back. Good tool design makes discovery accurate, invocation reliable, and downstream UX predictable.

Use the checklist below to turn your use cases into well-scoped tools before you touch the SDK.

#### Draft the tool surface area

Start from the user journey defined in your [use case research](/apps-sdk/plan/use-case):

- **One job per tool** – keep each tool focused on a single read or write action ("fetch_board", "create_ticket"), rather than a kitchen-sink endpoint. This helps the model decide between alternatives.
- **Explicit inputs** – define the shape of `inputSchema` now, including parameter names, data types, and enums. Document defaults and nullable fields so the model knows what is optional.
- **Predictable outputs** – enumerate the structured fields you will return, including machine-readable identifiers that the model can reuse in follow-up calls.

If you need both read and write behavior, create separate tools so ChatGPT can respect confirmation flows for write actions.

#### Capture metadata for discovery

Discovery is driven almost entirely by metadata. For each tool, draft:

- **Name** – action oriented and unique inside your connector (`kanban.move_task`).
- **Description** – one or two sentences that start with "Use this when…" so the model knows exactly when to pick the tool.
- **Parameter annotations** – describe each argument and call out safe ranges or enumerations. This context prevents malformed calls when the user prompt is ambiguous.
- **Global metadata** – confirm you have app-level name, icon, and descriptions ready for the directory and launcher.

Later, plug these into your MCP server and iterate using the [Optimize metadata](/apps-sdk/guides/optimize-metadata) workflow.

#### Model-side guardrails

Think through how the model should behave once a tool is linked:

- **Prelinked vs. link-required** – if your app can work anonymously, mark tools as available without auth. Otherwise, make sure your connector enforces linking via the onboarding flow described in [Authentication](/apps-sdk/build/auth).
- **Read-only hints** – set the [`readOnlyHint` annotation](/apps-sdk/reference#tool-descriptor-parameters) for tools that cannot mutate state so ChatGPT can skip confirmation prompts when possible.
- **Result components** – decide whether each tool should render a component, return JSON only, or both. Setting `_meta["openai/outputTemplate"]` on the tool descriptor advertises the HTML template to ChatGPT.

#### Golden prompt rehearsal

Before you implement, sanity-check your tool set against the prompt list you captured earlier:

1. For every direct prompt, confirm you have exactly one tool that clearly addresses the request.
2. For indirect prompts, ensure the tool descriptions give the model enough context to select your connector instead of a built-in alternative.
3. For negative prompts, verify your metadata will keep the tool hidden unless the user explicitly opts in (e.g., by naming your product).

Capture any gaps or ambiguities now and adjust the plan—changing metadata before launch is much cheaper than refactoring code later.

#### Handoff to implementation

When you are ready to implement, compile the following into a handoff document:

- Tool name, description, input schema, and expected output schema.
- Whether the tool should return a component, and if so which UI component should render it.
- Auth requirements, rate limits, and error handling expectations.
- Test prompts that should succeed (and ones that should fail).

Bring this plan into the [Set up your server](/apps-sdk/build/mcp-server) guide to translate it into code with the MCP SDK of your choice.

---

### Design Components

Plan and design UI components that users can interact with.

#### Why components matter

UI components are the human-visible half of your connector. They let users view or edit data inline, switch to fullscreen when needed, and keep context synchronized between typed prompts and UI actions. Planning them early ensures your MCP server returns the right structured data and component metadata from day one.

#### Clarify the user interaction

For each use case, decide what the user needs to see and manipulate:

- **Viewer vs. editor** – is the component read-only (a chart, a dashboard) or should it support editing and writebacks (forms, kanban boards)?
- **Single-shot vs. multiturn** – will the user accomplish the task in one invocation, or should state persist across turns as they iterate?
- **Inline vs. fullscreen** – some tasks are comfortable in the default inline card, while others benefit from fullscreen or picture-in-picture modes. Sketch these states before you implement.

Write down the fields, affordances, and empty states you need so you can validate them with design partners and reviewers.

#### Map data requirements

Components should receive everything they need in the tool response. When planning:

- **Structured content** – define the JSON payload that the component will parse.
- **Initial component state** – use `window.openai.toolOutput` as the initial render data. On subsequent followups that invoke `callTool`, use the return value of `callTool`. To cache state for re-rendering, you can use `window.openai.setWidgetState`.
- **Auth context** – note whether the component should display linked-account information, or whether the model must prompt the user to connect first.

Feeding this data through the MCP response is simpler than adding ad-hoc APIs later.

#### Design for responsive layouts

Components run inside an iframe on both desktop and mobile. Plan for:

- **Adaptive breakpoints** – set a max width and design layouts that collapse gracefully on small screens.
- **Accessible color and motion** – respect system dark mode (match color-scheme) and provide focus states for keyboard navigation.
- **Launcher transitions** – if the user opens your component from the launcher or expands to fullscreen, make sure navigation elements stay visible.

Document CSS variables, font stacks, and iconography up front so they are consistent across components.

#### Define the state contract

Because components and the chat surface share conversation state, be explicit about what is stored where:

- **Component state** – use the `window.openai.setWidgetState` API to persist state the host should remember (selected record, scroll position, staged form data).
- **Server state** – store authoritative data in your backend or the built-in storage layer. Decide how to merge server changes back into component state after follow-up tool calls.
- **Model messages** – think about what human-readable updates the component should send back via `sendFollowupTurn` so the transcript stays meaningful.

Capturing this state diagram early prevents hard-to-debug sync issues later.

#### Plan telemetry and debugging hooks

Inline experiences are hardest to debug without instrumentation. Decide in advance how you will:

- Emit analytics events for component loads, button clicks, and validation errors.
- Log tool-call IDs alongside component telemetry so you can trace issues end to end.
- Provide fallbacks when the component fails to load (e.g., show the structured JSON and prompt the user to retry).

Once these plans are in place you are ready to move on to the implementation details in [Build a custom UX](/apps-sdk/build/custom-ux).

---

## Build

### Set up your server

#### Overview

Your MCP server is the foundation of every Apps SDK integration. It exposes tools that the model can call, enforces authentication, and packages the structured data plus component HTML that the ChatGPT client renders inline. This guide walks through the core building blocks with examples in Python and TypeScript.

#### Choose an SDK

Apps SDK supports any server that implements the MCP specification, but the official SDKs are the fastest way to get started:

- **Python SDK (official)** – great for rapid prototyping, including the official FastMCP module. See the repo at [`modelcontextprotocol/python-sdk`](https://github.com/modelcontextprotocol/python-sdk). This is distinct from community "FastMCP" projects.
- **TypeScript SDK (official)** – ideal if your stack is already Node/React. Use `@modelcontextprotocol/sdk`. Docs: [`modelcontextprotocol.io`](https://modelcontextprotocol.io/).

Install the SDK and any web framework you prefer (FastAPI or Express are common choices).

#### Describe your tools

Tools are the contract between ChatGPT and your backend. Define a clear machine name, human-friendly title, and JSON schema so the model knows when—and how—to call each tool. This is also where you wire up per-tool metadata, including auth hints, status strings, and component configuration.

##### Point to a component template

In addition to returning structured data, each tool on your MCP server should also reference an HTML UI template in its descriptor. This HTML template will be rendered in an iframe by ChatGPT.

1. **Register the template** – expose a resource whose `mimeType` is `text/html+skybridge` and whose body loads your compiled JS/CSS bundle. The resource URI (for example `ui://widget/kanban-board.html`) becomes the canonical ID for your component.
2. **Link the tool to the template** – inside the tool descriptor, set `_meta["openai/outputTemplate"]` to the same URI. Optional `_meta` fields let you declare whether the component can initiate tool calls or display custom status copy.
3. **Version carefully** – when you ship breaking component changes, register a new resource URI and update the tool metadata in lockstep. ChatGPT caches templates aggressively, so unique URIs (or cache-busted filenames) prevent stale assets from loading.

With the template and metadata in place, ChatGPT hydrates the iframe using the `structuredContent` payload from each tool response.

Here is an example:

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

#### Structure the data your tool returns

Each tool result in the tool response can include three sibling fields that shape how ChatGPT and your component consume the payload:

- **`structuredContent`** – structured data that is used to hydrate your component, e.g. the tracks for a playlist, the homes for a realtor app, the tasks for a kanban app. ChatGPT injects this object into your iframe as `window.openai.toolOutput`, so keep it scoped to the data your UI needs. The model reads these values and may narrate or summarize them.
- **`content`** – Optional free-form text (Markdown or plain strings) that the model receives verbatim.
- **`_meta`** – Arbitrary JSON passed only to the component. Use it for data that should not influence the model's reasoning, like the full set of locations that backs a dropdown. `_meta` is never shown to the model.

Your component receives all three fields, but only `structuredContent` and `content` are visible to the model. If you are looking to control the text underneath the component, please use [`widgetDescription`](/apps-sdk/build/mcp-server###add-component-descriptions).

Continuing the Kanban example, fetch board data and return the trio of fields so the component hydrates without exposing extra context to the model:

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

#### Build your component

Now that you have the MCP server scaffold set up, follow the instructions on the [Build a custom UX page](/apps-sdk/build/custom-ux) to build your component experience.

#### Run locally

1. Build your component bundle (See instructions on the [Build a custom UX page](/apps-sdk/build/custom-ux#bundle-for-the-iframe) page).
2. Start the MCP server.
3. Point [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) to `http://localhost:<port>/mcp`, list tools, and call them.

Inspector validates that your response includes both structured content and component metadata and renders the component inline.

#### Expose a public endpoint

ChatGPT requires HTTPS. During development, you can use a tunnelling service such as [ngrok](https://ngrok.com/).

In a separate terminal window, run:

```bash
ngrok http <port>
# Forwarding: https://<subdomain>.ngrok.app -> http://127.0.0.1:<port>
```

Use the resulting URL when creating a connector in developer mode. For production, deploy to an HTTPS endpoint with low cold-start latency (see [Deploy your app](/apps-sdk/deploy)).

#### Layer in authentication and storage

Once the server handles anonymous traffic, decide whether you need user identity or persistence. The [Authentication](/apps-sdk/build/auth) and [Storage](/apps-sdk/build/storage) guides show how to add OAuth 2.1 flows, token verification, and database queries without rewriting your tool handlers.

---

### Build a custom UX

#### Overview

UI components turn structured tool results into a human-friendly UI. Apps SDK components are typically React components that run inside an iframe, talk to the host via the `window.openai` API, and render inline with the conversation. This guide describes how to structure your component project, bundle it, and wire it up to your MCP server.

#### Understand the `window.openai` API

`window.openai` is the bridge between your iframe and ChatGPT. Use this quick reference to first understand how to wire up data, state, and layout concerns before you dive into component scaffolding.

- Layout globals exposed by the host: `displayMode`, `maxHeight`, `theme`, `locale`
- Tool payloads scoped to the current message: `toolInput`, `toolOutput`, and a host‑persisted `widgetState`
- Actions you can call from the iframe: `setWidgetState`, `callTool`, `sendFollowupTurn`, `requestDisplayMode`
- Events you can listen to: `openai:set_globals` and `openai:tool_response`

##### Access tool data

To access the `structuredContent` output of your MCP call result, read from `window.openai.toolOutput`. For the inputs, use `window.openai.toolInput`.

```tsx
const toolInput = window.openai?.toolInput as { city?: string } | undefined;
const toolOutput = window.openai?.toolOutput as PizzaListState | undefined;

const places = toolOutput?.places ?? [];
const favorites = toolOutput?.favorites ?? [];

useEffect(() => {
  if (!toolOutput) return;
  // keep analytics, caches, or derived data in sync with the latest tool response
}, [toolOutput]);
```

##### Persist component state

Use `window.openai.setWidgetState` when you want to remember UI decisions—favorites, filters, or drafts—across renders. Save a new snapshot after every meaningful change so the host can restore the component where the user left off.

Read from `widgetState` first on mount, and fall back to `toolOutput` when state isn't set yet.

```tsx
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

##### Trigger server actions

`window.openai.callTool` lets the component directly make MCP tool calls. Use this for direct manipulations (refresh data, fetch nearby restaurants). Design tools to be idempotent where possible and return updated structured content that the model can reason over in subsequent turns.

Please note that your tool needs to be marked as [able to be initiated by the component](/apps-sdk/build/mcp-server###allow-component-initiated-tool-access).

```tsx
async function refreshPlaces(city: string) {
  await window.openai?.callTool("refresh_pizza_list", { city });
}
```

##### Send conversational follow-ups

Use `window.openai.sendFollowupTurn` to insert a message into the conversation as if the user asked it.

```tsx
await window.openai?.sendFollowupTurn({
  prompt: "Draft a tasting itinerary for the pizzerias I favorited.",
});
```

##### Request alternate layouts

If the UI needs more space—like maps, tables, or embedded editors—ask the host to change the container. `window.openai.requestDisplayMode` negotiates inline, PiP, or fullscreen presentations.

```tsx
await window.openai?.requestDisplayMode({ mode: "fullscreen" });
// Note: on mobile, PiP may be coerced to fullscreen
```

##### Respond to host updates

The host can change layout, theming, or locale at any point. Read the globals on `window.openai` and listen for `openai:set_globals` so you can resize, restyle, or re-render as conditions change.

Use the `window.openai` globals to respond to layout and theme changes:

- `window.openai.displayMode` tells you whether the component is inline, picture-in-picture, or fullscreen.
- `window.openai.maxHeight` indicates how much vertical space you can use before scrollbars appear.
- `window.openai.locale` returns the user's locale (BCP 47 tag) and matches the iframe's `lang` attribute.
- Listen for the `openai:set_globals` window event if you need to react to theme or layout changes.

##### Subscribe to tool responses

Tool invocations can originate from the user, the assistant, or your own component. Subscribe to `openai:tool_response` when you want to refresh UI state whenever a background action completes. Remember to unsubscribe on unmount to avoid leaks.

```tsx
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

##### Use host-backed navigation

Skybridge (the sandbox runtime) mirrors the iframe's history into ChatGPT's UI. Use standard routing APIs—such as React Router—and the host will keep navigation controls in sync with your component.

Router setup (React Router's `BrowserRouter`):

```ts
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

Programmatic navigation:

```ts
const navigate = useNavigate();

function openDetails(placeId: string) {
  navigate(`place/${placeId}`, { replace: false });
}

function closeDetails() {
  navigate("..", { replace: true });
}
```

#### Scaffold the component project

Now that you understand the `window.openai` API, it's time to scaffold your component project.

As best practice, keep the component code separate from your server logic. A common layout is:

```plaintext
app/
  server/            # MCP server (Python or Node)
  web/               # Component bundle source
    package.json
    tsconfig.json
    src/component.tsx
    dist/component.js   # Build output
```

Create the project and install dependencies (Node 18+ recommended):

```bash
cd app/web
npm init -y
npm install react@^18 react-dom@^18
npm install -D typescript esbuild
```

If your component requires drag-and-drop, charts, or other libraries, add them now. Keep the dependency set lean to reduce bundle size.

#### Author the React component

Your entry file should mount a component into a `root` element and read initial data from `window.openai.toolOutput` or persisted state.

We have provided some example apps under the [examples page](./examples#pizzaz-list-source), for example, for a "Pizza list" app, which is a list of pizza restaurants. As you can see in the source code, the pizza list React component does the following:

1. **Mount into the host shell.** The Skybridge HTML template exposes `div#pizzaz-list-root`. The component mounts with `createRoot(document.getElementById("pizzaz-list-root")).render(<PizzaListApp />)` so the entire UI stays encapsulated inside the iframe.
2. **Subscribe to host globals.** Inside `PizzaListApp`, hooks such as `useOpenAiGlobal("displayMode")` and `useOpenAiGlobal("maxHeight")` read layout preferences directly from `window.openai`. This keeps the list responsive between inline and fullscreen layouts without custom postMessage plumbing.
3. **Render from tool output.** The component treats `window.openai.toolOutput` as the authoritative source of places returned by your tool. `widgetState` seeds any user-specific state (like favorites or filters) so the UI restores after refreshes.
4. **Persist state and call host actions.** When a user toggles a favorite, the component updates React state and immediately calls `window.openai.setWidgetState` with the new favorites array. Optional buttons can trigger `window.openai.requestDisplayMode({ mode: "fullscreen" })` or `window.openai.callTool("refresh_pizza_list", { city })` when more space or fresh data is needed.

##### Explore the Pizzaz component gallery

We provide a number of example components in the [Apps SDK examples](/apps-sdk/build/examples). Treat them as blueprints when shaping your own UI:

- **Pizzaz List** – ranked card list with favorites and call-to-action buttons.
  ![Screenshot of the Pizzaz list component](/images/apps-sdk/pizzaz-list.png)
- **Pizzaz Carousel** – embla-powered horizontal scroller that demonstrates media-heavy layouts.
  ![Screenshot of the Pizzaz carousel component](/images/apps-sdk/pizzaz-carousel.png)
- **Pizzaz Map** – Mapbox integration with fullscreen inspector and host state sync.
  ![Screenshot of the Pizzaz map component](/images/apps-sdk/pizzaz-map.png)
- **Pizzaz Album** – stacked gallery view built for deep dives on a single place.
  ![Screenshot of the Pizzaz album component](/images/apps-sdk/pizzaz-album.png)
- **Pizzaz Video** – scripted player with overlays and fullscreen controls.

Each example shows how to bundle assets, wire host APIs, and structure state for real conversations. Copy the one closest to your use case and adapt the data layer for your tool responses.

##### React helper hooks

Many Apps SDK projects wrap `window.openai` access in small hooks so views remain testable. This example hook listens for host `openai:set_globals` events and lets React components subscribe to a single global value:

```ts
export function useOpenAiGlobal<K extends keyof WebplusGlobals>(
  key: K
): WebplusGlobals[K] {
  return useSyncExternalStore(
    (onChange) => {
      const handleSetGlobal = (event: SetGlobalsEvent) => {
        const value = event.detail.globals[key];
        if (value === undefined) return;
        onChange();
      };

      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
      return () => {
        window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
      };
    },
    () => window.openai?.[key]
  );
}
```

Full implementations of `useOpenAiGlobal` and other helpers are available in the [Pizzaz component examples](/apps-sdk/build/examples).

#### Bundle for the iframe

Your build setup should emit a single module that works in modern browsers. ChatGPT does not transpile or polyfill components, so include any runtime you need. A typical `esbuild` script:

```json
{
  "scripts": {
    "build": "esbuild src/component.tsx --bundle --format=esm --outfile=dist/component.js --loader:.png=dataurl --loader:.svg=dataurl"
  }
}
```

#### Key points:

- **Single ESM bundle** – one `.js` file for the component, one optional `.css` for styles.
- **Inline assets** – embed images or fonts with `--loader` so you do not have to serve extra files.
- **Minify in production** – add `--minify` to shrink bundle size.

Once built, your MCP server reads `dist/component.js` and inlines it into the resource template. See the [Set up your server guide](/apps-sdk/build/mcp-server) for integration details.

---

### Authentication

#### Authenticate your users

Many Apps SDK apps can operate in a read-only, anonymous mode, but anything that exposes customer-specific data or write actions should authenticate users.

You can integrate with your own authorization server when you need to connect to an existing backend or share data between users.

#### Custom auth with OAuth 2.1

When you need to talk to an external system—CRM records, proprietary APIs, shared datasets—you can integrate a full OAuth 2.1 flow that conforms to the [MCP authorization spec](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization).

##### Components

- **Resource server** – your MCP server, which exposes tools and verifies access tokens on each request.
- **Authorization server** – your identity provider (Auth0, Okta, Cognito, or a custom implementation) that issues tokens and publishes discovery metadata.
- **Client** – ChatGPT acting on behalf of the user. It supports dynamic client registration and PKCE.

##### Required endpoints

Your authorization server must provide:

- `/.well-known/oauth-protected-resource` – lists the authorization servers and required scopes for your MCP endpoint.
- `/.well-known/openid-configuration` – discovery document. It must include:
  - `authorization_endpoint`
  - `token_endpoint` (often `/oauth/token`)
  - `jwks_uri`
  - `registration_endpoint`
- `token_endpoint` – accepts code+PKCE exchanges and returns access tokens.
- `registration_endpoint` – accepts dynamic client registration requests and returns a `client_id`.

##### Flow in practice

1. ChatGPT queries your MCP server for protected resource metadata. You can configure this with `AuthSettings` in the official Python SDK's FastMCP module.
2. ChatGPT registers itself with your authorization server using the `registration_endpoint` and obtains a `client_id`.
3. When the user first invokes a tool, the ChatGPT client launches the OAuth authorization code + PKCE flow. The user authenticates and consents to the requested scopes.
4. ChatGPT exchanges the authorization code for an access token and attaches it to subsequent MCP requests (`Authorization: Bearer <token>`).
5. Your server verifies the token on each request (issuer, audience, expiration, scopes) before executing the tool.

##### Implementing verification

The official Python SDK's FastMCP module ships with helpers for token verification. A simplified example:

File: `server.py`

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

If verification fails, respond with `401 Unauthorized` and a `WWW-Authenticate` header that points back to your protected-resource metadata. This tells the client to run the OAuth flow again.

##### Choosing an authorization provider

[Auth0](https://auth0.com/) is a popular option and supports dynamic client registration, RBAC, and token introspection out of the box. To configure it:

1. Create an API in the Auth0 dashboard and record the identifier (used as the token audience).
2. Enable RBAC and add permissions (for example `user`) so they are embedded in the access token.
3. Turn on OIDC dynamic application registration so ChatGPT can create a client per connector.
4. Ensure at least one login connection is enabled for dynamically created clients so users can sign in.

Okta, Azure AD, and custom OAuth 2.1 servers can follow the same pattern as long as they expose the required metadata.

#### Testing and rollout

- **Local testing** – start with a development tenant that issues short-lived tokens so you can iterate quickly.
- **Dogfood** – once authentication works, gate access to trusted testers before rolling out broadly. You can require linking for specific tools or the entire connector.
- **Rotation** – plan for token revocation, refresh, and scope changes. Your server should treat missing or stale tokens as unauthenticated and return a helpful error message.

With authentication in place you can confidently expose user-specific data and write actions to ChatGPT users.

#### Per‑tool authentication with `securitySchemes`

Different tools often have different access requirements. Listing tools without auth improves discovery and developer ergonomics, but you should enforce authentication at call time for any tool that needs it. Declaring the requirement in metadata helps clients guide the user, while your server remains the source of truth for enforcement.

Our recommendation is to:

- Keep your server discoverable (no auth required for listing)
- Enforce auth per tool call

Scope and semantics:

- Supported scheme types (initial):
  - "noauth" — callable anonymously
  - "oauth2" — requires OAuth 2.0; optional scopes
- Missing field: inherit the server default policy
- Both "noauth" and "oauth2": anonymous works, but authenticating in will unlock more behavior
- Servers must enforce regardless of client hints

You should declare auth requirements in the first-class `securitySchemes` field on each tool. Clients use this to guide users; your server must still validate tokens/scopes on every invocation.

Example (public + optional auth) – TypeScript SDK

```ts
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

Example (auth required) – TypeScript SDK

```ts
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

---

### Storage

#### Why storage matters

Apps SDK handles conversation state automatically, but most real-world apps also need durable storage. You might cache fetched data, keep track of user preferences, or persist artifacts created inside a component. Choosing the right storage model upfront keeps your connector fast, reliable, and compliant.

#### Bring your own backend

If you already run an API or need multi-user collaboration, integrate with your existing storage layer. In this model:

- Authenticate the user via OAuth (see [Authentication](/apps-sdk/build/auth)) so you can map ChatGPT identities to your internal accounts.
- Use your backend's APIs to fetch and mutate data. Keep latency low; users expect components to render in a few hundred milliseconds.
- Return sufficient structured content so the model can understand the data even if the component fails to load.

When you roll your own storage, plan for:

- **Data residency and compliance** – ensure you have agreements in place before transferring PII or regulated data.
- **Rate limits** – protect your APIs against bursty traffic from model retries or multiple active components.
- **Versioning** – include schema versions in stored objects so you can migrate them without breaking existing conversations.

#### Persisting component state

Regardless of where you store authoritative data, design a clear state contract:

- Use `window.openai.setWidgetState` for ephemeral UI state (selected tab, collapsed sections). This state travels with the conversation and is ideal for restoring context after a follow-up prompt.
- Persist durable artifacts in your backend or the managed storage layer. Include identifiers in both the structured content and the `widgetState` payload so you can correlate them later.
- Handle merge conflicts gracefully: if another user updates the underlying data, refresh the component via a follow-up tool call and explain the change in the chat transcript.

#### Operational tips

- **Backups and monitoring** – treat MCP traffic like any other API. Log tool calls with correlation IDs and monitor for error spikes.
- **Data retention** – set clear policies for how long you keep user data and how users can revoke access.
- **Dogfood first** – run the storage path with internal testers before launching broadly so you can validate quotas, schema evolutions, and replay scenarios.

With a storage strategy in place you can safely handle read and write scenarios without compromising user trust.

---

### Examples

#### Overview

The Pizzaz demo app bundles a handful of UI components so you can see the full tool surface area end-to-end. The following sections walk through the MCP server and the component implementations that power those tools.
You can find the "Pizzaz" demo app and other examples in our [examples repository on GitHub](https://github.com/openai/openai-apps-sdk-examples).

Use these examples as blueprints when you assemble your own app.

#### MCP Source

This TypeScript server shows how to register multiple tools that share data with pre-built UI resources. Each resource call returns a Skybridge HTML shell, and every tool responds with matching metadata so ChatGPT knows which component to render.

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

declare const server: McpServer;

// UI resource (no inline data assignment; host will inject data)
server.registerResource(
  "pizza-map",
  "ui://widget/pizza-map.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/pizza-map.html",
        mimeType: "text/html+skybridge",
        text: `
<div id="pizzaz-root"></div>
<link rel="stylesheet" href="https://persistent.oaistatic.com/ecosystem-built-assets/pizzaz-0038.css">
<script type="module" src="https://persistent.oaistatic.com/ecosystem-built-assets/pizzaz-0038.js"></script>
        `.trim(),
      },
    ],
  })
);

server.registerTool(
  "pizza-map",
  {
    title: "Show Pizza Map",
    _meta: {
      "openai/outputTemplate": "ui://widget/pizza-map.html",
      "openai/toolInvocation/invoking": "Hand-tossing a map",
      "openai/toolInvocation/invoked": "Served a fresh map",
    },
    inputSchema: { pizzaTopping: z.string() },
  },
  async () => {
    return {
      content: [{ type: "text", text: "Rendered a pizza map!" }],
      structuredContent: {},
    };
  }
);

server.registerResource(
  "pizza-carousel",
  "ui://widget/pizza-carousel.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/pizzaz-carousel.html",
        mimeType: "text/html+skybridge",
        text: `
<div id="pizzaz-carousel-root"></div>
<link rel="stylesheet" href="https://persistent.oaistatic.com/ecosystem-built-assets/pizzaz-carousel-0038.css">
<script type="module" src="https://persistent.oaistatic.com/ecosystem-built-assets/pizzaz-carousel-0038.js"></script>
        `.trim(),
      },
    ],
  })
);

server.registerTool(
  "pizza-carousel",
  {
    title: "Show Pizza Carousel",
    _meta: {
      "openai/outputTemplate": "ui://widget/pizza-carousel.html",
      "openai/toolInvocation/invoking": "Carousel some spots",
      "openai/toolInvocation/invoked": "Served a fresh carousel",
    },
    inputSchema: { pizzaTopping: z.string() },
  },
  async () => {
    return {
      content: [{ type: "text", text: "Rendered a pizza carousel!" }],
      structuredContent: {},
    };
  }
);

server.registerResource(
  "pizza-albums",
  "ui://widget/pizza-albums.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/pizzaz-albums.html",
        mimeType: "text/html+skybridge",
        text: `
<div id="pizzaz-albums-root"></div>
<link rel="stylesheet" href="https://persistent.oaistatic.com/ecosystem-built-assets/pizzaz-albums-0038.css">
<script type="module" src="https://persistent.oaistatic.com/ecosystem-built-assets/pizzaz-albums-0038.js"></script>
        `.trim(),
      },
    ],
  })
);

server.registerTool(
  "pizza-albums",
  {
    title: "Show Pizza Album",
    _meta: {
      "openai/outputTemplate": "ui://widget/pizza-albums.html",
      "openai/toolInvocation/invoking": "Hand-tossing an album",
      "openai/toolInvocation/invoked": "Served a fresh album",
    },
    inputSchema: { pizzaTopping: z.string() },
  },
  async () => {
    return {
      content: [{ type: "text", text: "Rendered a pizza album!" }],
      structuredContent: {},
    };
  }
);

server.registerResource(
  "pizza-list",
  "ui://widget/pizza-list.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/pizzaz-list.html",
        mimeType: "text/html+skybridge",
        text: `
<div id="pizzaz-list-root"></div>
<link rel="stylesheet" href="https://persistent.oaistatic.com/ecosystem-built-assets/pizzaz-list-0038.css">
<script type="module" src="https://persistent.oaistatic.com/ecosystem-built-assets/pizzaz-list-0038.js"></script>
        `.trim(),
      },
    ],
  })
);

server.registerTool(
  "pizza-list",
  {
    title: "Show Pizza List",
    _meta: {
      "openai/outputTemplate": "ui://widget/pizza-list.html",
      "openai/toolInvocation/invoking": "Hand-tossing a list",
      "openai/toolInvocation/invoked": "Served a fresh list",
    },
    inputSchema: { pizzaTopping: z.string() },
  },
  async () => {
    return {
      content: [{ type: "text", text: "Rendered a pizza list!" }],
      structuredContent: {},
    };
  }
);

server.registerResource(
  "pizza-video",
  "ui://widget/pizza-video.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/pizzaz-video.html",
        mimeType: "text/html+skybridge",
        text: `
<div id="pizzaz-video-root"></div>
<link rel="stylesheet" href="https://persistent.oaistatic.com/ecosystem-built-assets/pizzaz-video-0038.css">
<script type="module" src="https://persistent.oaistatic.com/ecosystem-built-assets/pizzaz-video-0038.js"></script>
        `.trim(),
      },
    ],
  })
);

server.registerTool(
  "pizza-video",
  {
    title: "Show Pizza Video",
    _meta: {
      "openai/outputTemplate": "ui://widget/pizza-video.html",
      "openai/toolInvocation/invoking": "Hand-tossing a video",
      "openai/toolInvocation/invoked": "Served a fresh video",
    },
    inputSchema: { pizzaTopping: z.string() },
  },
  async () => {
    return {
      content: [{ type: "text", text: "Rendered a pizza video!" }],
      structuredContent: {},
    };
  }
);
```

#### Pizzaz Map Source

![Screenshot of the Pizzaz map component](/images/apps-sdk/pizzaz-map.png)

The map component is a React + Mapbox client that syncs its state back to ChatGPT. It renders marker interactions, inspector routing, and fullscreen handling so you can study a heavier, stateful component example.

```ts
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createRoot } from "react-dom/client";
import markers from "./markers.json";
import { AnimatePresence } from "framer-motion";
import Inspector from "./Inspector";
import Sidebar from "./Sidebar";
import { useOpenaiGlobal } from "../use-openai-global";
import { useMaxHeight } from "../use-max-height";
import { Maximize2 } from "lucide-react";
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  BrowserRouter,
  Outlet,
} from "react-router-dom";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZXJpY25pbmciLCJhIjoiY21icXlubWM1MDRiczJvb2xwM2p0amNyayJ9.n-3O6JI5nOp_Lw96ZO5vJQ";

function fitMapToMarkers(map, coords) {
  if (!map || !coords.length) return;
  if (coords.length === 1) {
    map.flyTo({ center: coords[0], zoom: 12 });
    return;
  }
  const bounds = coords.reduce(
    (b, c) => b.extend(c),
    new mapboxgl.LngLatBounds(coords[0], coords[0])
  );
  map.fitBounds(bounds, { padding: 60, animate: true });
}

export default function App() {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const markerObjs = useRef([]);
  const places = markers?.places || [];
  const markerCoords = places.map((p) => p.coords);
  const navigate = useNavigate();
  const location = useLocation();
  const selectedId = React.useMemo(() => {
    const match = location?.pathname?.match(/(?:^|\/)place\/([^/]+)/);
    return match && match[1] ? match[1] : null;
  }, [location?.pathname]);
  const selectedPlace = places.find((p) => p.id === selectedId) || null;
  const [viewState, setViewState] = useState(() => ({
    center: markerCoords.length > 0 ? markerCoords[0] : [0, 0],
    zoom: markerCoords.length > 0 ? 12 : 2,
  }));
  const displayMode = useOpenaiGlobal("displayMode");
  const allowInspector = displayMode === "fullscreen";
  const maxHeight = useMaxHeight() ?? undefined;

  useEffect(() => {
    if (mapObj.current) return;
    mapObj.current = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: markerCoords.length > 0 ? markerCoords[0] : [0, 0],
      zoom: markerCoords.length > 0 ? 12 : 2,
      attributionControl: false,
    });
    addAllMarkers(places);
    setTimeout(() => {
      fitMapToMarkers(mapObj.current, markerCoords);
    }, 0);
    // after first paint
    requestAnimationFrame(() => mapObj.current.resize());

    // or keep it in sync with window resizes
    window.addEventListener("resize", mapObj.current.resize);

    return () => {
      window.removeEventListener("resize", mapObj.current.resize);
      mapObj.current.remove();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!mapObj.current) return;
    const handler = () => {
      const c = mapObj.current.getCenter();
      setViewState({ center: [c.lng, c.lat], zoom: mapObj.current.getZoom() });
    };
    mapObj.current.on("moveend", handler);
    return () => {
      mapObj.current.off("moveend", handler);
    };
  }, []);

  function addAllMarkers(placesList) {
    markerObjs.current.forEach((m) => m.remove());
    markerObjs.current = [];
    // ... marker implementation continues
  }

  // ... rest of component implementation
}
```

#### Pizzaz Carousel Source

![Screenshot of the Pizzaz carousel component](/images/apps-sdk/pizzaz-carousel.png)

This carousel demonstrates how to build a lightweight gallery view. It leans on embla-carousel for touch-friendly scrolling and wires up button state so the component stays reactive without any server roundtrips.

```ts
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import React from "react";
import { Star } from "lucide-react";
import { createRoot } from "react-dom/client";
import markers from "../pizzaz/markers.json";
import PlaceCard from "./PlaceCard";

function App() {
  const places = markers?.places || [];
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: false,
    containScroll: "trimSnaps",
    slidesToScroll: "auto",
    dragFree: false,
  });
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);

  React.useEffect(() => {
    if (!emblaApi) return;
    const updateButtons = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    updateButtons();
    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);
    return () => {
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi]);

  return (
    <div className="antialiased relative w-full text-black py-5">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 items-stretch">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </div>
      {/* Edge gradients */}
      <div
        aria-hidden
        className={
          "pointer-events-none absolute inset-y-0 left-0 w-3 z-[5] transition-opacity duration-200 " +
          (canPrev ? "opacity-100" : "opacity-0")
        }
      >
        <div
          className="h-full w-full border-l border-black/15 bg-gradient-to-r from-black/10 to-transparent"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, white 30%, white 70%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, white 30%, white 70%, transparent 100%)",
          }}
        />
      </div>
      <div
        aria-hidden
        className={
          "pointer-events-none absolute inset-y-0 right-0 w-3 z-[5] transition-opacity duration-200 " +
          (canNext ? "opacity-100" : "opacity-0")
        }
      >
        <div
          className="h-full w-full border-r border-black/15 bg-gradient-to-l from-black/10 to-transparent"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, white 30%, white 70%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, white 30%, white 70%, transparent 100%)",
          }}
        />
      </div>
      {canPrev && (
        <button
          aria-label="Previous"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center h-8 w-8 rounded-full bg-white text-black shadow-lg ring ring-black/5 hover:bg-white"
          onClick={() => emblaApi && emblaApi.scrollPrev()}
          type="button"
        >
          <ArrowLeft
            strokeWidth={1.5}
            className="h-4.5 w-4.5"
            aria-hidden="true"
          />
        </button>
      )}
      {canNext && (
        <button
          aria-label="Next"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center h-8 w-8 rounded-full bg-white text-black shadow-lg ring ring-black/5 hover:bg-white"
          onClick={() => emblaApi && emblaApi.scrollNext()}
          type="button"
        >
          <ArrowRight
            strokeWidth={1.5}
            className="h-4.5 w-4.5"
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}

createRoot(document.getElementById("pizzaz-carousel-root")).render(<App />);
```

#### Pizzaz List Source

![Screenshot of the Pizzaz list component](/images/apps-sdk/pizzaz-list.png)

This list layout mirrors what you might embed in a chat-initiated itinerary or report. It balances a hero summary with a scrollable ranking so you can experiment with denser information hierarchies inside a component.

```ts
import React from "react";
import { createRoot } from "react-dom/client";
import markers from "../pizzaz/markers.json";
import { PlusCircle, Star } from "lucide-react";

function App() {
  const places = markers?.places || [];

  return (
    <div className="antialiased w-full text-black px-4 pb-2 border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden">
      <div className="max-w-full">
        <div className="flex flex-row items-center gap-4 sm:gap-4 border-b border-black/5 py-4">
          <div
            className="sm:w-18 w-16 aspect-square rounded-xl bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://plus.unsplash.com/premium_photo-1675884306775-a0db978623a0?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDV8fHBpenphJTIwd2FsbHBhcGVyfGVufDB8fDB8fHww)",
            }}
          ></div>
          <div>
            <div className="text-base sm:text-xl font-medium">
              National Best Pizza List
            </div>
            <div className="text-sm text-black/60">
              A ranking of the best pizzerias in the world
            </div>
          </div>
          <div className="flex-auto hidden sm:flex justify-end pr-2">
            <button
              type="button"
              className="cursor-pointer inline-flex items-center rounded-full bg-[#F46C21] text-white px-4 py-1.5 sm:text-md text-sm font-medium hover:opacity-90 active:opacity-100"
            >
              Save List
            </button>
          </div>
        </div>
        <div className="min-w-full text-sm flex flex-col">
          {places.slice(0, 7).map((place, i) => (
            <div
              key={place.id}
              className="px-3 -mx-2 rounded-2xl hover:bg-black/5"
            >
              <div
                style={{
                  borderBottom:
                    i === 7 - 1 ? "none" : "1px solid rgba(0, 0, 0, 0.05)",
                }}
                className="flex w-full items-center hover:border-black/0! gap-2"
              >
                <div className="py-3 pr-3 min-w-0 w-full sm:w-3/5">
                  <div className="flex items-center gap-3">
                    <img
                      src={place.thumbnail}
                      alt={place.name}
                      className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg object-cover ring ring-black/5"
                    />
                    <div className="w-3 text-end sm:block hidden text-sm text-black/40">
                      {i + 1}
                    </div>
                    <div className="min-w-0 sm:pl-1 flex flex-col items-start h-full">
                      <div className="font-medium text-sm sm:text-md truncate max-w-[40ch]">
                        {place.name}
                      </div>
                      <div className="mt-1 sm:mt-0.25 flex items-center gap-3 text-black/70 text-sm">
                        <div className="flex items-center gap-1">
                          <Star
                            strokeWidth={1.5}
                            className="h-3 w-3 text-black"
                          />
                          <span>
                            {place.rating?.toFixed
                              ? place.rating.toFixed(1)
                              : place.rating}
                          </span>
                        </div>
                        <div className="whitespace-nowrap sm:hidden">
                          {place.city || "–"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block text-end py-2 px-3 text-sm text-black/60 whitespace-nowrap flex-auto">
                  {place.city || "–"}
                </div>
                <div className="py-2 whitespace-nowrap flex justify-end">
                  <PlusCircle strokeWidth={1.5} className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
          {places.length === 0 && (
            <div className="py-6 text-center text-black/60">
              No pizzerias found.
            </div>
          )}
        </div>
        <div className="sm:hidden px-0 pt-2 pb-2">
          <button
            type="button"
            className="w-full cursor-pointer inline-flex items-center justify-center rounded-full bg-[#F46C21] text-white px-4 py-2 font-medium hover:opacity-90 active:opacity-100"
          >
            Save List
          </button>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("pizzaz-list-root")).render(<App />);
```

#### Pizzaz Video Source

The video component wraps a scripted player that tracks playback, overlays controls, and reacts to fullscreen changes. Use it as a reference for media-heavy experiences that still need to integrate with the ChatGPT container APIs.

```javascript
import { Maximize2, Play } from "lucide-react";
import React from "react";
import { createRoot } from "react-dom/client";
import { useMaxHeight } from "../use-max-height";
import { useOpenaiGlobal } from "../use-openai-global";
import script from "./script.json";

function App() {
  return (
    <div className="antialiased w-full text-black">
      <VideoPlayer />
    </div>
  );
}

createRoot(document.getElementById("pizzaz-video-root")).render(<App />);


export default function VideoPlayer() {
  const videoRef = React.useRef(null);
  const [showControls, setShowControls] = React.useState(false);
  const [showOverlayPlay, setShowOverlayPlay] = React.useState(true);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const lastBucketRef = React.useRef(null);
  const isPlayingRef = React.useRef(false);
  const [activeTab, setActiveTab] = React.useState("summary");
  const [currentTime, setCurrentTime] = React.useState(0);

  // Video player implementation with playback tracking,
  // fullscreen handling, and ChatGPT container API integration
  // Full source available in the examples repository
}
```

---

## Deploy

Learn how to deploy your MCP server

### Deployment options

Once you have a working MCP server and component bundle, host them behind a stable HTTPS endpoint. Deployment platforms that work well with Apps SDK include:

- **Managed containers** – Fly.io, Render, or Railway for quick spin-up and automatic TLS.
- **Cloud serverless** – Google Cloud Run or Azure Container Apps if you need scale-to-zero, keeping in mind that long cold starts can interrupt streaming HTTP.
- **Kubernetes** – for teams that already run clusters. Front your pods with an ingress controller that supports server-sent events.

Regardless of platform, make sure `/mcp` stays responsive, supports streaming responses, and returns appropriate HTTP status codes for errors.

### Local development

During development you can expose your local server to ChatGPT using a tunnel such as ngrok:

```bash
ngrok http 2091
# https://<subdomain>.ngrok.app/mcp → http://127.0.0.1:2091/mcp
```

Keep the tunnel running while you iterate on your connector. When you change code:

1. Rebuild the component bundle (`npm run build`).
2. Restart your MCP server.
3. Refresh the connector in ChatGPT settings to pull the latest metadata.

### Environment configuration

- **Secrets** – store API keys or OAuth client secrets outside your repo. Use platform-specific secret managers and inject them as environment variables.
- **Logging** – log tool-call IDs, request latency, and error payloads. This helps debug user reports once the connector is live.
- **Observability** – monitor CPU, memory, and request counts so you can right-size your deployment.

### Dogfood and rollout

Before launching broadly:

1. **Gate access** – keep your connector behind developer mode or a Statsig experiment flag until you are confident in stability.
2. **Run golden prompts** – exercise the discovery prompts you drafted during planning and note precision/recall changes with each release.
3. **Capture artifacts** – record screenshots or screen captures showing the component in MCP Inspector and ChatGPT for reference.

When you are ready for production, update directory metadata, confirm auth and storage are configured correctly, and publish change notes in Release Notes.

### Next steps

- Connect your deployed endpoint to ChatGPT using the steps in Connect from ChatGPT.
- Validate tooling and telemetry with the Test your integration guide.
- Keep a troubleshooting playbook handy via Troubleshooting so on-call responders can quickly diagnose issues.

---

### Connect from ChatGPT

Connect your app to ChatGPT clients.

#### Before you begin

Connecting your MCP server to ChatGPT requires developer mode access:

- Ask your OpenAI partner contact to add you to the connectors developer experiment.
- If you are on ChatGPT Enterprise, have your workspace admin enable connector creation for your account.
- Toggle **Settings → Connectors → Advanced → Developer mode** in the ChatGPT client.

Once developer mode is active you will see a **Create** button under Settings → Connectors.

#### Create a connector

1. Ensure your MCP server is reachable over HTTPS (for local development, expose it via ngrok).
2. In ChatGPT, navigate to **Settings → Connectors → Create**.
3. Provide the metadata for your connector:
   - **Connector name** – a user-facing title such as _Kanban board_.
   - **Description** – explain what the connector does and when to use it. The model uses this text during discovery.
   - **Connector URL** – the public `/mcp` endpoint of your server (for example `https://abc123.ngrok.app/mcp`).
4. Click **Create**. If the connection succeeds you will see a list of the tools your server advertises. If it fails, use the Testing guide to debug with MCP Inspector or the API Playground.

#### Enable the connector in a conversation

1. Open a new chat in ChatGPT.
2. Click the **+** button near the message composer and choose **Developer mode**.
3. Toggle on your connector in the list of available tools. Linked tools are now available for the assistant to call automatically.
4. Prompt the model explicitly while you validate the integration. For example, "Use the Kanban board connector to show my tasks." Once discovery metadata is dialled in you can rely on indirect prompts.

ChatGPT will display tool-call payloads in the UI so you can confirm inputs and outputs. Write tools will require manual confirmation unless you choose to remember approvals for the conversation.

#### Refreshing metadata

Whenever you change your tool list or descriptions:

1. Update your MCP server and redeploy it.
2. In **Settings → Connectors**, click into your connector and choose **Refresh**.
3. Verify the tool list updates and try a few prompts to ensure discovery still works.

#### Connecting other clients

- **API Playground** – visit `https://platform.openai.com/playground`, open **Tools → Add → MCP Server**, and paste the same HTTPS endpoint. This is useful when you want raw request/response logs.
- **Mobile clients** – once the connector is linked on web it is available on ChatGPT mobile apps as well. Test mobile layouts early if your component has custom controls.

With the connector linked you can move on to validation, experiments, and eventual rollout.

---

### Test your integration

Testing strategies for Apps SDK apps.

#### Goals

Testing validates that your connector behaves predictably before you expose it to users. Focus on three areas: tool correctness, component UX, and discovery precision.

#### Unit test your tool handlers

- Exercise each tool function directly with representative inputs. Verify schema validation, error handling, and edge cases (empty results, missing IDs).
- Include automated tests for authentication flows if you issue tokens or require linking.
- Keep test fixtures close to your MCP code so they stay up to date as schemas evolve.

#### Use MCP Inspector during development

The MCP Inspector is the fastest way to debug your server locally:

1. Run your MCP server.
2. Launch the inspector: `npx @modelcontextprotocol/inspector@latest`.
3. Enter your server URL (for example `http://127.0.0.1:2091/mcp`).
4. Click **List Tools** and **Call Tool** to inspect the raw requests and responses.

Inspector renders components inline and surfaces errors immediately. Capture screenshots for your launch review.

#### Validate in ChatGPT developer mode

After your connector is reachable over HTTPS:

1. Link it in **Settings → Connectors → Developer mode**.
2. Toggle it on in a new conversation and run through your golden prompt set (direct, indirect, negative). Record when the model selects the right tool, what arguments it passed, and whether confirmation prompts appear as expected.
3. Test mobile layouts by invoking the connector in the ChatGPT iOS or Android apps.

#### Connect via the API Playground

If you need raw logs or want to test without the full ChatGPT UI, open the API Playground:

1. Choose **Tools → Add → MCP Server**.
2. Provide your HTTPS endpoint and connect.
3. Issue test prompts and inspect the JSON request/response pairs in the right-hand panel.

#### Regression checklist before launch

- Tool list matches your documentation and unused prototypes are removed.
- Structured content matches the declared `outputSchema` for every tool.
- Widgets render without console errors, inject their own styling, and restore state correctly.
- OAuth or custom auth flows return valid tokens and reject invalid ones with meaningful messages.
- Discovery behaves as expected across your golden prompts and does not trigger on negative prompts.

Capture findings in a doc so you can compare results release over release. Consistent testing keeps your connector reliable as ChatGPT and your backend evolve.

---