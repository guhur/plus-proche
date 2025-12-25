import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Provider } from "@/components/ui/provider";

export const Route = createRootRoute({
  component: () => (
    <Provider>
      <Outlet />
    </Provider>
  ),
});
