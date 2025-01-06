using Azure.Identity;

var builder = WebApplication.CreateBuilder(args);

// Add Azure Key Vault to Configuration
var keyVaultName = builder.Configuration["KeyVaultName"];
if (!string.IsNullOrEmpty(keyVaultName))
{
    var keyVaultUri = new Uri($"https://{keyVaultName}.vault.azure.net/");
    builder.Configuration.AddAzureKeyVault(keyVaultUri, new DefaultAzureCredential());
}

builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();

app.Run();
