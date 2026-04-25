import { format } from "date-fns";
import { Calendar as CalendarIcon, CalendarDays, Clock } from "lucide-react";

import type { AppointmentPaymentDetail } from "@/types/appointment";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

interface AppointmentPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentDetail?: AppointmentPaymentDetail;
  isLoading: boolean;
  isVerifying: boolean;
  onVerifyPayment: () => void;
}

export function AppointmentPaymentDialog({
  open,
  onOpenChange,
  paymentDetail,
  isLoading,
  isVerifying,
  onVerifyPayment,
}: AppointmentPaymentDialogProps) {
  const transferInfo = paymentDetail?.paymentCode
    ? `MENTORX ${paymentDetail.paymentCode}`
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Thanh toán lịch hẹn</DialogTitle>
          <DialogDescription>
            Hoàn tất chuyển khoản và xác nhận thanh toán cho buổi học này.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !paymentDetail ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : (
          <div className="grid gap-6 py-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold uppercase text-muted-foreground">
                Thông tin buổi học
              </h3>

              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/10">
                  <AvatarImage
                    src={paymentDetail.mentorAvatar || undefined}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {paymentDetail.mentorName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-lg font-semibold">
                    {paymentDetail.mentorName}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {`${paymentDetail.mentorPosition} @ ${paymentDetail.mentorCompany}`}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Thời gian</p>
                    <p className="font-medium">
                      {format(new Date(paymentDetail.startAt), "HH:mm")} -{" "}
                      {format(new Date(paymentDetail.endAt), "HH:mm")},{" "}
                      {format(new Date(paymentDetail.startAt), "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Thời lượng</p>
                    <p className="font-medium">
                      {Math.round(
                        (new Date(paymentDetail.endAt).getTime() -
                          new Date(paymentDetail.startAt).getTime()) /
                        60000,
                      )}{" "}
                      phút
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t pt-3">
                  <div className="flex h-5 w-5 items-center justify-center">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng cộng</p>
                    <p className="text-xl font-bold">
                      {new Intl.NumberFormat("vi-VN").format(paymentDetail.amount)} đ
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Mã thanh toán
                    </p>
                    <p className="font-medium">{paymentDetail.paymentCode}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-teal-600/30 bg-teal-600/10 p-8">
              <div className="mb-4 flex items-center justify-center overflow-hidden rounded-lg bg-white p-6 shadow-lg">
                <img
                  src={`https://img.vietqr.io/image/tpbank-00000117197-compact2.jpg?amount=${paymentDetail.amount}&addInfo=${encodeURIComponent(
                    transferInfo,
                  )}&accountName=mentor%20x`}
                  alt="Mã QR thanh toán"
                  className="h-68 w-55 object-cover scale-x-125 scale-y-120"
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isVerifying}
          >
            Đóng
          </Button>
          <Button
            onClick={onVerifyPayment}
            disabled={!paymentDetail || isVerifying}
          >
            {isVerifying ? (
              <>
                <Spinner /> Đang kiểm tra...
              </>
            ) : (
              "Tôi đã chuyển khoản"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
