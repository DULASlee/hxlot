import { describe, it, expect, beforeEach, vi } from "vitest"
import { AuthService, TokenInfo } from "@/utils/auth"

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

// Mock fetch
global.fetch = vi.fn()

// Mock window.setTimeout and clearTimeout
vi.useFakeTimers()

beforeEach(() => {
  ;(localStorage as any) = localStorageMock
  vi.mocked(fetch).mockClear()
})

describe("AuthService", () => {
  let authService: AuthService

  beforeEach(() => {
    authService = AuthService.getInstance()
    localStorage.clear()
  })

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockToken: TokenInfo = {
        access_token: "valid_token",
        refresh_token: "valid_refresh_token",
        token_type: "Bearer",
        expires_in: 3600,
        expires_at: Date.now() + 3600 * 1000,
      }

      vi.mocked(fetch).mockResolvedValueOnce(Response.json(mockToken))

      const result = await authService.login("test_user", "password")

      expect(result).toBe(true)
      expect(authService.getTokenInfo()).toEqual(mockToken)
    })

    it("should handle login failure with invalid credentials", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ error_description: "Invalid credentials" }), {
          status: 401,
          statusText: "Unauthorized",
        }),
      )

      await expect(authService.login("invalid_user", "wrong_password")).rejects.toThrow("登录失败")
    })
  })

  describe("logout", () => {
    it("should clear all stored data and reset state", async () => {
      localStorage.setItem("smartabp_token", "token_data")
      localStorage.setItem("smartabp_user", "user_data")

      await authService.logout()

      expect(localStorage.getItem("smartabp_token")).toBeNull()
      expect(localStorage.getItem("smartabp_user")).toBeNull()
    })
  })

  describe("refreshToken", () => {
    it("should refresh token successfully", async () => {
      const mockToken: TokenInfo = {
        access_token: "new_token",
        refresh_token: "new_refresh_token",
        token_type: "Bearer",
        expires_in: 3600,
        expires_at: Date.now() + 3600 * 1000,
      }

      vi.mocked(fetch).mockResolvedValueOnce(Response.json(mockToken))

      localStorage.setItem(
        "smartabp_token",
        JSON.stringify({
          access_token: "old_token",
          refresh_token: "old_refresh_token",
          token_type: "Bearer",
          expires_in: 3600,
          expires_at: Date.now() + 3600 * 1000,
        }),
      )

      const result = await authService.refreshToken()

      expect(result).toBe(true)
      expect(authService.getTokenInfo()).toEqual(mockToken)
    })

    it("should handle refresh failure and logout", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(new Response("", { status: 401 }))

      localStorage.setItem(
        "smartabp_token",
        JSON.stringify({
          access_token: "old_token",
          refresh_token: "old_refresh_token",
          token_type: "Bearer",
          expires_in: 3600,
          expires_at: Date.now() + 3600 * 1000,
        }),
      )

      const result = await authService.refreshToken()

      expect(result).toBe(false)
    })
  })
})
