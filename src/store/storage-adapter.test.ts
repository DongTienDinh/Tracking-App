import { afterEach, describe, expect, it, vi } from "vitest";
import { browserStorage, STORAGE_ERROR_EVENT } from "@/store/storage-adapter";

describe("browserStorage", () => {
  afterEach(() => vi.restoreAllMocks());

  it("reports a storage write failure without swallowing the error", () => {
    const listener = vi.fn();
    window.addEventListener(STORAGE_ERROR_EVENT, listener, { once: true });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });

    expect(() => browserStorage.setItem("key", "value")).toThrow("quota");
    expect(listener).toHaveBeenCalledOnce();
  });
});
