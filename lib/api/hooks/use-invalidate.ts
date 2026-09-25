import { useQueryClient } from "@tanstack/react-query";

export function useInvalidate(keys: string[]) {
  const queryClient = useQueryClient();
  return () => {
    for (const key of keys) {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
  };
}
