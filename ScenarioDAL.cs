// Copyright (C) EXOS Technology, LLC, and/or an affiliate.
// All rights reserved.
#pragma warning disable CA1031 // Do not catch general exception types

using System;
using System.Threading;
using System.Threading.Tasks;
using CommonClientReportDeliverySvc.Services.ClientScheduledSftp;
using Exos.Platform.AspNetCore.HealthCheck;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;

namespace Exos.ClientReportDeliveryWebJob.Jobs.ClientScheduledSftp;

public class ClientScheduledSftpWebJob
{
    private readonly ILogger<ClientScheduledSftpWebJob> _logger;
    private readonly ClientScheduledSftpService _clientScheduledSftpService;
    private readonly ProbesState _probesState;

    /// <summary>
    /// Initializes a new instance of the <see cref="ClientScheduledSftpWebJob"/> class.
    /// </summary>
    /// <param name="logger">The logger.</param>
    /// <param name="clientScheduledSftpService">The service.</param>
    /// <param name="probesState">The probes state.</param>
    public ClientScheduledSftpWebJob(ILogger<ClientScheduledSftpWebJob> logger, ClientScheduledSftpService clientScheduledSftpService, ProbesState probesState)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _clientScheduledSftpService = clientScheduledSftpService ?? throw new ArgumentNullException(nameof(clientScheduledSftpService));
        _probesState = probesState ?? throw new ArgumentNullException(nameof(probesState));
    }

    /// <summary>
    /// ScheduledSftp Cenlar.
    /// </summary>
    /// <param name="timerInfo">The timer info.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A Task.</returns>
    [Disable("PollSettings:ScheduledSftpWebJob:Cenlar:IsDisabled")]
    public async Task ScheduledSftpCenlar([TimerTrigger("%PollSettings:ScheduledSftpWebJob:Cenlar:Schedule%")] TimerInfo timerInfo, CancellationToken cancellationToken)
    {
        try
        {
            await _clientScheduledSftpService.ScheduledSftp("Cenlar", cancellationToken);
        }
        catch (Exception ex)
        {
            if (ex is OutOfMemoryException oome)
            {
                _probesState.Liveness = false;
                _probesState.Readiness = false;
            }

            _logger.LogError(ex, $"{nameof(ScheduledSftpCenlar)} failed.");
        }
    }

    /// <summary>
    /// ScheduledSftp PennyMac.
    /// </summary>
    /// <param name="timerInfo">The timer info.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>A Task.</returns>
    [Disable("PollSettings:ScheduledSftpWebJob:PennyMac:IsDisabled")]
    public async Task ScheduledSftpPennyMac([TimerTrigger("%PollSettings:ScheduledSftpWebJob:PennyMac:Schedule%")] TimerInfo timerInfo, CancellationToken cancellationToken)
    {
        try
        {
            await _clientScheduledSftpService.ScheduledSftp("PennyMac", cancellationToken);
        }
        catch (Exception ex)
        {
            if (ex is OutOfMemoryException oome)
            {
                _probesState.Liveness = false;
                _probesState.Readiness = false;
            }

            _logger.LogError(ex, $"{nameof(ScheduledSftpPennyMac)} failed.");
        }
    }
}
#pragma warning restore CA1031 // Do not catch general exception types
