import { createLazyRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Video, CalendarDays, CheckCircle } from "lucide-react";

import { cn } from "@/lib/utils";
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMentorGetAppointments } from "@/api/appointment";
import type { AppointmentStatusEnum } from "@/types/appointment";

// --- Types & Interfaces ---

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface UserProfile {
  name: string;
  phone: string;
  email: string;
  avatar: string;
}

interface ScheduleItem {
  id: string;
  mentorId: string;
  mentor: UserProfile;
  mentee: UserProfile;
  startAt: string; // ISO string
  endAt: string;   // ISO string
  status: BookingStatus;
  meeting_link?: string;
}

// Helper to map API status to internal status
const mapApiStatus = (apiStatus: AppointmentStatusEnum): BookingStatus => {
  switch (apiStatus) {
    case "Pending":
      return "pending";
    case "Confirmed":
      return "confirmed";
    case "Completed":
      return "completed";
    case "Cancelled":
      return "cancelled";
    default:
      return "pending";
  }
};



// --- Components ---

const StatusBadge = ({ status }: { status: BookingStatus }) => {
  switch (status) {
    case "pending":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900/30 dark:text-yellow-500">Chờ xác nhận</Badge>;
    case "confirmed":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-500">Đã xác nhận</Badge>;
    case "completed":
      return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-500">Hoàn thành</Badge>;
    case "cancelled":
      return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-500">Đã hủy</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const Schedules = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Fetch appointments from API for the selected date (or today)
  const { data: appointmentsData = [], isLoading } = useMentorGetAppointments(date || new Date());

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    appointmentId: string;
    newStatus: BookingStatus | null;
    title: string;
    description: string;
  }>({ open: false, appointmentId: "", newStatus: null, title: "", description: "" });

  // Map API data to component format
  const schedules: ScheduleItem[] = appointmentsData.map((apt) => ({
    id: apt.mentorId, // Using mentorId as id for now - adjust if backend provides appointment id
    mentorId: apt.mentorId,
    mentor: { name: "", phone: "", email: "", avatar: "" }, // Mentor is the current user
    mentee: {
      name: apt.mentee.name,
      phone: "",
      email: apt.mentee.email,
      avatar: apt.mentee.avatar || "",
    },
    startAt: apt.startAt,
    endAt: apt.endAt,
    status: mapApiStatus(apt.status),
    meeting_link: apt.meetingLink || undefined,
  }));

  const handleConfirmAction = () => {
    if (confirmDialog.newStatus && confirmDialog.appointmentId) {
      console.log("Appointment ID:", confirmDialog.appointmentId);
      console.log("New Status:", confirmDialog.newStatus);
      // Here you would typically call an API to update the status
    }
    setConfirmDialog({ open: false, appointmentId: "", newStatus: null, title: "", description: "" });
  };

  const openConfirmDialog = (appointmentId: string, newStatus: BookingStatus, title: string, description: string) => {
    setConfirmDialog({ open: true, appointmentId, newStatus, title, description });
  };

  // Filter logic
  const filteredSchedules = schedules.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Đang tải lịch hẹn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
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
                setCalendarOpen(false); // Close calendar when date is selected
              }}
              locale={vi}
            />
          </PopoverContent>
        </Popover>

        {/* Right: Status Tabs */}
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setStatusFilter}>
          <TabsList className="grid w-full md:w-auto grid-cols-4">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="pending">Chờ xác nhận</TabsTrigger>
            <TabsTrigger value="confirmed">Đã xác nhận</TabsTrigger>
            <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
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
                    {schedule.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => openConfirmDialog(
                            schedule.id,
                            "confirmed",
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
                            schedule.id,
                            "cancelled",
                            "Từ chối lịch hẹn",
                            "Bạn có chắc chắn muốn từ chối lịch hẹn này không?"
                          )}
                        >
                          Từ chối
                        </Button>
                      </div>
                    )}
                    {schedule.status === "confirmed" && (
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" className="gap-2" asChild>
                          <a href={schedule.meeting_link} target="_blank" rel="noopener noreferrer">
                            <Video className="h-4 w-4" />
                            Tham gia Meet
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 border-green-500 text-green-600 hover:bg-green-50 dark:border-green-600 dark:text-green-500 dark:hover:bg-green-950/20"
                          onClick={() => openConfirmDialog(
                            schedule.id,
                            "completed",
                            "Đánh dấu hoàn thành",
                            "Bạn có chắc chắn muốn đánh dấu lịch hẹn này là đã hoàn thành không?"
                          )}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Đã hoàn thành
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-500 dark:hover:bg-blue-950/20">
                          <CalendarDays className="h-4 w-4" />
                          Google Calendar
                        </Button>
                      </div>
                    )}
                    {schedule.status === "completed" && (
                      <div className="flex gap-2">
                        {/* No standard action for completed, maybe view detail */}
                      </div>
                    )}
                    {schedule.status === "cancelled" && (
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
            <AlertDialogCancel>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              Xác nhận
            </AlertDialogAction>
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