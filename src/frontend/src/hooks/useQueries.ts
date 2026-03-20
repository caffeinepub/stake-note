import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DiaryEntry } from "../backend.d";
import { useActor } from "./useActor";

export function useEntries(page = 0, pageSize = 50) {
  const { actor, isFetching } = useActor();
  return useQuery<DiaryEntry[]>({
    queryKey: ["entries", page, pageSize],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEntriesByPage(BigInt(page), BigInt(pageSize));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchEntries(keyword: string) {
  const { actor, isFetching } = useActor();
  return useQuery<DiaryEntry[]>({
    queryKey: ["entries", "search", keyword],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchEntries(keyword);
    },
    enabled: !!actor && !isFetching && keyword.length > 0,
  });
}

export function useCreateEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      body,
      moodTags,
    }: {
      title: string;
      body: string;
      moodTags: string[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createEntry(title, body, moodTags);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useUpdateEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      body,
      moodTags,
    }: {
      id: bigint;
      title: string;
      body: string;
      moodTags: string[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateEntry(id, title, body, moodTags);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useDeleteEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteEntry(entryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}
