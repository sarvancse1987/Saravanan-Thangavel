using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

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

    /// <summary>
    /// Custom validation logic for conditional checks.
    /// </summary>
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        // Skip `[Required]` validation when `IsScheduledDelivery` is true.
        if (IsScheduledDelivery)
        {
            yield break;
        }

        // Validate required properties using existing attributes.
        var results = new List<ValidationResult>();
        if (!Validator.TryValidateObject(this, validationContext, results, validateAllProperties: true))
        {
            foreach (var result in results)
            {
                yield return result;
            }
        }
    }
}
