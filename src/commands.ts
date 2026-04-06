import * as vscode from "vscode"
import type { MessageStore } from "./message-store"
import type { ProxyServer } from "./proxy-server"

export function registerCommands(
  context: vscode.ExtensionContext,
  store: MessageStore,
  getProxy: () => ProxyServer | null,
  startProxy: () => void,
  stopProxy: () => void,
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("reactotron-mcp.startProxy", () => {
      startProxy()
      vscode.window.showInformationMessage("Reactotron proxy started.")
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("reactotron-mcp.stopProxy", () => {
      stopProxy()
      vscode.window.showInformationMessage("Reactotron proxy stopped.")
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("reactotron-mcp.restartProxy", () => {
      stopProxy()
      startProxy()
      vscode.window.showInformationMessage("Reactotron proxy restarted.")
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("reactotron-mcp.clearMessages", () => {
      const count = store.clear()
      vscode.window.showInformationMessage(`Cleared ${count} Reactotron message(s).`)
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("reactotron-mcp.showConnectionInfo", () => {
      const proxy = getProxy()
      if (!proxy) {
        vscode.window.showWarningMessage("Reactotron proxy is not running.")
        return
      }

      const lines: string[] = [`Proxy listening on port ${proxy.proxyPort}`]

      if (proxy.connected) {
        lines.push("App: Connected")
        const info = store.clientInfo
        if (info?.name) lines.push(`App: ${info.name}${info.version ? ` v${info.version}` : ""}`)
        if (info?.platform) lines.push(`Platform: ${info.platform}`)
        if (info?.reactNativeVersion) lines.push(`React Native: ${info.reactNativeVersion}`)
      } else {
        lines.push("App: Not connected")
      }

      lines.push(proxy.reactotronConnected ? "Reactotron Desktop: Connected" : "Reactotron Desktop: Not connected")

      vscode.window.showInformationMessage(lines.join(" | "))
    }),
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("reactotron-mcp.adbReverse", () => {
      const config = vscode.workspace.getConfiguration("reactotron")
      const port = config.get<number>("adbReversePort", 9091)
      try {
        const execSync = require("child_process").execSync
        const cmd = `adb reverse tcp:${port} tcp:${port}`
        execSync(cmd)
        vscode.window.showInformationMessage(`adb reverse configured for port ${port}`)
      } catch (e: any) {
        vscode.window.showErrorMessage(`adb reverse failed: ${e?.message || e}`)
      }
    }),
  )
}
