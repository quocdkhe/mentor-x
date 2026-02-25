import { createLazyRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Video, CalendarDays, CheckCircle, X } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useMentorGetAppointments, useAcceptAppointments, useCancelAppointment, useCompleteAppointment } from "@/api/appointment";
import type { AppointmentStatusEnum } from "@/types/appointment";
import SchedulesTableSkeleton from "@/components/skeletons/schedules-table.skeleton";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

// --- Types & Interfaces ---
interface ScheduleItem {
  appointmentId: string;
  mentorId: string;
  mentee: {
    name: string;
    email: string;
    avatar: string;
  };
  startAt: string; // ISO string
  endAt: string;   // ISO string
  status: AppointmentStatusEnum;
  meetingLink?: string;
  googleCalendarLink?: string;
}

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

const Schedules = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch appointments from API for the selected date (or all if no date)
  const { data: appointmentsData = [], isLoading } = useMentorGetAppointments(date ? convertDateToUTC(date) : undefined);

  const [statusFilter, setStatusFilter] = useState<AppointmentStatusEnum | "all">("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    appointmentId: string;
    newStatus: AppointmentStatusEnum | null;
    title: string;
    description: string;
  }>({ open: false, appointmentId: "", newStatus: null, title: "", description: "" });

  // Initialize the appointment mutations
  const { mutate: acceptAppointment, isPending: isAccepting } = useAcceptAppointments();
  const { mutate: cancelAppointment, isPending: isCancelling } = useCancelAppointment();
  const { mutate: completeAppointment, isPending: isCompleting } = useCompleteAppointment();

  // Combined loading state for all mutations
  const isProcessing = isAccepting || isCancelling || isCompleting;

  // Map API data to component format
  const schedules: ScheduleItem[] = appointmentsData.map((apt) => ({
    appointmentId: apt.appointmentId,
    mentorId: apt.mentorId,
    mentee: {
      name: apt.mentee.name,
      email: apt.mentee.email,
      avatar: apt.mentee.avatar || "",
    },
    startAt: apt.startAt,
    endAt: apt.endAt,
    status: apt.status, // Use API status directly
    meetingLink: apt.meetingLink || undefined,
    googleCalendarLink: apt.googleCalendarLink || undefined,
  }));

  const handleConfirmAction = () => {
    if (confirmDialog.newStatus && confirmDialog.appointmentId) {
      const onSuccessHandler = (data: { message: string }) => {
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ["mentor-appointments", date ? convertDateToUTC(date) : undefined] });
        toast.success(data.message);
        // Close dialog after successful API call
        setConfirmDialog({ open: false, appointmentId: "", newStatus: null, title: "", description: "" });
      };

      const onErrorHandler = (error: AxiosError<{ message?: string }>) => {
        toast.error(error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.");
        // Close dialog on error as well
        setConfirmDialog({ open: false, appointmentId: "", newStatus: null, title: "", description: "" });
      };

      // Call the appropriate API based on the status
      switch (confirmDialog.newStatus) {
        case "Confirmed":
          acceptAppointment(confirmDialog.appointmentId, {
            onSuccess: onSuccessHandler,
            onError: onErrorHandler,
          });
          break;
        case "Cancelled":
          cancelAppointment(confirmDialog.appointmentId, {
            onSuccess: onSuccessHandler,
            onError: onErrorHandler,
          });
          break;
        case "Completed":
          completeAppointment(confirmDialog.appointmentId, {
            onSuccess: onSuccessHandler,
            onError: onErrorHandler,
          });
          break;
        default:
          // Fallback: just close the dialog
          setConfirmDialog({ open: false, appointmentId: "", newStatus: null, title: "", description: "" });
      }
    }
  };

  const openConfirmDialog = (appointmentId: string, newStatus: AppointmentStatusEnum, title: string, description: string) => {
    setConfirmDialog({ open: true, appointmentId, newStatus, title, description });
  };

  // Filter logic
  const filteredSchedules = schedules.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Left: Date Picker */}
          <div className="flex items-center gap-1">
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
            {date && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={() => setDate(undefined)}
                aria-label="Xóa ngày"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

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

        {/* Skeleton Table */}
        <SchedulesTableSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Left: Date Picker */}
        <div className="flex items-center gap-1">
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
                  setCalendarOpen(false); // Close calendar when date is selected
                }}
                locale={vi}
              />
            </PopoverContent>
          </Popover>
          {date && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setDate(undefined)}
              aria-label="Xóa ngày"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

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

      {/* Main Content: Table */}
      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px] text-center">Học viên</TableHead>
              <TableHead className="text-center">Thời gian</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead >Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Không có lịch nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredSchedules.map((schedule, index) => (
                <TableRow key={index}>
                  <TableCell className="py-4">
                    <div className="flex items-center justify-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={schedule.mentee.avatar} alt={schedule.mentee.name} />
                        <AvatarFallback>{schedule.mentee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">{schedule.mentee.name}</span>
                        <span className="text-xs text-muted-foreground">{schedule.mentee.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <div className="flex flex-col gap-1 items-center">
                      <div className="flex items-center text-sm font-medium">
                        {format(new Date(schedule.startAt), "dd/MM/yyyy")}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        {format(new Date(schedule.startAt), "HH:mm")} - {format(new Date(schedule.endAt), "HH:mm")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <div className="flex justify-center">
                      <StatusBadge status={schedule.status} />
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    {schedule.status === "Pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => openConfirmDialog(
                            schedule.appointmentId,
                            "Confirmed",
                            "Xác nhận lịch hẹn",
                            "Bạn có chắc chắn muốn xác nhận lịch hẹn này không?"
                          )}
                        >
                          Xác nhận
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openConfirmDialog(
                            schedule.appointmentId,
                            "Cancelled",
                            "Từ chối lịch hẹn",
                            "Bạn có chắc chắn muốn từ chối lịch hẹn này không?"
                          )}
                        >
                          Từ chối
                        </Button>
                      </div>
                    )}
                    {schedule.status === "Confirmed" && (
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" className="gap-2" asChild>
                          <a href={schedule.meetingLink} target="_blank" rel="noopener noreferrer">
                            <Video className="h-4 w-4" />
                            Tham gia Meet
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 border-green-500 text-green-600 hover:bg-green-50 dark:border-green-600 dark:text-green-500 dark:hover:bg-green-950/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={new Date() < new Date(schedule.endAt)}
                          onClick={() => openConfirmDialog(
                            schedule.appointmentId,
                            "Completed",
                            "Đánh dấu hoàn thành",
                            "Bạn có chắc chắn muốn đánh dấu lịch hẹn này là đã hoàn thành không?"
                          )}
                          title={new Date() < new Date(schedule.endAt) ? `Chỉ có thể đánh dấu hoàn thành sau ${format(new Date(schedule.endAt), "HH:mm dd/MM/yyyy")}` : "Đánh dấu buổi học đã hoàn thành"}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Đã hoàn thành
                        </Button>
                        {schedule.googleCalendarLink && (
                          <Button size="sm" variant="outline" className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-500 dark:hover:bg-blue-950/20" asChild>
                            <a href={schedule.googleCalendarLink} target="_blank" rel="noopener noreferrer">
                              <CalendarDays className="h-4 w-4" />
                              Google Calendar
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                    {schedule.status === "Completed" && (
                      <div className="flex gap-2">
                        {/* No standard action for completed, maybe view detail */}
                      </div>
                    )}
                    {schedule.status === "Cancelled" && (
                      <div className="flex gap-2">
                        {/* Cancelled state usually no action */}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, appointmentId: "", newStatus: null, title: "", description: "" })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Hủy
            </AlertDialogCancel>
            <Button onClick={handleConfirmAction} disabled={isProcessing}>
              {isProcessing ? <><Spinner /> Đang xử lý...</> : "Xác nhận"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export const Route = createLazyRoute('/mentor/schedules')({
  component: Schedules,
});

export default Schedules