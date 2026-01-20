import { Spinner } from "@/components/ui/spinner";

export function LoadingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Spinner className="h-12 w-12 text-primary" />
      <p className="mt-4 text-muted-foreground">Đang tải...</p>
    </div>
  );
}
