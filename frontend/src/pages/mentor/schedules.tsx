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

// --- Mock Data ---

const mockSchedules: ScheduleItem[] = [
  {
    id: "apt-001",
    mentorId: "m1",
    mentor: { name: "Mentor A", phone: "0123", email: "mentor@test.com", avatar: "" },
    mentee: { name: "Nguyen Van A", phone: "0901234567", email: "nguyenvana@example.com", avatar: "NV" },
    startAt: "2023-10-20T14:00:00Z",
    endAt: "2023-10-20T15:00:00Z",
    status: "pending",
  },
  {
    id: "apt-002",
    mentorId: "m1",
    mentor: { name: "Mentor A", phone: "0123", email: "mentor@test.com", avatar: "" },
    mentee: { name: "Tran Thi B", phone: "0909876543", email: "tranthib@example.com", avatar: "TB" },
    startAt: "2023-10-21T09:00:00Z",
    endAt: "2023-10-21T10:00:00Z",
    status: "confirmed",
    meeting_link: "https://meet.google.com/abc-defg-hik",
  },
  {
    id: "apt-003",
    mentorId: "m1",
    mentor: { name: "Mentor A", phone: "0123", email: "mentor@test.com", avatar: "" },
    mentee: { name: "Le Van C", phone: "0912345678", email: "levanc@example.com", avatar: "LV" },
    startAt: "2023-10-15T16:00:00Z",
    endAt: "2023-10-15T17:00:00Z",
    status: "completed",
  },
  {
    id: "apt-004",
    mentorId: "m1",
    mentor: { name: "Mentor A", phone: "0123", email: "mentor@test.com", avatar: "" },
    mentee: { name: "Pham Thi D", phone: "0987654321", email: "phamthid@example.com", avatar: "PD" },
    startAt: "2023-10-22T10:00:00Z",
    endAt: "2023-10-22T11:00:00Z",
    status: "pending",
  },
  {
    id: "apt-005",
    mentorId: "m1",
    mentor: { name: "Mentor A", phone: "0123", email: "mentor@test.com", avatar: "" },
    mentee: { name: "Hoang Van E", phone: "0999888777", email: "hoangvane@example.com", avatar: "HE" },
    startAt: "2023-10-18T13:00:00Z",
    endAt: "2023-10-18T14:00:00Z",
    status: "cancelled",
  },
  {
    id: "apt-006",
    mentorId: "m1",
    mentor: { name: "Mentor A", phone: "0123", email: "mentor@test.com", avatar: "" },
    mentee: { name: "Doan Khoa", phone: "0123456789", email: "doankhoa@example.com", avatar: "DK" },
    startAt: "2023-10-23T15:00:00Z",
    endAt: "2023-10-23T16:00:00Z",
    status: "pending",
  },
  {
    id: "apt-007",
    mentorId: "m1",
    mentor: { name: "Mentor A", phone: "0123", email: "mentor@test.com", avatar: "" },
    mentee: { name: "Le Thi T", phone: "0987123456", email: "lethit@example.com", avatar: "LT" },
    startAt: "2023-10-24T08:00:00Z",
    endAt: "2023-10-24T09:00:00Z",
    status: "confirmed",
    meeting_link: "https://meet.google.com/xyz-abcd-mnp",
  },
];

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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    appointmentId: string;
    newStatus: BookingStatus | null;
    title: string;
    description: string;
  }>({ open: false, appointmentId: "", newStatus: null, title: "", description: "" });

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
  const filteredSchedules = mockSchedules.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    // In a real app, you might also filter by date here, but for now we primarily show the list
    // If the user selects a date, we could filter. Let's assume the calendar is just for show/selection for now
    // or effectively filtering.
    // For accurate date filtering:
    // const itemDate = new Date(item.startAt);
    // const matchesDate = date ? isSameDay(itemDate, date) : true;

    // Given the design shows a list of *various dates*, the "Today" / Date picker might be a quick jump or filter
    // Let's implement actual date filtering if a date is picked? 
    // The image shows "Today" but the list has "20/10", "21/10", "15/10"... which are seemingly all over.
    // It implies "Today" might be a default view, or just a filter.
    // However, standard intuitive UI:
    // Left date picker = Filter by this date (or clear to see all).
    // Right tabs = Filter by status.

    return matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Left: Date Picker */}
        <Popover>
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
              onSelect={setDate}
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