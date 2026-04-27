namespace backend.Models.DTOs.P2P;

public class CallStatisticsResponseDto
{
    public int TotalCalls { get; set; }
    public int CompletedCalls { get; set; }
    public int MissedCalls { get; set; }
    public int RejectedCalls { get; set; }
    public double AverageDurationSeconds { get; set; }
    public double SuccessRate { get; set; }
}
