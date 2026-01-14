
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

// Types
interface BookingBlock {
  dayOfWeek: number; // 0-6 (Sun-Sat) or 1-7. Let's assume 0=Sun, 1=Mon...
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  isActive: boolean;
}

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: {
    id: string;
    name: string;
    avatar: string;
    position: string;
    company: string;
    pricePerHour: number;
    avgRating: number;
  };
}

// Fake Data
const FAKE_AVAILABILITY: BookingBlock[] = [
  { dayOfWeek: 1, startTime: "08:00", endTime: "12:00", isActive: true }, // Mon
  { dayOfWeek: 1, startTime: "13:00", endTime: "17:00", isActive: true }, // Mon
  { dayOfWeek: 2, startTime: "09:00", endTime: "11:00", isActive: true }, // Tue
  { dayOfWeek: 2, startTime: "14:00", endTime: "16:00", isActive: true }, // Tue
  { dayOfWeek: 3, startTime: "08:00", endTime: "12:00", isActive: true }, // Wed
  { dayOfWeek: 3, startTime: "13:00", endTime: "17:00", isActive: true }, // Wed
  { dayOfWeek: 4, startTime: "08:00", endTime: "12:00", isActive: true }, // Thu
  { dayOfWeek: 4, startTime: "13:00", endTime: "17:00", isActive: true }, // Thu
  { dayOfWeek: 5, startTime: "08:00", endTime: "11:30", isActive: true }, // Fri
];

const SLOT_DURATION = 15; // minutes

