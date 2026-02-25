import { createLazyRoute } from "@tanstack/react-router";
import { useGetListPaymentStatus } from "@/api/statistic";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, differenceInMinutes } from "date-fns";
import { vi } from "date-fns/locale";
import { getInitials } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { useAppSelector } from "@/store/hooks";

export default function MentorPaymentStatus() {
	const mentorId = useAppSelector((state) => state.auth.user?.id ?? "");
	const { data: payments = [], isLoading } = useGetListPaymentStatus(mentorId);

	const calculatePayment = (
		start: string,
		end: string,
		pricePerHour: number,
	) => {
		const minutes = differenceInMinutes(new Date(end), new Date(start));
		const hours = minutes / 60;
		const rawPrice = hours * pricePerHour;
		// 5% platform fee taken; mentor receives 95%
		return rawPrice * 0.95;
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold tracking-tight">
					Trạng thái thanh toán
				</h1>
			</div>

			<div className="rounded-md border bg-card text-card-foreground shadow-sm">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Học viên</TableHead>
							<TableHead>Thời gian</TableHead>
							<TableHead>Số tiền nhận được</TableHead>
							<TableHead>Trạng thái</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={4} className="h-24 text-center">
									<Spinner className="mx-auto" />
								</TableCell>
							</TableRow>
						) : payments.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} className="h-24 text-center">
									Không có dữ liệu thanh toán.
								</TableCell>
							</TableRow>
						) : (
							payments.map((payment, index) => {
								const amountToPay = calculatePayment(
									payment.startAt,
									payment.endAt,
									payment.pricePerHour,
								);

								return (
									<TableRow key={index}>
										{/* Mentee Info */}
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-10 w-10 border">
													<AvatarImage
														src={payment.menteeAvatar}
														alt={payment.menteeName}
													/>
													<AvatarFallback>
														{getInitials(payment.menteeName)}
													</AvatarFallback>
												</Avatar>
												<div className="flex flex-col">
													<span className="font-medium text-sm">
														{payment.menteeName}
													</span>
													<span className="text-xs text-muted-foreground">
														{payment.menteeEmail}
													</span>
												</div>
											</div>
										</TableCell>

										{/* Time */}
										<TableCell>
											<div className="flex flex-col text-sm">
												<span className="font-medium">
													{format(new Date(payment.startAt), "dd/MM/yyyy", {
														locale: vi,
													})}
												</span>
												<span className="text-xs text-muted-foreground">
													{format(new Date(payment.startAt), "HH:mm")} -{" "}
													{format(new Date(payment.endAt), "HH:mm")}
												</span>
											</div>
										</TableCell>

										{/* Amount */}
										<TableCell>
											<span className="font-semibold text-primary">
												{formatCurrency(amountToPay)}
											</span>
											<p className="text-xs text-muted-foreground">
												Đã trừ 5% phí hệ thống
											</p>
										</TableCell>

										{/* Status */}
										<TableCell>
											{payment.isPaid ? (
												<Badge variant="default">Đã thanh toán</Badge>
											) : (
												<Badge variant="outline">Chưa thanh toán</Badge>
											)}
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

export const Route = createLazyRoute("/mentor/payment-status")({
	component: MentorPaymentStatus,
});