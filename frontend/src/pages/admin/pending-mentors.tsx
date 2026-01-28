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
import { useGetPendingMentors, useApproveMentor } from "@/api/mentor";
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
import { Check, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type MentorInfo } from "@/types/mentor";
import { useQueryClient } from "@tanstack/react-query";

function PendingMentors() {
  const queryClient = useQueryClient();
  const { data: mentors = [], isLoading } = useGetPendingMentors();
  const approveMutation = useApproveMentor();
  const [selectedMentor, setSelectedMentor] = React.useState<MentorInfo | null>(
    null,
  );

  const handleApprove = (id: string) => {
    approveMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Đã duyệt mentor thành công");
        queryClient.invalidateQueries({
          queryKey: ["pending-mentors"],
        });
      },
      onError: (error) => {
        toast.error("Lỗi khi duyệt mentor", {
          description: error.response?.data?.message || error.message,
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    );
  }

  // Handle case where API might return PaginationDto or Array
  const mentorList = Array.isArray(mentors)
    ? mentors
    : (mentors as any).items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Duyệt Mentor</h1>
        <Badge variant="outline" className="text-base py-1 px-4">
          {mentorList.length} Đang chờ
        </Badge>
      </div>

      <div className="border rounded-lg bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mentor</TableHead>
              <TableHead>Chuyên môn</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mentorList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Không có yêu cầu nào đang chờ duyệt.
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
                        onClick={() => handleApprove(mentor.id)}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {approveMutation.isPending ? (
                          <Spinner className="h-4 w-4 mr-1" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        Duyệt
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
            <SheetDescription>
              Xem chi tiết hồ sơ đăng ký của mentor
            </SheetDescription>
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
                  onClick={() => {
                    handleApprove(selectedMentor.id);
                    setSelectedMentor(null);
                  }}
                  disabled={approveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                >
                  {approveMutation.isPending ? (
                    <Spinner className="h-4 w-4 mr-1" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  Duyệt hồ sơ
                </Button>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export const Route = createLazyRoute("/admin/pending-mentors")({
  component: PendingMentors,
});