export function BookingDialog({ isOpen, onClose, mentor }: BookingDialogProps) {
  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startRange, setStartRange] = useState<{ date: Date; time: string; blockIdx: number } | null>(null);
  const [endRange, setEndRange] = useState<{ date: Date; time: string } | null>(null);

  // Generate calendar days (next 14 days)
  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  }, []);

  const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(date);
  };

  const formatWeekday = (date: Date) => {
    const day = date.getDay();
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[day];
  }

  const getDayOfWeek = (date: Date) => date.getDay();

  // Get blocks for selected date
  const dayBlocks = useMemo(() => {
    const dayOfWeek = getDayOfWeek(selectedDate);
    return FAKE_AVAILABILITY.filter((b) => b.dayOfWeek === dayOfWeek && b.isActive);
  }, [selectedDate]);

  // Generate slots for a block
  const generateSlots = (block: BookingBlock) => {
    const slots: string[] = [];
    const [startH, startM] = block.startTime.split(":").map(Number);
    const [endH, endM] = block.endTime.split(":").map(Number);

    let currentInMinutes = startH * 60 + startM;
    const endInMinutes = endH * 60 + endM;

    while (currentInMinutes < endInMinutes) {
      const h = Math.floor(currentInMinutes / 60).toString().padStart(2, "0");
      const m = (currentInMinutes % 60).toString().padStart(2, "0");
      slots.push(`${h}:${m}`);
      currentInMinutes += SLOT_DURATION;
    }
    return slots;
  };

  // Helper to convert time string to minutes
  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  // Handle slot click
  const handleSlotClick = (time: string, blockIdx: number) => {
    // Determine which block logic to use
    // If startRange is set, check if we are in the same block
    if (startRange && !endRange) {
      if (startRange.date.toDateString() !== selectedDate.toDateString() || startRange.blockIdx !== blockIdx) {
        // Different date or different block -> New Start
        setStartRange({ date: selectedDate, time, blockIdx });
        setEndRange(null);
        return;
      }

      // Same block, check if time is after start
      const startMins = timeToMinutes(startRange.time);
      const currMins = timeToMinutes(time);

      if (currMins > startMins) {
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
    if (startRange.date.toDateString() !== selectedDate.toDateString()) return "default";

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
    if (startRange && endRange && startRange.date.toDateString() === endRange.date.toDateString()) {
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
    const [startHour, startMinute] = startRange.time.split(':').map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(endRange.date);
    const [endHour, endMinute] = endRange.time.split(':').map(Number);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    const bookingData = {
      mentorId: mentor.id,
      startAt: startDateTime.toISOString(),
      endAt: endDateTime.toISOString(),
    };

    console.log(bookingData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-2xl w-[95vw] p-0 gap-0 overflow-hidden sm:rounded-2xl h-[90vh] flex flex-col">
        <VisuallyHidden.Root>
          <DialogTitle>Đặt lịch với {mentor.name}</DialogTitle>
        </VisuallyHidden.Root>

        {/* Header - Fixed */}
        <div className="p-6 border-b flex items-center justify-between bg-card z-20 shrink-0 shadow-sm">
          <div className="flex gap-4 items-center">
            <Avatar className="h-12 w-12 border-2 border-primary/10">
              <AvatarImage src={mentor.avatar} />
              <AvatarFallback>{mentor.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-lg">Đặt lịch với {mentor.name}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Giá trung bình 1 giờ: {new Intl.NumberFormat('vi-VN').format(mentor.pricePerHour)} VND</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-orange-400 font-medium">
                  {mentor.avgRating.toFixed(1)} ⭐
                </span>
              </div>
            </div>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </DialogClose>
        </div>

        {/* Content Area - Flex Column */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Calendar Strip - Sticky behavior but handled via structure */}
          <div className="py-4 px-6 border-b bg-background/95 backdrop-blur-sm z-10 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 mx-auto">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(selectedDate.getDate() - 1);
                  if (newDate >= new Date()) setSelectedDate(newDate); // Prevent going to past
                }}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-semibold w-40 text-center capitalize">{formatMonthYear(selectedDate)}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(selectedDate.getDate() + 1);
                  setSelectedDate(newDate);
                }}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {calendarDays.map((date, idx) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const dayName = formatWeekday(date);
                const dayNum = date.getDate();

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "flex flex-col items-center justify-center min-w-16 h-16 rounded-xl border transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-md transform scale-105"
                        : "bg-background hover:bg-muted text-muted-foreground border-transparent hover:border-border"
                    )}
                  >
                    <span className="text-xs font-medium opacity-80">{dayName}</span>
                    <span className="text-xl font-bold">{dayNum}</span>
                    {isSelected && <div className="w-1 h-1 rounded-full bg-white mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots - Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {dayBlocks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground h-full flex flex-col items-center justify-center">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Không có lịch trống vào ngày này.</p>
                <Button variant="link" onClick={() => {
                  // find next available day
                  const next = calendarDays.find(d => {
                    const dw = getDayOfWeek(d);
                    return FAKE_AVAILABILITY.some(b => b.dayOfWeek === dw && b.isActive);
                  });
                  if (next) setSelectedDate(next);
                }}>Xem ngày có lịch gần nhất</Button>
              </div>
            ) : (
              dayBlocks.map((block, idx) => {
                const slots = generateSlots(block);

                // Check if this block contains the selection start to highlight opacity maybe?
                // For now just standard render

                return (
                  <div key={idx}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn("p-2 rounded-lg bg-secondary text-foreground")}>
                        <Clock className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold">
                        Khung giờ {block.startTime} - {block.endTime}
                      </h3>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-3">
                      {slots.map(slot => {
                        const status = getSlotStatus(slot);
                        let btnClass = "bg-secondary/50 text-foreground border-transparent"; // default - no hover

                        if (status === "selected-start" || status === "selected-end") {
                          btnClass = "bg-primary dark:bg-primary hover:bg-primary dark:hover:bg-primary text-primary-foreground hover:text-primary-foreground border-primary shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background";
                        } else if (status === "in-range") {
                          btnClass = "bg-primary/20 dark:bg-primary/30 hover:bg-primary/20 dark:hover:bg-primary/30 text-primary dark:text-primary hover:text-primary dark:hover:text-primary border-primary/30 dark:border-primary/40";
                        }

                        return (
                          <Button
                            key={slot}
                            variant="outline"
                            className={cn("h-10 transition-all duration-200 border", btnClass)}
                            onClick={() => handleSlotClick(slot, idx)}
                          >
                            {slot}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 border-t bg-muted/30 mt-auto shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Thời gian đã chọn ({duration > 0 ? `${duration} phút` : "0 phút"})</h4>
              <div className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Clock className="w-5 h-5 text-primary" />
                {startRange ? (
                  <span>
                    {startRange.time}
                    {endRange ? ` - ${endRange.time}` : " - ..."}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-lg font-normal">Chọn thời gian bắt đầu</span>
                )}
                {startRange && <span className="text-base font-normal text-muted-foreground ml-2 capitalize">{new Intl.DateTimeFormat("vi-VN", { weekday: "short", month: "numeric", day: "numeric" }).format(startRange.date)}</span>}
              </div>
              {/* Calculate total price */}
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Tổng chi phí: </span>
                <span className="font-bold text-primary">{new Intl.NumberFormat('vi-VN').format(Math.round((duration / 60) * mentor.pricePerHour))} VND</span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">Hủy</Button>
              <Button className="flex-1 sm:flex-none min-w-[140px]" disabled={!startRange || !endRange} onClick={handleConfirmBooking}>
                Xác nhận đặt lịch
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-lg">
            <Info className="w-4 h-4 shrink-0 text-blue-500" />
            <p>Chọn giờ bắt đầu, sau đó chọn giờ kết thúc. Thời lượng tối thiểu là 30 phút.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
