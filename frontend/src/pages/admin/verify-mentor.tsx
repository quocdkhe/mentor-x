import { createLazyRoute } from "@tanstack/react-router";
import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useGetAllMentors, useToggleVerifyMentor } from "@/api/mentor";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { ShieldCheck, ShieldX, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type MentorInfo } from "@/types/mentor";
import { useQueryClient } from "@tanstack/react-query";

function VerifyMentorPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetAllMentors();
  const toggleVerifyMutation = useToggleVerifyMentor();
  const [selectedMentor, setSelectedMentor] = React.useState<MentorInfo | null>(
    null,
  );

  const handleToggleVerify = (mentorId: string, currentStatus: boolean) => {
    toggleVerifyMutation.mutate(
      { mentorId, isVerified: !currentStatus },
      {
        onSuccess: () => {
          toast.success(
            !currentStatus
              ? "Đã xác thực mentor thành công"
              : "Đã huỷ xác thực mentor thành công",
          );
          queryClient.invalidateQueries({
            queryKey: ["mentors"],
          });
          if (selectedMentor?.id === mentorId) {
            setSelectedMentor((prev) =>
              prev ? { ...prev, isVerified: !currentStatus } : null,
            );
          }
        },
        onError: (error) => {
          toast.error("Lỗi khi cập nhật trạng thái", {
            description: error.response?.data?.message || error.message,
          });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    );
  }

  const mentorList = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Xác thực Mentor</h1>
        <Badge variant="outline" className="text-base py-1 px-4">
          {mentorList.length} Mentor
        </Badge>
      </div>

      <div className="border rounded-lg bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mentor</TableHead>
              <TableHead>Chuyên môn</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mentorList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Không có mentor nào.
                </TableCell>
              </TableRow>
            ) : (
              mentorList.map((mentor: MentorInfo) => (
                <TableRow key={mentor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={mentor.avatar}
                          alt={mentor.name}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{mentor.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {mentor.position} @ {mentor.company}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[250px]">
                      {mentor.skills.slice(0, 2).map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {mentor.skills.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{mentor.skills.length - 2}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {mentor.isVerified ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Đã xác thực
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="opacity-70">
                        Chưa xác thực
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedMentor(mentor)}
                      >
                        Xem thông tin
                      </Button>
                      <Button
                        size="sm"
                        variant={mentor.isVerified ? "destructive" : "default"}
                        onClick={() =>
                          handleToggleVerify(mentor.userId, mentor.isVerified)
                        }
                        disabled={toggleVerifyMutation.isPending}
                        className={
                          !mentor.isVerified
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : ""
                        }
                      >
                        {toggleVerifyMutation.isPending ? (
                          <Spinner className="h-4 w-4 mr-1" />
                        ) : mentor.isVerified ? (
                          <ShieldX className="h-4 w-4 mr-1" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 mr-1" />
                        )}
                        {mentor.isVerified ? "Huỷ xác thực" : "Xác thực"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet
        open={!!selectedMentor}
        onOpenChange={(open) => !open && setSelectedMentor(null)}
      >
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Thông tin Mentor</SheetTitle>
            <SheetDescription>Chi tiết hồ sơ của mentor</SheetDescription>
          </SheetHeader>

          {selectedMentor && (
            <div className="grid gap-6 py-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    className="object-cover"
                    src={selectedMentor.avatar}
                    alt={selectedMentor.name}
                  />
                  <AvatarFallback className="text-2xl">
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-xl">{selectedMentor.name}</h3>
                  <p className="text-muted-foreground">
                    {selectedMentor.position} tại {selectedMentor.company}
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <h4 className="font-semibold mb-2">Thông tin cơ bản</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Kinh nghiệm:
                      </span>
                      <p className="font-medium">
                        {selectedMentor.yearsOfExperience} năm
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Giá thuê:</span>
                      <p className="font-medium">
                        {formatCurrency(selectedMentor.pricePerHour)}/giờ
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trạng thái:</span>
                      <p className="font-medium">
                        {selectedMentor.isVerified
                          ? "Đã xác thực"
                          : "Chưa xác thực"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Kỹ năng chuyên môn</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMentor.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Tiểu sử</h4>
                  <div
                    className="text-sm text-foreground/90 bg-muted/50 p-4 rounded-md prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{
                      __html: selectedMentor.biography,
                    }}
                  />
                </div>
              </div>

              <SheetFooter className="mt-6 flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedMentor(null)}
                  className="w-full sm:w-auto"
                >
                  Đóng
                </Button>
                <Button
                  variant={
                    selectedMentor.isVerified ? "destructive" : "default"
                  }
                  onClick={() => {
                    handleToggleVerify(
                      selectedMentor.id,
                      selectedMentor.isVerified,
                    );
                  }}
                  disabled={toggleVerifyMutation.isPending}
                  className={
                    !selectedMentor.isVerified
                      ? "bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                      : "w-full sm:w-auto"
                  }
                >
                  {toggleVerifyMutation.isPending ? (
                    <Spinner className="h-4 w-4 mr-1" />
                  ) : selectedMentor.isVerified ? (
                    <ShieldX className="h-4 w-4 mr-1" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 mr-1" />
                  )}
                  {selectedMentor.isVerified
                    ? "Huỷ xác thực"
                    : "Xác thực hồ sơ"}
                </Button>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export const Route = createLazyRoute("/admin/verify-mentors")({
  component: VerifyMentorPage,
});
