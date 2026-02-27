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
  Check,
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
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useNavigate } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { USER_ROLES } from "@/types/user";

interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: MentorInfo;
}

const SLOT_DURATION = 15; // minutes

type BookingStep = "booking" | "payment" | "completed";

// Step Progress Component
function StepProgress({ currentStep }: { currentStep: BookingStep }) {
  const steps = [
    { id: "booking", label: "Đặt lịch", number: 1 },
    { id: "payment", label: "Thanh toán", number: 2 },
    { id: "completed", label: "Hoàn tất", number: 3 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 px-6 py-4 border-b bg-background">
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = step.id === currentStep;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent &&
                    "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !isCompleted &&
                    !isCurrent &&
                    "bg-muted text-muted-foreground",
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.number}
              </div>
              <span
                className={cn(
                  "text-xs mt-1 font-medium",
                  isCurrent && "text-primary",
                  !isCurrent && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Divider Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-12 h-0.5 mx-2 mb-4",
                  index < currentStepIndex ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function BookingDrawer({ isOpen, onClose, mentor }: BookingDrawerProps) {
  // State
  const [currentStep, setCurrentStep] = useState<BookingStep>("booking");
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

  // Fetch mentor schedules for the selected date
  const { data: scheduleData, isLoading: isLoadingSchedules } =
    useGetMentorSchedules(convertDateToUTC(selectedDate), mentor.userId);
  const bookingMutation = useBooking();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

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
        // Move to completed step
        setCurrentStep("completed");
      },
      onError: (err) => {
        toast.error(`Lỗi: ${err.response?.data.message || err.message}`);
      },
    });
  };

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    if (startRange && endRange) {
      setCurrentStep("payment");
    }
  };

  // Handle close and reset
  const handleClose = () => {
    setCurrentStep("booking");
    setStartRange(null);
    setEndRange(null);
    onClose();
  };

  // Render Payment Screen
  const renderPaymentScreen = () => {
    function fnv1a64(input: string) {
      let hash = BigInt("0xcbf29ce484222325"); // offset basis
      const prime = BigInt("0x100000001b3");

      for (let i = 0; i < input.length; i++) {
        hash ^= BigInt(input.charCodeAt(i));
        hash = (hash * prime) & BigInt("0xFFFFFFFFFFFFFFFF");
      }

      return hash;
    }
    function shortFromGuid(guid: string, len = 8) {
      return fnv1a64(guid).toString(36).toUpperCase().slice(0, len);
    }
    if (!startRange || !endRange) return null;

    const amount = Math.round((duration / 60) * mentor.pricePerHour);
    const dateStr = new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(startRange.date);
    const addInfo = `MENTORX${shortFromGuid(mentor.userId)}${startRange.time.split(":").join("")}${endRange.time.split(":").join("")}${dateStr.split("/").join("")}`;
    console.log(addInfo);
    const qrUrl = `https://img.vietqr.io/image/tpbank-00000117197-compact2.jpg?amount=${amount}&addInfo=${addInfo}&accountName=mentor%20x`;

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Left: Session Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4 text-muted-foreground uppercase">
              Thông tin buổi học
            </h3>

            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16 border-2 border-primary/10">
                <AvatarImage src={mentor.avatar} className="object-cover" />
                <AvatarFallback>{mentor.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold text-lg">{mentor.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {`${mentor.position} @ ${mentor.company}`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CalendarIcon className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Thời gian</p>
                  <p className="font-medium">
                    {startRange.time} - {endRange.time},{" "}
                    {new Intl.DateTimeFormat("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).format(startRange.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Thời lượng</p>
                  <p className="font-medium">{duration} phút</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t">
                <div className="w-5 h-5 flex items-center justify-center text-primary">
                  <svg
                    className="w-5 h-5"
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
                  <p className="font-bold text-xl text-primary">
                    {new Intl.NumberFormat("vi-VN").format(
                      Math.round((duration / 60) * mentor.pricePerHour),
                    )}{" "}
                    đ
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Buổi học sẽ được xác nhận sau khi có thông nhận được thanh toán
                của bạn.
              </p>
            </div>
          </div>

          {/* Right: QR Code */}
          <div className="flex flex-col items-center justify-center bg-teal-600/10 rounded-lg p-8 border-2 border-dashed border-teal-600/30">
            <div className="bg-white p-6 rounded-lg shadow-lg mb-4 flex items-center justify-center overflow-hidden">
              <img
                src={qrUrl}
                alt="Mã QR thanh toán"
                className="w-55 h-68 object-cover scale-x-125 scale-y-120"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Completed Screen
  const renderCompletedScreen = () => {
    if (!startRange || !endRange) return null;

    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold">Đặt lịch thành công!</h2>
          <p className="text-muted-foreground">
            Buổi học của bạn đã được xác nhận và thêm vào lịch. Email xác nhận
            đã được gửi.
          </p>

          {/* Session Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-left">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-3">
              Chi tiết buổi học
            </h4>

            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={mentor.avatar} className="object-cover" />
                <AvatarFallback>{mentor.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">Mentor</p>
                <p className="text-sm text-muted-foreground">{mentor.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Ngày</p>
                <p className="font-medium">
                  {new Intl.DateTimeFormat("vi-VN", {
                    weekday: "long",
                    day: "numeric",
                    month: "numeric",
                  }).format(startRange.date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Thời gian</p>
                <p className="font-medium">
                  {startRange.time} - {endRange.time}
                </p>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              handleClose();
              navigate({
                to: "/user/schedules",
              });
            }}
          >
            Xem lịch học của tôi
          </Button>

          <Button variant="ghost" className="w-full" onClick={handleClose}>
            Đóng
          </Button>
        </div>
      </div>
    );
  };

  // Render Booking Screen
  const renderBookingScreen = () => {
    return (
      <>
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
                onClick={handleClose}
                className="flex-1 sm:flex-none"
              >
                Hủy
              </Button>
              {user && user.role === USER_ROLES.USER ? (
                <Button
                  className="flex-1 sm:flex-none min-w-[140px]"
                  disabled={!startRange || !endRange}
                  onClick={handleProceedToPayment}
                >
                  Tiếp tục
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    navigate({
                      to: "/login",
                    })
                  }
                >
                  Đăng nhập để đặt lịch
                </Button>
              )}
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
      </>
    );
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={handleClose}
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
            onClick={handleClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </DrawerHeader>

        {/* Step Progress */}
        <StepProgress currentStep={currentStep} />

        {/* Render content based on current step */}
        {currentStep === "booking" && renderBookingScreen()}
        {currentStep === "payment" && (
          <>
            {renderPaymentScreen()}
            <DrawerFooter className="p-6 border-t bg-muted/30 shrink-0">
              <div className="flex items-center gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("booking")}
                >
                  Quay lại
                </Button>
                <Button
                  onClick={handleConfirmBooking}
                  disabled={bookingMutation.isPending}
                  className="min-w-[180px]"
                >
                  {bookingMutation.isPending ? (
                    <>
                      <Spinner /> Đang xử lý...
                    </>
                  ) : (
                    "Xác nhận thanh toán"
                  )}
                </Button>
              </div>
            </DrawerFooter>
          </>
        )}
        {currentStep === "completed" && renderCompletedScreen()}
      </DrawerContent>
    </Drawer>
  );
}
