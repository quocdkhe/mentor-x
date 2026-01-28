import type { Badge } from "@/components/ui/badge";
import { TOPIC_TYPES, type TopicType } from "@/types/forum";
import type { VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | undefined) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60),
  );
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays === 0) {
    return `Hôm nay, lúc ${date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffInDays === 1) {
    return `Hôm qua, lúc ${date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffInDays <= 7) {
    const days = [
      "Chủ nhật",
      "Thứ hai",
      "Thứ ba",
      "Thứ tư",
      "Thứ năm",
      "Thứ sáu",
      "Thứ bảy",
    ];
    return `${days[date.getDay()]} lúc ${date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getTopicTypeMeta(type: TopicType | undefined): {
  label: string;
  variant: VariantProps<typeof Badge>["variant"];
} {
  if (!type) {
    return { label: "Khác", variant: "outline" };
  }
  switch (type) {
    case TOPIC_TYPES.QUESTION_AND_ANSWER:
      return { label: "Hỏi & Đáp", variant: "default" };

    case TOPIC_TYPES.NEWS:
      return { label: "Tin tức", variant: "secondary" };

    case TOPIC_TYPES.DISCUSSIOIN:
      return { label: "Thảo luận", variant: "outline" };

    case TOPIC_TYPES.SUGGESTION:
      return { label: "Đề xuất", variant: "destructive" };

    default:
      return { label: "Khác", variant: "outline" };
  }
}

export function convertDateToUTC(date: Date): string {
  // Set time to noon to avoid timezone-related date shifts when converting to ISO
  const dateAtNoon = new Date(date);
  dateAtNoon.setHours(12, 0, 0, 0);
  const dateISOString = dateAtNoon.toISOString();
  return dateISOString;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}
