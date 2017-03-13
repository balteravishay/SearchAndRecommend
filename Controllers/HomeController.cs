using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Documents.Client;
using Microsoft.Extensions.Configuration;
using System.IO;
using Microsoft.Azure.Documents;
using Microsoft.ApplicationInsights;
using SearchRecommendSite.Managers;

namespace SearchRecommendSite.Controllers
{
    public class HomeController : Controller
    {
        private TelemetryClient telemetry = new TelemetryClient();
        private SearchManager _search;
        public HomeController()
        {
            var builder = new ConfigurationBuilder()
             .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json");
            Configuration = builder.Build();
            _search = new SearchManager(Configuration);
        }
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult About()
        {
            ViewData["Message"] = "Architecture";

            return View();
        }

        static public IConfigurationRoot Configuration { get; set; }


        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";
            var dbWarpper = new DbManager(Configuration);
            try
            {
                dbWarpper.GetFirstDocumentAsync();
                TrySearch();

            }
            catch(Exception e)
            {
                telemetry.TrackException(e);
            }
            return View();
        }

        private void TrySearch()
        {
        }

        public IActionResult Error()
        {
            return View();
        }
        
        public ActionResult Search(string q = "", string countryFacet = "", string genreFacet = "", string yearRangeFacet = "",
            string sortType = "", int currentPage = 0)
        {
            // If blank search, assume they want to search everything
            if (string.IsNullOrWhiteSpace(q))
                q = "*";

            
            var response = _search.Search(q, countryFacet, genreFacet, yearRangeFacet, sortType, currentPage);
            
            return new JsonResult(new { Results = response.Results, Facets = response.Facets, Count = Convert.ToInt32(response.Count) });
            
        }



        [HttpGet]
        public ActionResult Suggest(string term, bool fuzzy = true)
        {
            //Call suggest query and return results
            var response = _search.Suggest(term, fuzzy);
            List<string> suggestions = new List<string>();
            foreach (var result in response.Results)
            {
                suggestions.Add(result.Text);
            }

            // Get unique items
            List<string> uniqueItems = suggestions.Distinct().ToList();

            return new JsonResult(uniqueItems);

        }
    }
}
