import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";

/**
 * Renders a page component inside a real TanStack Router so `Link` and
 * `useParams` resolve exactly as they do in the app. The route tree mirrors
 * the app's `_app` layout: a root outlet plus a pathless layout route that
 * renders the component under test.
 *
 * `path` is the route the component is mounted at (e.g. `/faroles/$farolId`);
 * `initialPath` is the URL the router starts on, which is what `useParams`
 * reads. They are separate so a detail page can be mounted at its parameterized
 * path while the test navigates to a concrete id.
 */
export function renderWithRouter(
  component: () => ReactNode,
  options: { path?: string; initialPath?: string } = {},
) {
  const { path = "/", initialPath = path } = options;

  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const layoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: "_app",
    component: () => <Outlet />,
  });
  const pageRoute = createRoute({
    getParentRoute: () => layoutRoute,
    path,
    component: component as never,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([layoutRoute.addChildren([pageRoute])]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    defaultPendingMinMs: 0,
  });

  return render(<RouterProvider router={router} />);
}
