public class SftpConfig : IValidatableObject
{
    /// <summary>
    /// Gets or sets Path.
    /// </summary>
    [Required(ErrorMessage = "Path cannot be empty.")]
    public string Path { get; set; }

    /// <summary>
    /// Gets or sets Port.
    /// </summary>
    [Required(ErrorMessage = "Port number cannot be empty.")]
    public string Port { get; set; }

    /// <summary>
    /// Gets or sets Username.
    /// </summary>
    [Required(ErrorMessage = "Username cannot be empty.")]
    public string Username { get; set; }

    /// <summary>
    /// Gets or sets Password.
    /// </summary>
    [Required(ErrorMessage = "Password cannot be empty.")]
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

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (!IsScheduledDelivery)
        {
            if (string.IsNullOrWhiteSpace(Path))
            {
                yield return new ValidationResult("Path is required", new[] { nameof(Path) });
            }

            if (string.IsNullOrWhiteSpace(Port))
            {
                yield return new ValidationResult("Port is required", new[] { nameof(Port) });
            }

            if (string.IsNullOrWhiteSpace(Username))
            {
                yield return new ValidationResult("Username is required", new[] { nameof(Username) });
            }

            if (string.IsNullOrWhiteSpace(Password))
            {
                yield return new ValidationResult("Password is required", new[] { nameof(Password) });
            }
        }
        else
        {
            yield break;
        }
    }
}
