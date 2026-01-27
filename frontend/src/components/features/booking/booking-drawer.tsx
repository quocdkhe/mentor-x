import { useState, useMemo, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Info,
  X,
} from "lucide-react";
import { cn, convertDateToUTC } from "@/lib/utils";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useBooking, useGetMentorSchedules } from "@/api/appointment";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import type { MentorInfo } from "@/types/mentor";
import type { TimeBlockDto } from "@/types/appointment";
import { BookingSlotsSkeleton } from "@/components/skeletons/booking-slots.skeleton";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: MentorInfo;
}

const SLOT_DURATION = 15; // minutes

export function BookingDrawer({ isOpen, onClose, mentor }: BookingDrawerProps) {
  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [startRange, setStartRange] = useState<{
    date: Date;
    time: string;
    blockIdx: number;
  } | null>(null);
  const [endRange, setEndRange] = useState<{ date: Date; time: string } | null>(
    null,
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch mentor schedules for the selected date
  const { data: scheduleData, isLoading: isLoadingSchedules } =
    useGetMentorSchedules(convertDateToUTC(selectedDate), mentor.userId);
  const bookingMutation = useBooking();
  const queryClient = useQueryClient();

  // Extract blocks and booked slots from schedule data
  const timeBlocks = useMemo(() => scheduleData?.blocks ?? [], [scheduleData]);
  const bookedSlots = useMemo(
    () => scheduleData?.bookedSlots ?? [],
    [scheduleData],
  );

  // Generate calendar days based on selected month
  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Determine start and end dates
    let startDate: Date;

    if (selectedYear === currentYear && selectedMonth === currentMonth) {
      // Current month: from today to end of month
      startDate = new Date(today);
    } else if (
      selectedYear > currentYear ||
      (selectedYear === currentYear && selectedMonth > currentMonth)
    ) {
      // Future month: from first day of the month
      startDate = new Date(selectedYear, selectedMonth, 1);
    } else {
      // Past month: return empty array (shouldn't happen with navigation controls)
      return [];
    }

    // End date is the last day of the selected month
    const endDate = new Date(selectedYear, selectedMonth + 1, 0);

    // Generate all days from start to end
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }, [selectedDate]);

  const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatWeekday = (date: Date) => {
    const day = date.getDay();
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return days[day];
  };

  // Reset carousel to start when month changes
  useEffect(() => {
    if (carouselApi) {
      carouselApi.scrollTo(0);
    }
  }, [selectedDate.getMonth(), selectedDate.getFullYear(), carouselApi]);

  // Sort time blocks by start time
  const sortedTimeBlocks = useMemo(() => {
    return [...timeBlocks].sort((a, b) => {
      const [aHour, aMin] = a.startTime.split(":").map(Number);
      const [bHour, bMin] = b.startTime.split(":").map(Number);
      const aMinutes = aHour * 60 + aMin;
      const bMinutes = bHour * 60 + bMin;
      return aMinutes - bMinutes;
    });
  }, [timeBlocks]);

  // Check if a time slot is booked
  const isSlotBooked = (time: string): boolean => {
    const [h, m] = time.split(":").map(Number);

    // Create a date object for the slot time on the selected date
    const slotDate = new Date(selectedDate);
    slotDate.setHours(h, m, 0, 0);
    const slotTime = slotDate.getTime();
    const slotEndTime = slotTime + SLOT_DURATION * 60 * 1000;

    return bookedSlots.some((booked) => {
      const bookedStart = new Date(booked.startAt).getTime();
      const bookedEnd = new Date(booked.endAt).getTime();

      // A slot is booked if it overlaps with any booked range
      // Slot overlaps if: slotStart < bookedEnd AND slotEnd > bookedStart
      // Use <= for bookedEnd to include slots that start exactly when a booking ends
      return slotTime <= bookedEnd && slotEndTime > bookedStart;
    });
  };

  // Check if a time slot is in the past
  const isPastSlot = (time: string): boolean => {
    // Only check for past times if the selected date is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateNormalized = new Date(selectedDate);
    selectedDateNormalized.setHours(0, 0, 0, 0);

    if (selectedDateNormalized.getTime() !== today.getTime()) {
      // Not today, so no slots are in the past
      return false;
    }

    // Get current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Parse the slot time
    const [slotHour, slotMinute] = time.split(":").map(Number);

    // Compare: slot is in the past if it's before or equal to current time
    if (slotHour < currentHour) {
      return true;
    } else if (slotHour === currentHour && slotMinute <= currentMinute) {
      return true;
    }

    return false;
  };

  // Generate slots for a block with 15-minute steps
  const generateSlots = (
    block: TimeBlockDto,
  ): { time: string; isBooked: boolean; isPast: boolean }[] => {
    const slots: { time: string; isBooked: boolean; isPast: boolean }[] = [];
    const [startH, startM] = block.startTime.split(":").map(Number);
    const [endH, endM] = block.endTime.split(":").map(Number);

    let currentInMinutes = startH * 60 + startM;
    const endInMinutes = endH * 60 + endM;

    while (currentInMinutes <= endInMinutes) {
      const h = Math.floor(currentInMinutes / 60)
        .toString()
        .padStart(2, "0");
      const m = (currentInMinutes % 60).toString().padStart(2, "0");
      const time = `${h}:${m}`;
      slots.push({
        time,
        isBooked: isSlotBooked(time),
        isPast: isPastSlot(time),
      });
      currentInMinutes += SLOT_DURATION;
    }
    return slots;
  };

  // Helper to convert time string to minutes
  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  // Check if there's a booked slot between two times
  const hasBookedSlotInRange = (
    startTime: string,
    endTime: string,
  ): boolean => {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    const rangeStartDate = new Date(selectedDate);
    rangeStartDate.setHours(startH, startM, 0, 0);
    const rangeStart = rangeStartDate.getTime();

    const rangeEndDate = new Date(selectedDate);
    rangeEndDate.setHours(endH, endM, 0, 0);
    const rangeEnd = rangeEndDate.getTime();

    return bookedSlots.some((booked) => {
      const bookedStart = new Date(booked.startAt).getTime();
      const bookedEnd = new Date(booked.endAt).getTime();

      // Check if the booked slot overlaps with our range
      // A booked slot is "in between" if it starts after rangeStart and before rangeEnd
      // OR if it ends after rangeStart and before rangeEnd
      return bookedStart < rangeEnd && bookedEnd > rangeStart;
    });
  };

  // Handle slot click
  const handleSlotClick = (time: string, blockIdx: number) => {
    // Determine which block logic to use
    // If startRange is set, check if we are in the same block
    if (startRange && !endRange) {
      if (
        startRange.date.toDateString() !== selectedDate.toDateString() ||
        startRange.blockIdx !== blockIdx
      ) {
        // Different date or different block -> New Start
        setStartRange({ date: selectedDate, time, blockIdx });
        setEndRange(null);
        return;
      }

      // Same block, check if time is after start
      const startMins = timeToMinutes(startRange.time);
      const currMins = timeToMinutes(time);

      if (currMins > startMins) {
        // Check if there's a booked slot between start and end
        if (hasBookedSlotInRange(startRange.time, time)) {
          // Don't allow selection across booked slots - start new range
          setStartRange({ date: selectedDate, time, blockIdx });
          setEndRange(null);
          return;
        }
        setEndRange({ date: selectedDate, time });
      } else {
        // New Start (clicked before or on same)
        setStartRange({ date: selectedDate, time, blockIdx });
        setEndRange(null);
      }
    } else {
      // No start range or already have full range -> New Start
      setStartRange({ date: selectedDate, time, blockIdx });
      setEndRange(null);
    }
  };

  // Checking selection status
  const getSlotStatus = (time: string) => {
    if (!startRange) return "default";
    if (startRange.date.toDateString() !== selectedDate.toDateString())
      return "default";

    if (startRange.time === time) return "selected-start";
    if (endRange && endRange.time === time) return "selected-end";

    if (startRange && endRange) {
      const startMin = timeToMinutes(startRange.time);
      const endMin = timeToMinutes(endRange.time);
      const curMin = timeToMinutes(time);
      if (curMin > startMin && curMin < endMin) return "in-range";
    }

    return "default";
  };

  // Calculate duration
  const duration = useMemo(() => {
    if (
      startRange &&
      endRange &&
      startRange.date.toDateString() === endRange.date.toDateString()
    ) {
      const sM = timeToMinutes(startRange.time);
      const eM = timeToMinutes(endRange.time);
      return eM - sM;
    }
    return 0;
  }, [startRange, endRange]);

  // Handle confirm booking
  const handleConfirmBooking = () => {
    if (!startRange || !endRange) return;

    // Create ISO datetime strings
    const startDateTime = new Date(startRange.date);
    const [startHour, startMinute] = startRange.time.split(":").map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(endRange.date);
    const [endHour, endMinute] = endRange.time.split(":").map(Number);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    const bookingRequest = {
      mentorId: mentor.userId,
      startAt: startDateTime.toISOString(),
      endAt: endDateTime.toISOString(),
    };

    bookingMutation.mutate(bookingRequest, {
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
        queryClient.invalidateQueries({ queryKey: ["mentor-schedules"] });
        // Reset selection
        setStartRange(null);
        setEndRange(null);
        // Close confirmation dialog and main drawer
        setShowConfirmDialog(false);
        onClose();
      },
      onError: (err) => {
        toast.error(`Lỗi: ${err.response?.data.message || err.message}`);
        setShowConfirmDialog(false);
      },
    });
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={onClose}
      direction="right"
      dismissible={false}
    >
      <DrawerContent className="inset-0 max-h-screen h-screen w-screen flex flex-col">
        <VisuallyHidden.Root>
          <DrawerTitle>Đặt lịch với {mentor.name}</DrawerTitle>
          <DrawerDescription>
            Chọn thời gian phù hợp để đặt lịch
          </DrawerDescription>
        </VisuallyHidden.Root>

        {/* Header - Fixed */}
        <DrawerHeader className="p-6 border-b flex flex-row items-center justify-between bg-card z-20 shrink-0 shadow-sm">
          <div className="flex gap-4 items-center">
            <Avatar className="h-12 w-12 border-2 border-primary/10">
              <AvatarImage src={mentor.avatar} />
              <AvatarFallback>{mentor.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-lg">
                <span className="hidden md:inline">Đặt lịch với </span>
                {mentor.name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  <span className="hidden md:inline">
                    Giá trung bình 1 giờ:{" "}
                  </span>
                  {new Intl.NumberFormat("vi-VN").format(mentor.pricePerHour)}{" "}
                  VND
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-orange-400 font-medium">
                  {mentor.avgRating.toFixed(1)} ⭐
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </DrawerHeader>

        {/* Content Area - Flex Column */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Calendar Strip - Sticky behavior but handled via structure */}
          <div className="py-4 px-6 border-b bg-background/95 backdrop-blur-sm z-10 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 mx-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const newDate = new Date(selectedDate);
                    newDate.setMonth(selectedDate.getMonth() - 1);

                    // Allow going back to current month but not before
                    const firstDayOfCurrentMonth = new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      1,
                    );

                    if (newDate >= firstDayOfCurrentMonth) {
                      // If navigating to current month, select today; otherwise, select first day
                      if (
                        newDate.getMonth() === today.getMonth() &&
                        newDate.getFullYear() === today.getFullYear()
                      ) {
                        setSelectedDate(new Date(today));
                      } else {
                        newDate.setDate(1); // First day of the month
                        setSelectedDate(newDate);
                      }
                    }
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-semibold w-40 text-center capitalize">
                  {formatMonthYear(selectedDate)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(selectedDate.getMonth() + 1);
                    newDate.setDate(1); // First day of next month
                    setSelectedDate(newDate);
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Carousel
              opts={{
                align: "start",
                slidesToScroll: 3,
              }}
              setApi={setCarouselApi}
              className="w-full max-w-7xl mx-auto"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {calendarDays.map((date, idx) => {
                  const isSelected =
                    date.toDateString() === selectedDate.toDateString();
                  const dayName = formatWeekday(date);
                  const dayNum = date.getDate();

                  return (
                    <CarouselItem key={idx} className="pl-2 md:pl-4 basis-auto">
                      <button
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "flex flex-col items-center justify-center min-w-16 h-16 rounded-xl border transition-all",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-md transform scale-105"
                            : "bg-background hover:bg-muted text-muted-foreground border-transparent hover:border-border",
                        )}
                      >
                        <span className="text-xs font-medium opacity-80">
                          {dayName}
                        </span>
                        <span className="text-xl font-bold">{dayNum}</span>
                        {isSelected && (
                          <div className="w-1 h-1 rounded-full bg-white mt-1" />
                        )}
                      </button>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          {/* Time Slots - Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {isLoadingSchedules ? (
              <BookingSlotsSkeleton />
            ) : sortedTimeBlocks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground h-full flex flex-col items-center justify-center">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Không có lịch trống vào ngày này.</p>
              </div>
            ) : (
              sortedTimeBlocks.map((block, idx) => {
                const slots = generateSlots(block);

                return (
                  <div key={idx}>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={cn(
                          "p-2 rounded-lg bg-secondary text-foreground",
                        )}
                      >
                        <Clock className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold">
                        Khung giờ{" "}
                        {block.startTime.split(":").slice(0, 2).join(":")} -{" "}
                        {block.endTime.split(":").slice(0, 2).join(":")}
                      </h3>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-3">
                      {slots.map(({ time, isBooked, isPast }) => {
                        const status = getSlotStatus(time);

                        // Booked or past slots have disabled styling with strikethrough
                        if (isBooked || isPast) {
                          return (
                            <Button
                              key={time}
                              variant="outline"
                              disabled
                              className="h-10 transition-all duration-200 border bg-muted/30 text-muted-foreground border-transparent cursor-not-allowed relative"
                            >
                              <span className="line-through decoration-2">
                                {time}
                              </span>
                            </Button>
                          );
                        }

                        let btnClass =
                          "bg-secondary/50 text-foreground border-transparent"; // default - available

                        if (
                          status === "selected-start" ||
                          status === "selected-end"
                        ) {
                          btnClass =
                            "bg-primary dark:bg-primary hover:bg-primary dark:hover:bg-primary text-primary-foreground hover:text-primary-foreground border-primary shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background";
                        } else if (status === "in-range") {
                          btnClass =
                            "bg-primary/20 dark:bg-primary/30 hover:bg-primary/20 dark:hover:bg-primary/30 text-primary dark:text-primary hover:text-primary dark:hover:text-primary border-primary/30 dark:border-primary/40";
                        }

                        return (
                          <Button
                            key={time}
                            variant="outline"
                            className={cn(
                              "h-10 transition-all duration-200 border",
                              btnClass,
                            )}
                            onClick={() => handleSlotClick(time, idx)}
                          >
                            {time}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer - Fixed */}
        <DrawerFooter className="p-6 border-t bg-muted/30 mt-auto shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1 hidden md:block">
                Thời gian đã chọn (
                {duration > 0 ? `${duration} phút` : "0 phút"})
              </h4>
              <div className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Clock className="w-5 h-5 text-primary" />
                {startRange ? (
                  <span>
                    {startRange.time}
                    {endRange ? ` - ${endRange.time}` : " - ..."}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-lg font-normal">
                    Chọn thời gian bắt đầu
                  </span>
                )}
                {startRange && (
                  <span className="text-base font-normal text-muted-foreground ml-2 capitalize">
                    {new Intl.DateTimeFormat("vi-VN", {
                      weekday: "short",
                      month: "numeric",
                      day: "numeric",
                    }).format(startRange.date)}
                  </span>
                )}
              </div>
              {/* Calculate total price */}
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Tổng chi phí: </span>
                <span className="font-bold text-primary">
                  {new Intl.NumberFormat("vi-VN").format(
                    Math.round((duration / 60) * mentor.pricePerHour),
                  )}{" "}
                  VND
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 sm:flex-none"
              >
                Hủy
              </Button>
              <Button
                className="flex-1 sm:flex-none min-w-[140px]"
                disabled={!startRange || !endRange || bookingMutation.isPending}
                onClick={() => setShowConfirmDialog(true)}
              >
                Xác nhận đặt lịch
              </Button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-lg">
            <Info className="w-4 h-4 shrink-0 text-blue-500" />
            <p>
              Chọn giờ bắt đầu, sau đó chọn giờ kết thúc. Thời lượng tối thiểu
              là 30 phút.
            </p>
          </div>
        </DrawerFooter>
      </DrawerContent>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đặt lịch</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Bạn có chắc chắn muốn đặt lịch với{" "}
                <span className="font-semibold">{mentor.name}</span>?
              </p>
              {startRange && endRange && (
                <div className="mt-3 p-3 bg-muted rounded-lg space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thời gian:</span>
                    <span className="font-medium">
                      {startRange.time} - {endRange.time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày:</span>
                    <span className="font-medium capitalize">
                      {new Intl.DateTimeFormat("vi-VN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(startRange.date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thời lượng:</span>
                    <span className="font-medium">{duration} phút</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-muted-foreground">Tổng chi phí:</span>
                    <span className="font-bold text-primary">
                      {new Intl.NumberFormat("vi-VN").format(
                        Math.round((duration / 60) * mentor.pricePerHour),
                      )}{" "}
                      VND
                    </span>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bookingMutation.isPending}>
              Hủy
            </AlertDialogCancel>
            <Button
              onClick={handleConfirmBooking}
              disabled={bookingMutation.isPending}
            >
              {bookingMutation.isPending ? (
                <>
                  <Spinner /> Đang xử lý...
                </>
              ) : (
                "Xác nhận"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Drawer>
  );
}
