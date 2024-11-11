[TestMethod]
public async Task CreateDeliveryMethodConfigAsync_GivenValidDeliveryMethodWriteModelForSFTPScheduledDelivery_ShouldPersist()
{
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
                IsScheduledDelivery = true,
                ScheduledSubFolder = "xsfsdf/dsff/sdafdsf"
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
    DeliveryMethodWriteModel writeModel = deliveryMethodWriteModelList[0];
    writeModel.DeliveryName = Guid.NewGuid().ToString().Substring(0, 15);

    /*Act*/
    var actionResult = await _deliveryMethodController.CreateDeliveryMethodConfigAsync(writeModel).ConfigureAwait(false);
    OkObjectResult okResult = actionResult.Result as OkObjectResult;
    DeliveryMethodViewModel persisted = okResult.Value as DeliveryMethodViewModel;

    /*Assert*/
    Assert.IsNotNull(persisted);
    Assert.AreEqual(writeModel.DeliveryName, persisted.DeliveryName);
    this._cleanup.Add(new CleanupContext
    {
        Id = persisted.Id,
        KeyValue = writeModel.ClientId
    });
}
