import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Typed access to the backend actor plus the shared React Query helpers
 * used across every page. All backend reads and writes flow through here.
 */
export function useBackend() {
  const { actor, isFetching } = useActor(createActor);
  return { actor, isFetching, isReady: !!actor && !isFetching };
}

export const queryKeys = {
  faroles: ["faroles"] as const,
  farol: (id: bigint) => ["farol", id.toString()] as const,
  positions: (farolId: bigint) => ["positions", farolId.toString()] as const,
  sensors: (type: string | null, status: string | null, search: string) =>
    ["sensors", type, status, search] as const,
  sensor: (id: bigint) => ["sensor", id.toString()] as const,
  alerts: ["alerts"] as const,
  alert: (id: bigint) => ["alert", id.toString()] as const,
  devices: ["devices"] as const,
};

export function useFaroles() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.faroles,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFaroles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFarol(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.farol(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getFarol(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function usePositions(farolId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.positions(farolId ?? 0n),
    queryFn: async () => {
      if (!actor || farolId === null) return [];
      return actor.listPositions(farolId);
    },
    enabled: !!actor && !isFetching && farolId !== null,
  });
}

export function useSensors(
  sensorType: string | null,
  status: string | null,
  search: string,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.sensors(sensorType, status, search),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSensors(
        sensorType as never,
        status as never,
        search.trim() === "" ? null : search.trim(),
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSensor(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.sensor(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getSensor(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useDevices() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: queryKeys.devices,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDevices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterFarol() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      qrCode: string;
      name: string;
      latitude: number;
      longitude: number;
    }) => {
      if (!actor) throw new Error("El backend aún no está listo");
      return actor.registerFarol(
        input.qrCode,
        input.name,
        input.latitude,
        input.longitude,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.faroles });
    },
  });
}

export function useAddSensor() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      qrCode: string;
      sensorType: never;
      farolId: bigint | null;
      unit: string;
      minValue: number;
      maxValue: number;
    }) => {
      if (!actor) throw new Error("El backend aún no está listo");
      return actor.addSensor(
        input.name,
        input.qrCode,
        input.sensorType,
        input.farolId,
        input.unit,
        input.minValue,
        input.maxValue,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sensors"] });
    },
  });
}

export function useUpdateSensorRange() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: bigint;
      minValue: number;
      maxValue: number;
    }) => {
      if (!actor) throw new Error("El backend aún no está listo");
      return actor.updateSensorRange(input.id, input.minValue, input.maxValue);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sensors"] });
      void queryClient.invalidateQueries({ queryKey: ["sensor"] });
    },
  });
}

export function useRecordReading() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { sensorId: bigint; value: number }) => {
      if (!actor) throw new Error("El backend aún no está listo");
      return actor.recordReading(input.sensorId, input.value);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sensors"] });
      void queryClient.invalidateQueries({ queryKey: ["sensor"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.alerts });
    },
  });
}

export function useLinkDevice() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("El backend aún no está listo");
      return actor.linkDevice(name);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.devices });
    },
  });
}

export function useUnlinkDevice() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("El backend aún no está listo");
      return actor.unlinkDevice(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.devices });
    },
  });
}
