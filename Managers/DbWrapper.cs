using Microsoft.ApplicationInsights;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SearchRecommendSite.Managers
{
    public class DbManager
    {
        private TelemetryClient telemetry = new TelemetryClient();
        private string dbKey;
        private string dbUrl;
        private string collectionName;
        private string databaseId;
        private DocumentClient client;
        public DbManager(IConfigurationRoot configuration)
        {
            dbKey = configuration["DbAdminApiKey"];
            dbUrl = configuration["DbUrl"];
            collectionName = configuration["CollectionName"];
            databaseId = configuration["databaseId"];
            telemetry.TrackTrace($"db details: key:{dbKey} ; url:{dbUrl} ; collection: {collectionName} ; databaseId: {databaseId}", Microsoft.ApplicationInsights.DataContracts.SeverityLevel.Information);

            CreateClient();
        }

        public Task<Document> GetFirstDocumentAsync()
        {
            return Task.Run(() =>
            {

                try
                {
                    Database database = null;
                    PerformActionAndTelemerty(() =>
                    {
                        var query = from db in client.CreateDatabaseQuery()
                                    where db.Id == databaseId
                                    select db;
                        database = query.First();
                    }, "GetDatabase");
                    DocumentCollection collection = null;
                    PerformActionAndTelemerty(() =>
                    {
                        var query = from col in client.CreateDocumentCollectionQuery(database.SelfLink)
                                    where col.Id == collectionName
                                    select col;
                        collection = query.First();
                    }, "GetCollection");
                    Document firstDoc = null;
                    PerformActionAndTelemerty(() =>
                    {
                        var query = from doc in client.CreateDocumentQuery(collection.SelfLink)
                                    select doc;
                        firstDoc = query.First();
                    }, "GetDocument");

                    return firstDoc;
                }
                catch (Exception e)
                {
                    Console.WriteLine($"error getting from db: {e.Message}");
                    telemetry.TrackException(e);
                    throw;
                }
            });
        }

        private void CreateClient()
        {
            PerformActionAndTelemerty(() => client = GetDbClient(dbUrl, dbKey), "CreateClient");
        }

        private static DocumentClient GetDbClient(string dbUrl, string dbKey) =>
            new DocumentClient(new Uri(dbUrl), dbKey,
                new ConnectionPolicy
                {
                    ConnectionMode = ConnectionMode.Direct,
                    ConnectionProtocol = Protocol.Https
                });

        private void PerformActionAndTelemerty(Action action, string actionName) =>
            telemetry.PerformActionAndTelemerty(action, "123", databaseId, dbUrl, "SqlDB", actionName);
                
    }
}
