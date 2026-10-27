import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QuotePage from "./Quote";
import { submitLead } from "@/lib/submitLead";
import { track } from "@/lib/analytics";

vi.mock("@/lib/submitLead", () => ({
  submitLead: vi.fn().mockResolvedValue({ ok: true }),
}));

vi.mock("@/lib/analytics", () => ({
  track: vi.fn(),
  trackGenerateLead: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

function renderAssistantQuote() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/quote?service=assistant"]}>
        <QuotePage />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe("assistant quote interest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    );
  });

  it("preselects assistant interest and submits it without a website package", async () => {
    renderAssistantQuote();

    expect(screen.getByLabelText("What are you interested in?")).toHaveValue("AI assistant");
    expect(screen.queryByLabelText("Package interest")).not.toBeInTheDocument();
    expect(track).toHaveBeenCalledWith("quote_start_assistant");

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Alex Example" } });
    fireEvent.change(screen.getByLabelText("Phone or WhatsApp"), { target: { value: "0712345678" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "alex@example.com" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Send request" }));

    await waitFor(() => {
      expect(submitLead).toHaveBeenCalledWith(
        expect.objectContaining({
          productInterest: "AI assistant",
          packageInterest: "",
          kind: "quote",
          details: expect.stringContaining("Product interest: AI assistant"),
        }),
      );
    });
    expect(track).toHaveBeenCalledWith("quote_submit_assistant");
  });
});
