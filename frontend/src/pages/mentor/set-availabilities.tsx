import { createLazyRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type AvailabilitySlot = {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string;
  endTime: string;
  isActive: boolean;
};

const DAYS_OF_WEEK = [
  'Chủ nhật',
  'Thứ hai',
  'Thứ ba',
  'Thứ tư',
  'Thứ năm',
  'Thứ sáu',
  'Thứ bảy',
];

// Sample initial data from backend
const INITIAL_SLOTS: AvailabilitySlot[] = [
  { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', isActive: true },
  { dayOfWeek: 1, startTime: '13:00', endTime: '17:00', isActive: false },
  { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isActive: true },
  { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isActive: true },
  { dayOfWeek: 5, startTime: '18:00', endTime: '09:00', isActive: true },
];

const SetAvailabilities = () => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(INITIAL_SLOTS);
  const [initialSlots] = useState<AvailabilitySlot[]>(INITIAL_SLOTS);

  const getSlotsByDay = (dayOfWeek: number) => {
    return slots.filter((slot) => slot.dayOfWeek === dayOfWeek);
  };

  const isDayEnabled = (dayOfWeek: number) => {
    const daySlots = getSlotsByDay(dayOfWeek);
    return daySlots.length > 0 && daySlots.some((slot) => slot.isActive);
  };

  const toggleDay = (dayOfWeek: number) => {
    const daySlots = getSlotsByDay(dayOfWeek);
    const hasActiveSlots = daySlots.some((slot) => slot.isActive);

    setSlots((prev) =>
      prev.map((slot) =>
        slot.dayOfWeek === dayOfWeek
          ? { ...slot, isActive: !hasActiveSlots }
          : slot
      )
    );
  };

  const toggleSlot = (dayOfWeek: number, index: number) => {
    setSlots((prev) => {
      const daySlots = prev.filter((s) => s.dayOfWeek === dayOfWeek);
      const slotToToggle = daySlots[index];
      return prev.map((s) =>
        s === slotToToggle ? { ...s, isActive: !s.isActive } : s
      );
    });
  };

  const updateSlotTime = (
    dayOfWeek: number,
    index: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setSlots((prev) => {
      const daySlots = prev.filter((s) => s.dayOfWeek === dayOfWeek);
      const slotToUpdate = daySlots[index];
      return prev.map((s) =>
        s === slotToUpdate ? { ...s, [field]: value } : s
      );
    });
  };

  const addSlot = (dayOfWeek: number) => {
    const newSlot: AvailabilitySlot = {
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
      isActive: true,
    };
    setSlots((prev) => [...prev, newSlot]);
  };

  const deleteSlot = (dayOfWeek: number, index: number) => {
    setSlots((prev) => {
      const daySlots = prev.filter((s) => s.dayOfWeek === dayOfWeek);
      const slotToDelete = daySlots[index];
      return prev.filter((s) => s !== slotToDelete);
    });
  };

  const copySchedule = (sourceDayOfWeek: number) => {
    const sourceSlots = getSlotsByDay(sourceDayOfWeek);
    const slotsToAdd: AvailabilitySlot[] = [];

    // Remove all slots from other days and add copies from source day
    setSlots((prev) => {
      const remainingSlots = prev.filter(
        (s) => s.dayOfWeek === sourceDayOfWeek
      );

      // Create copies for all other days
      for (let day = 0; day < 7; day++) {
        if (day !== sourceDayOfWeek) {
          sourceSlots.forEach((slot) => {
            slotsToAdd.push({
              ...slot,
              dayOfWeek: day,
            });
          });
        }
      }

      return [...remainingSlots, ...slotsToAdd];
    });
  };

  const validateTimeSlot = (startTime: string, endTime: string): boolean => {
    if (!startTime || !endTime) return true;
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    return startHour * 60 + startMin < endHour * 60 + endMin;
  };

  const handleSave = () => {
    // Send slots array to backend
    console.log('Saving slots:', slots);
    // TODO: API call to save slots
  };

  const handleCancel = () => {
    // Rollback to initial state
    setSlots([...initialSlots]);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="grow flex flex-col items-center py-8 px-4 sm:px-10 lg:px-40">
        <div className="flex flex-col w-full max-w-[960px] gap-6">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-end gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col gap-2">
              <h1 className="text-foreground text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                Lịch làm việc hàng tuần
              </h1>
              <p className="text-muted-foreground text-base font-normal leading-normal">
                Thiết lập lịch làm việc định kỳ hàng tuần của bạn. Bật/tắt các
                khung giờ cụ thể để kiểm soát chi tiết.
              </p>
            </div>

          </div>

          {/* Day Cards */}
          <div className="flex flex-col gap-4">
            {DAYS_OF_WEEK.map((dayName, dayOfWeek) => {
              const daySlots = getSlotsByDay(dayOfWeek);
              const dayEnabled = isDayEnabled(dayOfWeek);
              const hasInvalidSlots = daySlots.some(
                (slot) => !validateTimeSlot(slot.startTime, slot.endTime)
              );

              return (
                <Card
                  key={dayOfWeek}
                  className={cn(
                    'group p-5 transition-all hover:shadow-md',
                    !dayEnabled && 'opacity-50 hover:opacity-100',
                    hasInvalidSlots &&
                    dayEnabled &&
                    'border-red-200 dark:border-red-900/50 relative overflow-hidden'
                  )}
                >
                  {hasInvalidSlots && dayEnabled && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-top gap-4">
                    {/* Day Toggle */}
                    <div className="flex items-center justify-between w-full sm:w-48 shrink-0 pt-2">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={dayEnabled}
                          onCheckedChange={() => toggleDay(dayOfWeek)}
                        />
                        <span
                          className={cn(
                            'text-base font-bold',
                            dayEnabled
                              ? 'text-foreground'
                              : 'text-muted-foreground font-medium'
                          )}
                        >
                          {dayName}
                        </span>
                      </div>
                    </div>

                    {/* Slots or Inactive Message */}
                    {daySlots.length > 0 ? (
                      <div className="flex-1 flex flex-col gap-4 w-full">
                        {/* Time Slots */}
                        {daySlots.map((slot, index) => {
                          const isInvalid = !validateTimeSlot(
                            slot.startTime,
                            slot.endTime
                          );

                          return (
                            <div key={index} className="flex flex-col gap-1">
                              <div
                                className={cn(
                                  'flex flex-wrap items-center gap-3 w-full p-2 rounded-lg border transition-colors',
                                  slot.isActive && !isInvalid
                                    ? 'bg-muted/30 border-transparent hover:border-border'
                                    : '',
                                  !slot.isActive
                                    ? 'bg-muted/30 border-transparent hover:border-border opacity-60 grayscale'
                                    : '',
                                  isInvalid && slot.isActive
                                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                                    : ''
                                )}
                              >
                                {/* Slot Toggle */}
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={slot.isActive}
                                    onCheckedChange={() =>
                                      toggleSlot(dayOfWeek, index)
                                    }
                                    className="data-[state=checked]:bg-green-500"
                                  />
                                </div>

                                {/* Time Inputs */}
                                <div className="flex items-center gap-2 flex-1">
                                  <div
                                    className={cn(
                                      'flex items-center gap-2 bg-background p-1 rounded border shadow-sm',
                                      isInvalid
                                        ? 'border-red-300 dark:border-red-700'
                                        : 'border-border'
                                    )}
                                  >
                                    <Input
                                      type="time"
                                      value={slot.startTime}
                                      onChange={(e) =>
                                        updateSlotTime(
                                          dayOfWeek,
                                          index,
                                          'startTime',
                                          e.target.value
                                        )
                                      }
                                      disabled={!slot.isActive}
                                      className={cn(
                                        'w-24 md:w-28 border-0 bg-transparent py-1 px-2 text-sm font-medium focus-visible:ring-0 focus-visible:ring-offset-0 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none',
                                        isInvalid &&
                                        'text-red-900 dark:text-red-200',
                                        !slot.isActive && 'cursor-not-allowed'
                                      )}
                                    />
                                    <span
                                      className={cn(
                                        'text-xs font-medium',
                                        isInvalid
                                          ? 'text-red-400'
                                          : 'text-muted-foreground'
                                      )}
                                    >
                                      ĐẾN
                                    </span>
                                    <Input
                                      type="time"
                                      value={slot.endTime}
                                      onChange={(e) =>
                                        updateSlotTime(
                                          dayOfWeek,
                                          index,
                                          'endTime',
                                          e.target.value
                                        )
                                      }
                                      disabled={!slot.isActive}
                                      className={cn(
                                        'w-24 md:w-28 border-0 bg-transparent py-1 px-2 text-sm font-medium focus-visible:ring-0 focus-visible:ring-offset-0 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none',
                                        isInvalid &&
                                        'text-red-900 dark:text-red-200',
                                        !slot.isActive && 'cursor-not-allowed'
                                      )}
                                    />
                                  </div>
                                </div>

                                {/* Delete Button */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  onClick={() => deleteSlot(dayOfWeek, index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Error Message */}
                              {isInvalid && slot.isActive && (
                                <span className="text-xs text-red-600 font-medium ml-1">
                                  Thời gian kết thúc phải sau thời gian bắt đầu
                                </span>
                              )}
                            </div>
                          );
                        })}

                        {/* Add Slot Button */}
                        <div className="pt-1">
                          <Button
                            variant="ghost"
                            className="flex items-center gap-1.5 text-primary hover:text-primary hover:bg-primary/10 px-2 py-1 h-auto"
                            onClick={() => addSlot(dayOfWeek)}
                          >
                            <Plus className="h-4 w-4" />
                            <span className="text-sm font-semibold">
                              Thêm khung giờ
                            </span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 w-full">
                        <Button
                          variant="ghost"
                          className="flex items-center gap-1.5 text-primary hover:text-primary hover:bg-primary/10 px-2 py-1 h-auto"
                          onClick={() => addSlot(dayOfWeek)}
                        >
                          <Plus className="h-4 w-4" />
                          <span className="text-sm font-semibold">
                            Thêm khung giờ
                          </span>
                        </Button>
                      </div>
                    )}

                    {/* Copy Button */}
                    <div className="hidden sm:block pt-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-primary"
                        onClick={() => copySchedule(dayOfWeek)}
                        disabled={!dayEnabled}
                        title={
                          dayEnabled
                            ? 'Sao chép lịch'
                            : 'Bật ngày này để sao chép'
                        }
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 bg-background/90 backdrop-blur-md border-t border-border p-4 mt-4 flex justify-end gap-3 rounded-t-xl z-10">
            <Button
              variant="ghost"
              className="px-6 py-2.5"
              onClick={handleCancel}
            >
              Hủy
            </Button>
            <Button className="px-6 py-2.5 shadow-lg" onClick={handleSave}>
              Lưu lịch làm việc
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Route = createLazyRoute('/mentor/set-availabilities')({
  component: SetAvailabilities,
});

export default SetAvailabilities;
