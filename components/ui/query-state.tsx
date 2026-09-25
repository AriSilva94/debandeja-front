import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function LoadingState({ title, description }: { title: string; description: string }) {
  return <EmptyState icon={Loader2} title={title} description={description} />;
}

export function ErrorState({ title, onRetry }: { title: string; onRetry: () => void }) {
  return (
    <EmptyState
      icon={TriangleAlert}
      title={title}
      description="Verifique sua conexão e tente novamente."
      action={<Button onClick={onRetry}>Tentar novamente</Button>}
    />
  );
}
