import { describe, expect, it, vi } from "vitest";
import { createDraftPr, requestDraftPrPreview } from "./draftPr";

describe("draft PR API", () => {
  it("creates a preview from a session-scoped file target", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ previewId: "draft-1", repository: "owner/repo", baseBranch: "main", filePath: "src/App.tsx", patch: "--- a/src/App.tsx\n+++ b/src/App.tsx" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(requestDraftPrPreview("analysis 1", "owner/repo", "src/App.tsx", "main")).resolves.toMatchObject({ previewId: "draft-1" });
    expect(fetchMock.mock.calls[0][0]).toContain("analysis%201/draft-pr/preview");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ repository: "owner/repo", filePath: "src/App.tsx", baseBranch: "main" });
    vi.unstubAllGlobals();
  });

  it("creates a draft PR using only the preview identifier", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ url: "https://github.test/pr/1", number: 1, branch: "incident/inc-1-draft" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await createDraftPr("analysis-1", "draft-1");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ previewId: "draft-1" });
    vi.unstubAllGlobals();
  });
});
