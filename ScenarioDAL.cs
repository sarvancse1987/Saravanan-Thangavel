using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

public class SftpConfig : IValidatableObject
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

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (!IsScheduledDelivery)
        {
            if (string.IsNullOrWhiteSpace(Path))
            {
                yield return new ValidationResult("Path is required when IsScheduledDelivery is false.", new[] { nameof(Path) });
            }

            if (string.IsNullOrWhiteSpace(Port))
            {
                yield return new ValidationResult("Port is required when IsScheduledDelivery is false.", new[] { nameof(Port) });
            }

            if (string.IsNullOrWhiteSpace(Username))
            {
                yield return new ValidationResult("Username is required when IsScheduledDelivery is false.", new[] { nameof(Username) });
            }

            if (string.IsNullOrWhiteSpace(Password))
            {
                yield return new ValidationResult("Password is required when IsScheduledDelivery is false.", new[] { nameof(Password) });
            }
        }
    }
}
