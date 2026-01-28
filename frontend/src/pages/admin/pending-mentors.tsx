import { createLazyRoute } from "@tanstack/react-router";
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

function PendingMentors() {
  const { data: mentors = [], isLoading } = useGetPendingMentors();
  const approveMutation = useApproveMentor();

  const handleApprove = (id: string) => {
    approveMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Đã duyệt mentor thành công");
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
              <TableHead>Kinh nghiệm</TableHead>
              <TableHead>Giá/Giờ</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mentorList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Không có yêu cầu nào đang chờ duyệt.
                </TableCell>
              </TableRow>
            ) : (
              mentorList.map((mentor: MentorInfo) => (
                <TableRow key={mentor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={mentor.avatar} alt={mentor.name} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{mentor.name}</span>
                        <span
                          className="text-xs text-muted-foreground truncate max-w-[200px]"
                          title={mentor.company}
                        >
                          {mentor.position} @ {mentor.company}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[250px]">
                      {mentor.skills.slice(0, 3).map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {mentor.skills.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{mentor.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{mentor.yearsOfExperience} năm</TableCell>
                  <TableCell>{formatCurrency(mentor.pricePerHour)}</TableCell>
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export const Route = createLazyRoute("/admin/pending-mentors")({
  component: PendingMentors,
});
