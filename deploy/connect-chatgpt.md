---
layout: default
title: Connect from ChatGPT
lang: en
---

# Connect from ChatGPT

Connect your app to ChatGPT clients.

## Before you begin

Connecting your MCP server to ChatGPT requires developer mode access:

- Ask your OpenAI partner contact to add you to the connectors developer experiment.
- If you are on ChatGPT Enterprise, have your workspace admin enable connector creation for your account.
- Toggle **Settings → Connectors → Advanced → Developer mode** in the ChatGPT client.

Once developer mode is active you will see a **Create** button under Settings → Connectors.

## Create a connector

- Ensure your MCP server is reachable over HTTPS (for local development, expose it via ngrok).
- In ChatGPT, navigate to **Settings → Connectors → Create**.
- Provide the metadata for your connector:
  - **Connector name** - a user-facing title such as *Kanban board*.
  - **Description** - explain what the connector does and when to use it. The model uses this text during discovery.
  - **Connector URL** - the public `/mcp` endpoint of your server (for example `https://abc123.ngrok.app/mcp`).
- Click **Create**. If the connection succeeds you will see a list of the tools your server advertises. If it fails, use the [Testing](https://developers.openai.com/apps-sdk/deploy/testing) guide to debug with MCP Inspector or the API Playground.

## Enable the connector in a conversation

- Open a new chat in ChatGPT.
- Click the **+** button near the message composer and choose **Developer mode**.
- Toggle on your connector in the list of available tools. Linked tools are now available for the assistant to call automatically.
- Prompt the model explicitly while you validate the integration. For example, "Use the Kanban board connector to show my tasks." Once discovery metadata is dialled in you can rely on indirect prompts.

ChatGPT will display tool-call payloads in the UI so you can confirm inputs and outputs. Write tools will require manual confirmation unless you choose to remember approvals for the conversation.

## Refreshing metadata

Whenever you change your tool list or descriptions:

- Update your MCP server and redeploy it.
- In **Settings → Connectors**, click into your connector and choose **Refresh**.
- Verify the tool list updates and try a few prompts to ensure discovery still works.

## Connecting other clients

- **API Playground** - visit `https://platform.openai.com/playground`, open **Tools → Add → MCP Server**, and paste the same HTTPS endpoint. This is useful when you want raw request/response logs.
- **Mobile clients** - once the connector is linked on web it is available on ChatGPT mobile apps as well. Test mobile layouts early if your component has custom controls.

With the connector linked you can move on to validation, experiments, and eventual rollout.
