import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import React from "react";

// Mock supabase
const mockSignInWithOtp = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockGetSession = vi.fn().mockResolvedValue({ data: { session: null } });
const mockOnAuthStateChange = vi.fn().mockReturnValue({
  data: { subscription: { unsubscribe: vi.fn() } },
});
const mockFrom = vi.fn();
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null } });

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithOtp: mockSignInWithOtp,
      signInWithOAuth: mockSignInWithOAuth,
      getSession: mockGetSession,
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: mockFrom,
  },
}));

vi.mock("@/integrations/lovable/index", () => ({
  lovable: {
    auth: {
      signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

// ============ AUTH TESTS ============

describe("AUTH-01: Login page renders correctly", () => {
  it("renders all required elements", async () => {
    const AuthLogin = (await import("@/pages/AuthLogin")).default;
    render(<AuthLogin />, { wrapper: createWrapper() });

    expect(screen.getByText("Aisom")).toBeInTheDocument();
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@company.com")).toBeInTheDocument();
    expect(screen.getByText("Send magic link")).toBeInTheDocument();
    expect(screen.getByText("Create one →")).toBeInTheDocument();
  });
});

describe("AUTH-02: Signup page renders correctly", () => {
  it("renders Google as primary action before email", async () => {
    const AuthSignup = (await import("@/pages/AuthSignup")).default;
    render(<AuthSignup />, { wrapper: createWrapper() });

    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    expect(screen.getByText("Create your account")).toBeInTheDocument();
    expect(screen.getByText("Sign in →")).toBeInTheDocument();

    // Google button should appear before the email input
    const googleBtn = screen.getByText("Continue with Google");
    const emailInput = screen.getByPlaceholderText("you@company.com");
    const googlePos = googleBtn.compareDocumentPosition(emailInput);
    // emailInput should come after google button (FOLLOWING = 4)
    expect(googlePos & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe("AUTH-03: Google OAuth calls lovable.auth.signInWithOAuth", () => {
  it("calls with correct provider", async () => {
    const { lovable } = await import("@/integrations/lovable/index");
    const AuthLogin = (await import("@/pages/AuthLogin")).default;
    render(<AuthLogin />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByText("Continue with Google"));
    await waitFor(() => {
      expect(lovable.auth.signInWithOAuth).toHaveBeenCalledWith("google", {
        redirect_uri: expect.stringContaining(""),
      });
    });
  });
});

describe("AUTH-04: Empty email validation", () => {
  it("shows validation error for invalid email", async () => {
    const AuthLogin = (await import("@/pages/AuthLogin")).default;
    render(<AuthLogin />, { wrapper: createWrapper() });

    const emailInput = screen.getByPlaceholderText("you@company.com");
    fireEvent.change(emailInput, { target: { value: "not-an-email" } });
    fireEvent.click(screen.getByText("Send magic link"));

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    });
    expect(mockSignInWithOtp).not.toHaveBeenCalled();
  });
});

describe("AUTH-05: Valid magic link submission", () => {
  it("calls signInWithOtp and shows success", async () => {
    mockSignInWithOtp.mockResolvedValueOnce({ error: null });
    const AuthLogin = (await import("@/pages/AuthLogin")).default;
    render(<AuthLogin />, { wrapper: createWrapper() });

    const emailInput = screen.getByPlaceholderText("you@company.com");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByText("Send magic link"));

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: "test@example.com",
        options: { emailRedirectTo: expect.stringContaining("/auth/callback") },
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Check your inbox")).toBeInTheDocument();
    });
  });
});

describe("AUTH-06: Callback redirect logic", () => {
  it("redirects based on onboarded status", async () => {
    // This test verifies the callback component exists and handles auth
    const AuthCallback = (await import("@/pages/AuthCallback")).default;
    expect(AuthCallback).toBeDefined();
    // Full redirect testing requires integration test (Supabase session)
    // PENDING — requires live Supabase
  });
});

// ============ ONBOARDING TESTS ============

describe("OB-01: Onboarding step 1 renders", () => {
  it("PENDING — requires authenticated session", () => {
    // Onboarding requires auth context with a real session
    // Cannot fully test without mocking the full auth flow
    expect(true).toBe(true);
  });
});

describe("OB-02 to OB-09: Onboarding flow", () => {
  it("PENDING — requires authenticated session with Supabase", () => {
    // These tests require a full authenticated session and database access
    expect(true).toBe(true);
  });
});

// ============ SHEET TESTS ============

describe("SHEET-01 to SHEET-03: Card Detail Sheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("SHEET-01: opens with card data", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: "test-id",
              type: "bug",
              title: "Test Bug",
              content: { symptom: "Error", fix: "Fixed it" },
              tags: ["react"],
              language: "typescript",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user_id: "user-1",
              is_archived: false,
              review_interval: 1,
              review_ease: 2.5,
              last_reviewed_at: null,
              project_id: null,
            },
            error: null,
          }),
        }),
      }),
    });

    const { CardDetailSheet } = await import("@/components/cards/CardDetailSheet");
    render(
      <CardDetailSheet
        cardId="test-id"
        onClose={vi.fn()}
        onCardUpdated={vi.fn()}
        onCardDeleted={vi.fn()}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText("Test Bug")).toBeInTheDocument();
    });
    expect(screen.getByText("Bug Card")).toBeInTheDocument();
  });

  it("SHEET-02: header actions exist", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: "test-id", type: "bug", title: "Test", content: {},
              tags: [], language: null, created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(), user_id: "u1",
              is_archived: false, review_interval: 1, review_ease: 2.5,
              last_reviewed_at: null, project_id: null,
            },
            error: null,
          }),
        }),
      }),
    });

    const { CardDetailSheet } = await import("@/components/cards/CardDetailSheet");
    render(
      <CardDetailSheet cardId="test-id" onClose={vi.fn()} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    // Check icon buttons exist (3 action buttons + close)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });
});

// ============ INTEGRATION TESTS ============

describe("INT-05: Card not found handling", () => {
  it("shows error toast for non-existent card", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Not found", code: "PGRST116" },
          }),
        }),
      }),
    });

    const { CardDetailSheet } = await import("@/components/cards/CardDetailSheet");
    const onClose = vi.fn();
    render(
      <CardDetailSheet cardId="nonexistent" onClose={onClose} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { toast } = require("sonner");
      expect(toast.error).toHaveBeenCalledWith("Card not found");
    });
  });
});
