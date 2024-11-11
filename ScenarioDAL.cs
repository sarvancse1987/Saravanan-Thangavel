[TestMethod]
public async Task CreateDeliveryMethodConfigAsync_GivenValidDeliveryMethodWriteModelForSFTPScheduledDelivery_ShouldPersist()
{
    // Arrange
    var deliveryMethodWriteModelList = new List<DeliveryMethodWriteModel> {
        new DeliveryMethodWriteModel
        {
            ClientId = 2,
            SubClientId = 100,
            DeliveryName = "Delivbery by inbuilt model",
            ProductGroupId = 7,
            ExcludedProductIds = new List<int>
            {
                701, 102
            },
            IsBulkOrderDelivery = false,
            DeliveryMethodTypeCode = "Sftp",
            DeliveryMethodTypeId = 2,
            IsMergeNeeded = true,
            EmailConfig = new EmailConfig(),
            SftpConfig = new SftpConfig
            {
                IsScheduledDelivery = false,  // Set IsScheduledDelivery to false to trigger validation
                Path = null,  // These fields will be empty to trigger validation errors
                Port = null,
                Username = null,
                Password = null
            },
            Deliverables = new List<Deliverable>
            {
                new Deliverable
                {
                    DocumentTypeCode = "Document type code goes here",
                    DocumentTypeName = "Document type code goes here",
                    IsMergeDocument = true,
                    DocumentName = "Merged Document -1",
                    DocumentsToMerge = new List<DocumentToMerge>
                    {
                        new DocumentToMerge
                        {
                            DocumentTypeCode = "Merged document type code goes here",
                            DocumentTypeName = "Merged document type code goes here",
                            Sequence = 1
                        }
                    }
                },
                new Deliverable
                {
                    DocumentTypeCode = "Document type code goes here - 2",
                    DocumentTypeName = "Document type code goes here - 2",
                    IsMergeDocument = false,
                    DocumentName = "Non Merged Document",
                    DocumentsToMerge = new List<DocumentToMerge>
                    {
                        new DocumentToMerge()
                    }
                }
            },
            DeliveryTimeFrame = Exos.ClientManagementApi.Models.Constants.DeliveryTimeFrame.Specific,
            DeliverySchedule = new DeliverySchedule
            {
                DeliveryTimes = new List<string>
                {
                    "2.30 pm"
                },
                ExcludedDays = new List<Exos.ClientManagementApi.Models.Constants.WeekdaysEnum>
                {
                    Exos.ClientManagementApi.Models.Constants.WeekdaysEnum.Saturday,
                    Exos.ClientManagementApi.Models.Constants.WeekdaysEnum.Sunday
                }
            }
        }
    };

    // Create a new delivery method with a unique name
    DeliveryMethodWriteModel writeModel = deliveryMethodWriteModelList[0];
    writeModel.DeliveryName = Guid.NewGuid().ToString().Substring(0, 15);

    // Act
    // First, validate the SftpConfig fields manually before calling the controller action
    var validationResults = new List<ValidationResult>();
    var validationContext = new ValidationContext(writeModel.SftpConfig);  // Validate the SftpConfig directly
    var isValid = Validator.TryValidateObject(writeModel.SftpConfig, validationContext, validationResults, true);

    // Now proceed with the actual API call
    var actionResult = await _deliveryMethodController.CreateDeliveryMethodConfigAsync(writeModel).ConfigureAwait(false);
    OkObjectResult okResult = actionResult.Result as OkObjectResult;
    DeliveryMethodViewModel persisted = okResult.Value as DeliveryMethodViewModel;

    // Assert that the API call worked as expected
    Assert.IsNotNull(persisted);
    Assert.AreEqual(writeModel.DeliveryName, persisted.DeliveryName);

    // Assert the validation results
    Assert.IsFalse(isValid, "Validation should fail because required fields are missing.");
    Assert.AreEqual(4, validationResults.Count, "There should be four validation errors for missing fields.");

    // Assert specific validation error messages
    Assert.IsTrue(validationResults.Any(vr => vr.ErrorMessage == "Path is required when IsScheduledDelivery is false."));
    Assert.IsTrue(validationResults.Any(vr => vr.ErrorMessage == "Port is required when IsScheduledDelivery is false."));
    Assert.IsTrue(validationResults.Any(vr => vr.ErrorMessage == "Username is required when IsScheduledDelivery is false."));
    Assert.IsTrue(validationResults.Any(vr => vr.ErrorMessage == "Password is required when IsScheduledDelivery is false."));

    // Cleanup
    this._cleanup.Add(new CleanupContext
    {
        Id = persisted.Id,
        KeyValue = writeModel.ClientId
    });
}
