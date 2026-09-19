import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { queryKeys } from "./useBackend";

const ALERTS_POLL_MS = 15_000;

/**
 * Polls `listAlerts` so in-app notifications stay current without a
 * manual refresh, and exposes the unread count for the header bell.
 */
export function useAlerts() {
  const { actor, isFetching } = useActor(createActor);
  const query = useQuery({
    queryKey: queryKeys.alerts,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAlerts();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: ALERTS_POLL_MS,
    refetchIntervalInBackground: false,
  });

  const alerts = query.data ?? [];

  const unreadCount = useMemo(
    () => alerts.filter((alert) => !alert.read).length,
    [alerts],
  );

  return { ...query, alerts, unreadCount };
}

export function useAlert(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.alert(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getAlert(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useMarkAlertRead() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("El backend aún no está listo");
      return actor.markAlertRead(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.alerts });
    },
  });
}
