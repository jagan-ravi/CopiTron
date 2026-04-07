import * as vscode from "vscode"
import { MessageStore } from "./message-store"
import { ProxyServer } from "./proxy-server"
import { registerAllTools } from "./lm-tools/register-all"
import { registerChatParticipant } from "./chat-participant"
import { createStatusBar } from "./status-bar"
import { registerCommands } from "./commands"

let store: MessageStore
let proxy: ProxyServer | null = null
let outputChannel: vscode.OutputChannel
let updateStatusBar: (() => void) | null = null

function log(msg: string) {
  const ts = new Date().toLocaleTimeString()
  outputChannel?.appendLine(`[${ts}] ${msg}`)
}

function readConfig() {
  const config = vscode.workspace.getConfiguration("reactotron")
  return {
    proxyPort: config.get<number>("proxyPort", 9091),
    reactotronPort: config.get<number>("reactotronPort", 9090),
    timeout: config.get<number>("timeout", 5000),
    adbReversePort: config.get<number>("adbReversePort", 9091),
    adbReverseAutoEnable: config.get<boolean>("adbReverseAutoEnable", true),
    autoStart: config.get<boolean>("autoStart", true),
  }
}

function startProxy() {
  if (proxy) return
  const cfg = readConfig()
  proxy = new ProxyServer(store, {
    proxyPort: cfg.proxyPort,
    reactotronPort: cfg.reactotronPort,
    timeout: cfg.timeout,
    log,
  })
  proxy.on("connectionChange", (connected: boolean) => {
    log(`App connection changed: ${connected ? "connected" : "disconnected"}`)
    updateStatusBar?.()
  })
  proxy.on("upstreamConnectionChange", (connected: boolean) => {
    log(`Reactotron Desktop connection changed: ${connected ? "connected" : "disconnected"}`)
    updateStatusBar?.()
  })
  proxy.start()
  updateStatusBar?.()
  log(`Proxy started on port ${cfg.proxyPort} (upstream Reactotron: ${cfg.reactotronPort})`)
}

function stopProxy() {
  if (!proxy) return
  proxy.dispose()
  proxy = null
  updateStatusBar?.()
}

export function activate(context: vscode.ExtensionContext): void {
  outputChannel = vscode.window.createOutputChannel("Reactotron")
  context.subscriptions.push(outputChannel)

  store = new MessageStore()
  const cfg = readConfig()

  if (cfg.autoStart) {
    startProxy()
  }

  // Optionally run adb reverse for the configured port
  if (cfg.adbReverseAutoEnable) {
    try {
      const adb = require("child_process").execSync
      const cmd = `adb reverse tcp:${cfg.adbReversePort} tcp:${cfg.adbReversePort}`
      log(`Running: ${cmd}`)
      adb(cmd)
      log(`ADB reverse configured for port ${cfg.adbReversePort}`)
    } catch (e: any) {
      log(`ADB reverse failed: ${e?.message || e}`)
    }
  }

  // Use getters so tools/participant always see the current proxy, even after restart
  const proxyRef = { get current() { return proxy! } }
  registerAllTools(context, store, proxyRef)
  registerChatParticipant(context, store, proxyRef)

  const statusBar = createStatusBar(context, () => proxy)
  updateStatusBar = statusBar.update

  registerCommands(
    context,
    store,
    () => proxy,
    startProxy,
    stopProxy,
  )

  log(
    `Extension activated. Proxy ${cfg.autoStart ? `listening on port ${cfg.proxyPort}` : "not started (autoStart disabled)"}.`,
  )
}

export function deactivate(): void {
  stopProxy()
}
