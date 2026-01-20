import { createLazyRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Video, CalendarDays, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { cn, convertDateToUTC } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMenteeGetAppointments, useCancelAppointment } from "@/api/appointment";
import type { AppointmentStatusEnum } from "@/types/appointment";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

// --- Components ---

const StatusBadge = ({ status }: { status: AppointmentStatusEnum }) => {
  switch (status) {
    case "Pending":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900/30 dark:text-yellow-500">Chờ xác nhận</Badge>;
    case "Confirmed":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-500">Đã xác nhận</Badge>;
    case "Completed":
      return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-500">Hoàn thành</Badge>;
    case "Cancelled":
      return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-500">Đã hủy</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

function MenteeSchedulesPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch appointments from API for the selected date (or today)
  const { data: appointmentsData = [], isLoading } = useMenteeGetAppointments(convertDateToUTC(date || new Date()));

  // Initialize the cancel appointment mutation
  const { mutate: cancelAppointment, isPending: isCancelling } = useCancelAppointment();

  const [statusFilter, setStatusFilter] = useState<AppointmentStatusEnum | "all">("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    appointmentId: string;
    action: "cancel" | null;
    title: string;
    description: string;
  }>({ open: false, appointmentId: "", action: null, title: "", description: "" });

  const handleConfirmAction = () => {
    if (confirmDialog.action && confirmDialog.appointmentId) {
      if (confirmDialog.action === "cancel") {
        cancelAppointment(confirmDialog.appointmentId, {
          onSuccess: (data) => {
            // Invalidate queries to refresh the data
            queryClient.invalidateQueries({ queryKey: ["mentee-appointments", convertDateToUTC(date || new Date())] });
            toast.success(data.message);
            // Close dialog after successful API call
            setConfirmDialog({ open: false, appointmentId: "", action: null, title: "", description: "" });
          },
          onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.");
            // Close dialog on error as well
            setConfirmDialog({ open: false, appointmentId: "", action: null, title: "", description: "" });
          },
        });
      }
    }
  };

  const openCancelDialog = (appointmentId: string) => {
    setConfirmDialog({
      open: true,
      appointmentId,
      action: "cancel",
      title: "Hủy lịch hẹn",
      description: "Bạn có chắc chắn muốn hủy lịch hẹn này không?"
    });
  };

  // Filter logic
  const filteredAppointments = appointmentsData.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesStatus;
  });

  return (
    <div className="container mx-auto pt-6 pb-20 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Left: Date Picker */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PP", { locale: vi }) : <span>Chọn ngày</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate);
                setCalendarOpen(false);
              }}
              locale={vi}
            />
          </PopoverContent>
        </Popover>

        {/* Right: Status Tabs */}
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={(value) => setStatusFilter(value as AppointmentStatusEnum | "all")}>
          <TabsList className="grid w-full md:w-auto grid-cols-5">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="Pending">Chờ xác nhận</TabsTrigger>
            <TabsTrigger value="Confirmed">Đã xác nhận</TabsTrigger>
            <TabsTrigger value="Completed">Hoàn thành</TabsTrigger>
            <TabsTrigger value="Cancelled">Đã hủy</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Appointments Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-muted rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="h-8 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-6 bg-muted rounded w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
          <div
            className="relative h-64 w-64 bg-contain bg-center bg-no-repeat opacity-90 dark:opacity-70 transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAc0KV_9mJioueeH3g4gr9C6tYouarNzblXMTkbr3MzxDVDtvPASXUPxCwRqovN1H_KiZ8M9PplDKbEclMsn_GIxdNtIEy5rnDcHCjiNXW_2E05ifF_R7aWHeD2_P91xB1aDh8PgPvVybH1Ed3AXIk9rzxfWksOpcvQHSkRLShBPoYjcyTlL0dpNN8RyjyqxRxKivdebI7TldsQJ0D4CsTJuDkq5YTFV8R05NXRgiQL1IKBz1yrBu390Qt8ihenklbEEZugMThabQ")`
            }}
            aria-label="Minh họa lịch trống"
          />
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-foreground">Chưa có lịch hẹn nào</h3>
            <p className="text-muted-foreground max-w-md">
              Bạn chưa có lịch hẹn nào cho ngày này. Hãy tìm kiếm mentor phù hợp và đặt lịch ngay!
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/user/mentors">
              Tìm kiếm Mentor
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
          {filteredAppointments.map((appointment, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                {/* Mentor Info */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={appointment.mentor.avatar || undefined} alt={appointment.mentor.name} />
                    <AvatarFallback>{appointment.mentor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{appointment.mentor.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {`${appointment.mentor.position} tại ${appointment.mentor.company || appointment.mentor.email}`}
                    </p>
                  </div>
                  <StatusBadge status={appointment.status} />
                </div>

                {/* Time and Date */}
                <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-3 text-center space-y-1">
                  <div className="text-2xl font-bold text-primary">
                    {format(new Date(appointment.startAt), "HH:mm")} - {format(new Date(appointment.endAt), "HH:mm")}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    {format(new Date(appointment.startAt), "dd/MM/yyyy")}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {appointment.status === "Confirmed" && appointment.meetingLink && (
                    <>
                      <Button className="w-full gap-2" asChild>
                        <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer">
                          <Video className="h-4 w-4" />
                          Tham gia Meet
                        </a>
                      </Button>
                      <Button variant="outline" className="w-full gap-2" asChild>
                        <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">
                          <CalendarDays className="h-4 w-4" />
                          Thêm vào Google Calendar
                        </a>
                      </Button>
                    </>
                  )}

                  {appointment.status === "Pending" && (
                    <Button
                      variant="outline"
                      className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={() => openCancelDialog(appointment.appointmentId)}
                    >
                      <X className="h-4 w-4" />
                      Hủy yêu cầu
                    </Button>
                  )}

                  {appointment.status === "Completed" && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Buổi học đã kết thúc
                    </p>
                  )}

                  {appointment.status === "Cancelled" && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Không có hành động
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, appointmentId: "", action: null, title: "", description: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              Hủy
            </AlertDialogCancel>
            <Button onClick={handleConfirmAction} disabled={isCancelling}>
              {isCancelling ? <><Spinner /> Đang xử lý...</> : "Xác nhận"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export const Route = createLazyRoute('/user/schedules')({
  component: MenteeSchedulesPage,
});

export default MenteeSchedulesPage;