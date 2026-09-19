import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// Generated components use `data-ocid` markers; make them queryable by role
// without falling back to brittle CSS selectors.
configure({ testIdAttribute: "data-ocid" });

// Vitest runs without injected globals here, so Testing Library's automatic
// cleanup is not registered; unmount between tests explicitly.
afterEach(() => {
  cleanup();
});
