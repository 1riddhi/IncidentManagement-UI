import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnalysisCodeChanges } from "./IncidentDetails";

const { requestDraftPrPreview } = vi.hoisted(() => ({ requestDraftPrPreview: vi.fn() }));
vi.mock("../api/draftPr", () => ({
  requestDraftPrPreview,
  createDraftPr: vi.fn(),
}));
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const proposal = {
  repository: "acme/payments",
  filePath: "src/validation.py",
  baseBranch: "main" as const,
  proposedCode: "def validate(value):\n    return value\n",
  codeChanges: "--- a/src/validation.py\n+++ b/src/validation.py\n@@ -1 +1 @@\n-print('old')\n+print('new')\n",
};

describe("AnalysisCodeChanges", () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it("prefills the draft PR target from the analyze response", async () => {
    requestDraftPrPreview.mockResolvedValue({
      previewId: "preview-1",
      repository: proposal.repository,
      filePath: proposal.filePath,
      baseBranch: "main",
      patch: proposal.codeChanges,
    });
    render(<AnalysisCodeChanges proposal={proposal} analysisId="analysis-1" />);

    expect(screen.getByText("def validate(value):")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Create draft pull request" }));
    expect((screen.getByLabelText("GitHub repository") as HTMLInputElement).value).toBe("acme/payments");
    expect((screen.getByLabelText("Repository file path") as HTMLInputElement).value).toBe("src/validation.py");
    expect((screen.getByLabelText(/Base branch/ ) as HTMLInputElement).value).toBe("main");

    fireEvent.click(screen.getByRole("button", { name: "Generate preview" }));
    await act(async () => {});
    expect(requestDraftPrPreview).toHaveBeenCalledWith("analysis-1", "acme/payments", "src/validation.py", "main");
  });
});
