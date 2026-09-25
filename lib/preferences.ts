import { useSessionContext } from "@/lib/api/hooks/use-session";

const DEFAULT_PAGE_SIZE = 20;

export function usePageSize() {
  const preferred = useSessionContext().data?.preferences.pageSize;
  return { pageSize: preferred ?? DEFAULT_PAGE_SIZE, ready: preferred !== undefined };
}
