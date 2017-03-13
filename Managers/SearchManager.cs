using Microsoft.ApplicationInsights;
using Microsoft.Azure.Search;
using Microsoft.Azure.Search.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SearchRecommendSite.Managers
{
    public class SearchManager
    {
        private TelemetryClient telemetry = new TelemetryClient();
        private ISearchIndexClient _indexClient;
        private ISearchIndexClient IndexClient
        {
            get
            {
                if (_indexClient == null)
                {
                    var searchClient = new SearchServiceClient(_searchServiceName, new SearchCredentials(_apiKey));
                    _indexClient = searchClient.Indexes.GetClient(_indexName); 
                }
                return _indexClient;
            }
        }
        private string _indexName ;
        private string _searchServiceName;
        private string _apiKey;
        private string _suggestName;

        public SearchManager(IConfigurationRoot configuration)
        {
            _indexName = configuration["SearchIndexName"];
            _searchServiceName = configuration["SearchSearviceName"];
            _apiKey = configuration["SearchApiKey"];
            _suggestName = configuration["SearchSuggest"];

        }

        public DocumentSuggestResult Suggest(string searchText, bool fuzzy)
        {
            // Execute search based on query string
            try
            {
                SuggestParameters sp = new SuggestParameters()
                {
                    UseFuzzyMatching = fuzzy,
                    Top = 8
                };
                DocumentSuggestResult result = null;
                PerformActionAndTelemerty(() =>
                {
                    result = IndexClient.Documents.Suggest(searchText, _suggestName, sp);
                }, "Suggest");
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error querying index: {0}\r\n", ex.Message.ToString());
            }
            return null;
        }

        internal DocumentSearchResult Search(string q, string countryFacet, string genreFacet, string yearFacet, string sortType, int currentPage)
        {
            // Execute search based on query string
            try
            {
                Console.Write($"q:{q}, country:{countryFacet}, genre:{genreFacet}, year:{yearFacet}, sort:{sortType}");
                
                SearchParameters sp = new SearchParameters()
                {
                   
                    SearchMode = SearchMode.Any,
                    Top = 10,
                    Skip = (currentPage - 1)*10,
                    // Limit results
                    //Select = new List<String>() {"id", "agency", "posting_type", "num_of_positions", "business_title",
                    //    "salary__from", "salary__to", "salary_frequency", "work_location", "job_description",
                    //    "posting_date", "geo_location", "tags"},
                    // Add count
                    IncludeTotalResultCount = true,
                    // Add search highlights
                    HighlightFields = new List<String>() { "Description" },
                    HighlightPreTag = "<b>",
                    HighlightPostTag = "</b>",
                    // Add facets
                    Facets = new List<String>() { "Country", "Genre", "ReleaseYear" },
                };
                // Define the sort type
                if (sortType == "CountryInc")
                {
                    sp.OrderBy = new List<String>() { "Country" };
                    //sp.ScoringProfile = "jobsScoringFeatured";      // Use a scoring profile
                    //sp.ScoringParameters = new List<ScoringParameter>();
                    //sp.ScoringParameters.Add(new ScoringParameter("featuredParam", new[] { "featured" }));
                    //sp.ScoringParameters.Add(new ScoringParameter("mapCenterParam", GeographyPoint.Create(lon, lat)));
                }
                else if (sortType == "CountryDec")
                    sp.OrderBy = new List<String>() { "ReleaseYear desc" };
                else if (sortType == "TitleInc")
                    sp.OrderBy = new List<String>() { "Title" };
                else if (sortType == "TitleDec")
                    sp.OrderBy = new List<String>() { "Title desc" };
                Console.WriteLine("beofre filter");
                // Add filtering
                string filter = null;
                if (!string.IsNullOrEmpty(countryFacet))
                    filter = "Country eq '" + countryFacet + "'";
                if (!string.IsNullOrEmpty(genreFacet))
                {
                    if (filter != null)
                        filter += " and ";
                    filter += "Genre eq '" + genreFacet + "'";

                }
                if (!string.IsNullOrEmpty(yearFacet))
                {
                    if (filter != null)
                        filter += " and ";
                    filter += "ReleaseYear eq '" + yearFacet + "'";
                }
                
                sp.Filter = filter;
                Console.WriteLine("after filter");
                DocumentSearchResult result = null;
                PerformActionAndTelemerty(() =>
                {
                    result = IndexClient.Documents.Search(q, sp);
                }, $"Search q={q} parameters= {sp.ToString()}");
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error querying index: {0}\r\n", ex.Message.ToString());
                Console.WriteLine("Error querying index: {0}\r\n", ex.StackTrace.First().ToString());
                throw;
            }
            return null;
        }

        private void PerformActionAndTelemerty(Action action, string actionName) =>
            telemetry.PerformActionAndTelemerty(action, "101", _indexName, _searchServiceName, "Search", actionName);
    }
}
