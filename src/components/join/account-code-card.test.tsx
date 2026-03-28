import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AccountCodeCard } from "@/components/join/account-code-card";

afterEach(async () => {
  cleanup();
  vi.restoreAllMocks();
});

describe("AccountCodeCard", () => {
  it("renders the account code in the UI", () => {
    render(<AccountCodeCard code="MATA-LGK9-LAGH" />);

    expect(screen.getByText("MATA-LGK9-LAGH")).toBeTruthy();
    expect(screen.getByText("Screenshot this now.")).toBeTruthy();
  });

  it("copies the account code when the button is clicked", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText,
      },
    });
    render(<AccountCodeCard code="MATA-LGK9-LAGH" />);

    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("MATA-LGK9-LAGH"));
    expect(screen.getByRole("button", { name: "Code copied" })).toBeTruthy();
  });

  it("shows fallback guidance when no code is available", () => {
    render(<AccountCodeCard code="" />);

    expect(screen.getByText("Account Code no show yet.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Copy code" }).hasAttribute("disabled")).toBe(true);
  });
});
