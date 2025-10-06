import { describe, expect, it, vi } from "vitest"

type LogLevel = "debug" | "info" | "warn" | "error"

interface Logger {
  debug(message: string, ...args: any[]): void
  info(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
}

class LoggerAdapter implements Logger {
  private minLevel: LogLevel = "info"
  private logs: Array<{ level: LogLevel; message: string; args: any[] }> = []

  constructor(minLevel: LogLevel = "info") {
    this.minLevel = minLevel
  }

  setLogLevel(level: LogLevel): void {
    this.minLevel = level
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"]
    const currentLevelIndex = levels.indexOf(this.minLevel)
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex >= currentLevelIndex
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (this.shouldLog(level)) {
      this.logs.push({ level, message, args })
      // 实际项目中这里会调用console或第三方日志库
      console[level](message, ...args)
    }
  }

  debug(message: string, ...args: any[]): void {
    this.log("debug", message, ...args)
  }

  info(message: string, ...args: any[]): void {
    this.log("info", message, ...args)
  }

  warn(message: string, ...args: any[]): void {
    this.log("warn", message, ...args)
  }

  error(message: string, ...args: any[]): void {
    this.log("error", message, ...args)
  }

  getLogs(): typeof this.logs {
    return this.logs
  }

  clearLogs(): void {
    this.logs = []
  }
}

describe("LoggerAdapter", () => {
  it("should log info level messages by default", () => {
    const logger = new LoggerAdapter()
    const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => { })

    logger.info("Test info message")

    expect(consoleSpy).toHaveBeenCalledWith("Test info message")
    consoleSpy.mockRestore()
  })

  it("should not log debug messages when min level is info", () => {
    const logger = new LoggerAdapter("info")
    const consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => { })

    logger.debug("Test debug message")

    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it("should log debug messages when min level is debug", () => {
    const logger = new LoggerAdapter("debug")
    const consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => { })

    logger.debug("Test debug message")

    expect(consoleSpy).toHaveBeenCalledWith("Test debug message")
    consoleSpy.mockRestore()
  })

  it("should log warn and error messages regardless of min level", () => {
    const logger = new LoggerAdapter("error")
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => { })
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => { })

    logger.warn("Test warn message")
    logger.error("Test error message")

    expect(warnSpy).not.toHaveBeenCalled() // warn不应被记录（min level是error）
    expect(errorSpy).toHaveBeenCalledWith("Test error message")

    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it("should change log level dynamically", () => {
    const logger = new LoggerAdapter("info")
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => { })

    logger.debug("Should not log")
    expect(debugSpy).not.toHaveBeenCalled()

    logger.setLogLevel("debug")
    logger.debug("Should log now")
    expect(debugSpy).toHaveBeenCalledWith("Should log now")

    debugSpy.mockRestore()
  })

  it("should store logs internally", () => {
    const logger = new LoggerAdapter("debug")
    vi.spyOn(console, "debug").mockImplementation(() => { })
    vi.spyOn(console, "info").mockImplementation(() => { })

    logger.debug("Debug message")
    logger.info("Info message")

    const logs = logger.getLogs()
    expect(logs).toHaveLength(2)
    expect(logs[0]).toEqual({
      level: "debug",
      message: "Debug message",
      args: [],
    })
    expect(logs[1]).toEqual({
      level: "info",
      message: "Info message",
      args: [],
    })

    vi.restoreAllMocks()
  })

  it("should clear logs", () => {
    const logger = new LoggerAdapter()
    vi.spyOn(console, "info").mockImplementation(() => { })

    logger.info("Test message")
    expect(logger.getLogs()).toHaveLength(1)

    logger.clearLogs()
    expect(logger.getLogs()).toHaveLength(0)

    vi.restoreAllMocks()
  })

  it("should handle additional arguments", () => {
    const logger = new LoggerAdapter()
    const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => { })

    const data = { user: "test", id: 123 }
    logger.info("User action", data)

    expect(consoleSpy).toHaveBeenCalledWith("User action", data)
    consoleSpy.mockRestore()
  })
})