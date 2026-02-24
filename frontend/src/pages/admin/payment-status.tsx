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
import { Button } from "@/components/ui/button";
import { format, differenceInMinutes } from "date-fns";
import { vi } from "date-fns/locale";
import { getInitials } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

export default function PaymentStatus() {
	// For admin, we fetch all payment statuses by passing an empty string
	const { data: payments = [], isLoading } = useGetListPaymentStatus("");

	const calculatePayment = (start: string, end: string, pricePerHour: number) => {
		const minutes = differenceInMinutes(new Date(end), new Date(start));
		const hours = minutes / 60;
		const rawPrice = hours * pricePerHour;
		// We take a 5% fee, so the mentor gets 95%
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
							<TableHead>Mentor</TableHead>
							<TableHead>Học viên</TableHead>
							<TableHead>Thời gian</TableHead>
							<TableHead>Ngân hàng nhận</TableHead>
							<TableHead>Số tiền cần thanh toán</TableHead>
							<TableHead>Hành động</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center">
									<Spinner className="mx-auto" />
								</TableCell>
							</TableRow>
						) : payments.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center">
									Không có dữ liệu thanh toán.
								</TableCell>
							</TableRow>
						) : (
							payments.map((payment, index) => {
								const amountToPay = calculatePayment(
									payment.startAt,
									payment.endAt,
									payment.pricePerHour
								);

								return (
									<TableRow key={index}>
										{/* Mentor Info */}
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-10 w-10 border">
													<AvatarImage src={payment.mentorAvatar} alt={payment.mentorName} />
													<AvatarFallback>{getInitials(payment.mentorName)}</AvatarFallback>
												</Avatar>
												<div className="flex flex-col">
													<span className="font-medium text-sm">{payment.mentorName}</span>
													<span className="text-xs text-muted-foreground">{payment.mentorEmail}</span>
												</div>
											</div>
										</TableCell>

										{/* Mentee Info */}
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-10 w-10 border">
													<AvatarImage src={payment.menteeAvatar} alt={payment.menteeName} />
													<AvatarFallback>{getInitials(payment.menteeName)}</AvatarFallback>
												</Avatar>
												<div className="flex flex-col">
													<span className="font-medium text-sm">{payment.menteeName}</span>
													<span className="text-xs text-muted-foreground">{payment.menteeEmail}</span>
												</div>
											</div>
										</TableCell>

										{/* Time */}
										<TableCell>
											<div className="flex flex-col text-sm">
												<span className="font-medium">
													{format(new Date(payment.startAt), "dd/MM/yyyy", { locale: vi })}
												</span>
												<span className="text-xs text-muted-foreground">
													{format(new Date(payment.startAt), "HH:mm")} - {format(new Date(payment.endAt), "HH:mm")}
												</span>
											</div>
										</TableCell>

										{/* Bank Info */}
										<TableCell>
											<div className="flex flex-col">
												<span className="font-medium text-sm">
													{payment.bankAccountNumber + " - " + payment.bankName || "Chưa có STK"}
												</span>
											</div>
										</TableCell>

										{/* Price calculation */}
										<TableCell>
											<div className="flex flex-col">
												<span className="font-semibold text-primary">
													{formatCurrency(amountToPay)}
												</span>
											</div>
										</TableCell>

										{/* Action */}
										<TableCell>
											<Button
												variant={payment.isPaid ? "outline" : "default"}
												size="sm"
												disabled={payment.isPaid}
											>
												{payment.isPaid ? "Đã thanh toán" : "Đã thanh toán cho mentor"}
											</Button>
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

export const Route = createLazyRoute("/admin/payment-status")({
	component: PaymentStatus,
});