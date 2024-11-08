using Microsoft.Azure.Cosmos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public class CosmosDbService
{
    private readonly Container _container;

    public CosmosDbService(CosmosClient client, string databaseId, string containerId)
    {
        _container = client.GetContainer(databaseId, containerId);
    }

    public async Task DeleteDocumentsByQueryAsync(string queryText, string partitionKey)
    {
        var queryDefinition = new QueryDefinition(queryText);
        var queryIterator = _container.GetItemQueryIterator<dynamic>(queryDefinition);

        var documentsToDelete = new List<dynamic>();

        while (queryIterator.HasMoreResults)
        {
            var response = await queryIterator.ReadNextAsync();
            foreach (var document in response)
            {
                documentsToDelete.Add(document);
            }
        }

        // Delete each document
        foreach (var doc in documentsToDelete)
        {
            string id = doc.id;
            await _container.DeleteItemAsync<dynamic>(id, new PartitionKey(partitionKey));
            Console.WriteLine($"Deleted document with ID: {id}");
        }
    }
}


var query = "SELECT * FROM c WHERE c.property = 'value'";
await cosmosDbService.DeleteDocumentsByQueryAsync(query, "your-partition-key");
