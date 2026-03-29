import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "../ThemeProvider";
import { useThemeContext } from "../useTheme";

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <ThemeProvider>{children}</ThemeProvider>;
  };
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    window.localStorage.removeItem("tutory-theme");
  });

  afterEach(() => {
    window.localStorage.removeItem("tutory-theme");
  });

  it("starts with sunny-playroom as the default theme", async () => {
    const { result } = renderHook(() => useThemeContext(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.theme).toBe("sunny-playroom");
      expect(document.documentElement.dataset.theme).toBe("sunny-playroom");
    });
  });

  it("reads a stored theme from localStorage", async () => {
    window.localStorage.setItem("tutory-theme", "forest-adventure");

    const { result } = renderHook(() => useThemeContext(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.theme).toBe("forest-adventure");
      expect(document.documentElement.dataset.theme).toBe("forest-adventure");
    });
  });

  it("switches theme when setTheme is called", async () => {
    const { result } = renderHook(() => useThemeContext(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setTheme("ocean-lab");
    });

    await waitFor(() => {
      expect(result.current.theme).toBe("ocean-lab");
      expect(document.documentElement.dataset.theme).toBe("ocean-lab");
      expect(window.localStorage.getItem("tutory-theme")).toBe("ocean-lab");
    });
  });

  it("falls back to default when localStorage contains an invalid value", async () => {
    window.localStorage.setItem("tutory-theme", "invalid-theme");

    const { result } = renderHook(() => useThemeContext(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.theme).toBe("sunny-playroom");
    });
  });
});
