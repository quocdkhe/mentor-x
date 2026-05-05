import { PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface CallStatusOverlayProps {
  status: "connecting" | "ended" | "error";
  onBack?: () => void;
}

export function CallStatusOverlay({ status, onBack }: CallStatusOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-zinc-900/90">
      {status === "connecting" && (
        <>
          <Spinner className="h-10 w-10 text-white" />
          <p className="text-lg font-medium text-white">Đang kết nối...</p>
        </>
      )}

      {(status === "ended" || status === "error") && (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600">
            <PhoneOff className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg font-medium text-white">
            {status === "ended" ? "Cuộc gọi đã kết thúc" : "Lỗi kết nối"}
          </p>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Quay lại
            </Button>
          )}
        </>
      )}
    </div>
  );
}
