# Reactotron Extension — Copilot Instructions

This workspace is a VS Code extension that connects to React / React Native apps via Reactotron.

## Available Reactotron Tools

When the user is debugging a React or React Native app, use the following tools automatically — **you do not need to be asked explicitly**:

| Tool | When to use |
|------|-------------|
| `reactotron-mcp_getConnectionStatus` | Check if an app is connected before using other tools |
| `reactotron-mcp_getLogs` | User mentions logs, console output, warnings, or errors |
| `reactotron-mcp_getErrors` | User asks about errors, crashes, failures, or "what's broken" |
| `reactotron-mcp_getNetwork` | User mentions API calls, network requests, fetch, HTTP, REST, endpoints |
| `reactotron-mcp_getState` | User asks about app state, Redux store, MobX tree, or specific state paths |
| `reactotron-mcp_getStateActions` | User mentions dispatched actions, Redux actions, or "what actions fired" |
| `reactotron-mcp_getStateChanges` | User asks about state mutations or what changed in state |
| `reactotron-mcp_getBenchmarks` | User asks about performance, slow operations, benchmarks |
| `reactotron-mcp_getTimeline` | User asks for a timeline, sequence of events, or "what happened" |
| `reactotron-mcp_getDisplays` | User mentions display messages, custom debug output |
| `reactotron-mcp_getImages` | User asks about logged images |
| `reactotron-mcp_getAppInfo` | User asks about the connected app's name, version, or platform |
| `reactotron-mcp_listCustomCommands` | User asks what custom commands are available |
| `reactotron-mcp_dispatchAction` | User wants to dispatch a Redux/MST action to the app |
| `reactotron-mcp_runCustomCommand` | User wants to trigger a custom command in the app |
| `reactotron-mcp_clearMessages` | User wants to clear captured messages |

## Best Practices

- Always call `getConnectionStatus` first if unsure whether an app is connected.
- Combine multiple tools for comprehensive debugging (e.g., logs + network + state for a full picture).
- When investigating errors, also check network failures and error-level logs.
- When tracing an action, check state actions → state changes → logs → network in sequence.
- Use the `@reactotron` chat participant for guided debugging workflows.
