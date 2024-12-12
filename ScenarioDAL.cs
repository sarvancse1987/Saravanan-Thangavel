public class ScheduleConfig
{
    public int Id { get; set; }
    public string Name { get; set; }
    public List<DayOfWeek> Days { get; set; } = new();
    public TimeSpan StartTime { get; set; }
    public int IntervalInHours { get; set; }
    public bool IsDisabled { get; set; }
}
using Dapper;
using System.Data;
using System.Data.SqlClient;

public class ScheduleConfigRepository
{
    private readonly string _connectionString;

    public ScheduleConfigRepository(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<List<ScheduleConfig>> GetSchedulesAsync()
    {
        using var connection = new SqlConnection(_connectionString);
        var query = "SELECT * FROM ScheduleConfig WHERE IsDisabled = 0";
        var results = await connection.QueryAsync<dynamic>(query);

        return results.Select(r => new ScheduleConfig
        {
            Id = r.Id,
            Name = r.Name,
            Days = r.Days.Split(',').Select(Enum.Parse<DayOfWeek>).ToList(),
            StartTime = TimeSpan.Parse(r.StartTime.ToString()),
            IntervalInHours = r.IntervalInHours,
            IsDisabled = r.IsDisabled
        }).ToList();
    }
}
public class ClientScheduledSftpWebJob
{
    private readonly ILogger<ClientScheduledSftpWebJob> _logger;
    private readonly ClientScheduledSftpService _clientScheduledSftpService;
    private readonly ScheduleConfigRepository _scheduleConfigRepository;

    public ClientScheduledSftpWebJob(
        ILogger<ClientScheduledSftpWebJob> logger,
        ClientScheduledSftpService clientScheduledSftpService,
        ScheduleConfigRepository scheduleConfigRepository)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _clientScheduledSftpService = clientScheduledSftpService ?? throw new ArgumentNullException(nameof(clientScheduledSftpService));
        _scheduleConfigRepository = scheduleConfigRepository ?? throw new ArgumentNullException(nameof(scheduleConfigRepository));
    }

    [FunctionName("DynamicScheduledSftp")]
    public async Task DynamicScheduledSftp([TimerTrigger("0 */1 * * * *")] TimerInfo timerInfo, CancellationToken cancellationToken)
    {
        // Fetch schedules from the database
        var schedules = await _scheduleConfigRepository.GetSchedulesAsync();

        var now = DateTime.Now;

        foreach (var schedule in schedules)
        {
            // Check if today is one of the configured days
            if (!schedule.Days.Contains(now.DayOfWeek)) continue;

            // Calculate the first execution time today
            var todayStart = DateTime.Today.Add(schedule.StartTime);
            if (now < todayStart) continue; // Skip if current time is before the start time

            // Check if it's time to execute based on the interval
            var timeSinceStart = now - todayStart;
            if (timeSinceStart.TotalHours % schedule.IntervalInHours < 1)
            {
                // Execute the task
                await ExecuteScheduledTask(schedule.Name, cancellationToken);
            }
        }
    }

    private async Task ExecuteScheduledTask(string name, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation($"Starting scheduled task for {name} at {DateTime.Now}");
            await _clientScheduledSftpService.ScheduledSftp(name, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while executing task for {name}");
        }
    }
}
