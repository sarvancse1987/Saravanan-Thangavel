[TestMethod]
public void Validate_SftpConfig_WithIsScheduledDeliveryFalse_ShouldValidateRequiredFields()
{
    // Arrange
    var sftpConfig = new SftpConfig
    {
        IsScheduledDelivery = false,  // Set to false so that validation is required
        Path = null,                  // Simulate missing required fields
        Port = null,
        Username = null,
        Password = null
    };

    // Act
    var validationResults = new List<ValidationResult>();
    var validationContext = new ValidationContext(sftpConfig);
    var isValid = Validator.TryValidateObject(sftpConfig, validationContext, validationResults, true);

    // Assert
    Assert.IsFalse(isValid, "Validation should fail because required fields are missing.");
    Assert.AreEqual(4, validationResults.Count, "There should be four validation errors for missing fields.");

    // Check that the appropriate validation error messages were triggered
    Assert.IsTrue(validationResults.Any(vr => vr.ErrorMessage == "Path is required when IsScheduledDelivery is false."));
    Assert.IsTrue(validationResults.Any(vr => vr.ErrorMessage == "Port is required when IsScheduledDelivery is false."));
    Assert.IsTrue(validationResults.Any(vr => vr.ErrorMessage == "Username is required when IsScheduledDelivery is false."));
    Assert.IsTrue(validationResults.Any(vr => vr.ErrorMessage == "Password is required when IsScheduledDelivery is false."));
}
