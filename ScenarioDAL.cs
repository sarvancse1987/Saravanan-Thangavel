public class SftpConfig
{
    /// <summary>
    /// Gets or sets Path.
    /// </summary>
    public string Path { get; set; }

    /// <summary>
    /// Gets or sets Port.
    /// </summary>
    public string Port { get; set; }

    /// <summary>
    /// Gets or sets Username.
    /// </summary>
    public string Username { get; set; }

    /// <summary>
    /// Gets or sets Password.
    /// </summary>
    [Encrypted]
    public string Password { get; set; }

    /// <summary>
    /// Gets or sets Key Value Reference.
    /// </summary>
    public bool IsSftpKeyvaultRef { get; set; }

    /// <summary>
    /// Gets or sets Is Scheduled Delivery.
    /// </summary>
    public bool IsScheduledDelivery { get; set; }

    /// <summary>
    /// Gets or sets Scheduled Sub Folder.
    /// </summary>
    public string ScheduledSubFolder { get; set; }
}
