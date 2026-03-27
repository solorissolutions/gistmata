import { afterEach, describe, it, expect } from "vitest";
import { JSDOM } from "jsdom";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

import { AccountCodeCard } from "@/components/join/account-code-card";

let dom: JSDOM | null = null;
let root: Root | null = null;
let container: HTMLElement | null = null;
const writeText = async () => undefined;

function installDom() {
  dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
    url: "http://127.0.0.1:3000",
  });
  container = dom.window.document.getElementById("root");

  if (!container) {
    throw new Error("Root container missing.");
  }

  root = createRoot(container);
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    Node: dom.window.Node,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: dom.window.navigator,
  });
}

async function renderCard(code?: string | null) {
  installDom();
  Object.defineProperty(globalThis.navigator, "clipboard", {
    configurable: true,
    value: {
      writeText,
    },
  });

  await act(async () => {
    root!.render(<AccountCodeCard code={code} />);
  });
}

afterEach(async () => {
  await act(async () => {
    root?.unmount();
  });

  dom?.window.close();
  dom = null;
  root = null;
  container = null;
});

describe("AccountCodeCard", () => {
  it("renders the account code in the UI", async () => {
    await renderCard("MATA-LGK9-LAGH");

    expect(container?.textContent?.includes("MATA-LGK9-LAGH")).toBe(true);
    expect(container?.textContent?.includes("Screenshot this now.")).toBe(true);
  });

  it("copies the account code when the button is clicked", async () => {
    let copiedValue = "";
    await renderCard("MATA-LGK9-LAGH");
    Object.defineProperty(globalThis.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          copiedValue = value;
        },
      },
    });

    const button = container?.querySelector("button");
    expect(button).toBeTruthy();
    if (!button) return;

    await act(async () => {
      button.dispatchEvent(new dom!.window.MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(copiedValue).toBe("MATA-LGK9-LAGH");
    expect(container?.textContent?.includes("Code copied")).toBe(true);
  });

  it("shows fallback guidance when no code is available", async () => {
    await renderCard("");

    expect(container?.textContent?.includes("Account Code no show yet.")).toBe(true);
    const button = container?.querySelector("button");
    expect(button?.hasAttribute("disabled")).toBe(true);
  });
});
