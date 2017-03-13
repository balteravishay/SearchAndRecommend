//var azureSearchQueryApiKey = "54D83159A5E23BBF0AA35349F4DF1B31";
var azureSearchApiManageKey = "424a7e57dcab40e4a3d33c64459b4552"
//var azureMLModelId = "45446586-493f-40e2-9d1a-a7bd9853375d"
//var azureMLBuildId = "1543796"
var inSearch = false;
var countryFacet, genreFacet, yearFacet, sortType, currentPage;

$(function () {
    $("#q").autocomplete({
        source: "/home/suggest",
        minLength: 2,
        select: function (event, ui) {
            Search();
        }
    });

    currentPage = 1;
    countryFacet = '';
    genreFacet = '';
    yearFacet = '';
    document.getElementById("q").focus();
    sortType = 'CountryInc';
     Search();

    // Execute search if user clicks enter
    $("#q").keyup(function (event) {
        if (event.keyCode === 13) {
            Search();
        }
    });

});

function Search() {
    //$("#mediaContainer").html("Loading...");
    var q = $("#q").val();
    // Get center of map to use to score the search results
    $.post('/home/search',
        {
            q: q,
            countryFacet: countryFacet,
            genreFacet: genreFacet,
            yearFacet: yearFacet,
            sortType: sortType,
            currentPage: currentPage,
        },
        function (data) {
            UpdateCountryFacets(data.facets.Country);
            UpdateGenreFacets(data.facets.Genre);
            UpdateYearFacets(data.facets.ReleaseYear);
            UpdateMovieDetails(data);
            UpdatePagination(data.Count);
            UpdateFilterReset();
        });

}

function UpdateFilterReset() {
    // This allows users to remove filters
    var htmlString = '';
    if ((countryFacet !== '') || (genreFacet !== '') || (yearFacet === '')) {
        htmlString += '<b>Current Filters:</b><br>';
        if (countryFacet !== '')
            htmlString += countryFacet + ' [<a href="javascript:void(0)" onclick="RemoveFacet(\'countryFacet\')">X</a>]<br>';
        if (genreFacet !== '')
            htmlString += genreFacet + ' [<a href="javascript:void(0)" onclick="RemoveFacet(\'genreFacet\')">X</a>]<br>';
        if (yearFacet !== '') {
            htmlString += yearFacet + ' [<a href="javascript:void(0)" onclick="RemoveFacet(\'yearFacet\')">X</a>]<br>';
        }
    }
    $("#filterReset").html(htmlString);
}

function RemoveFacet(facet) {
    // Remove a facet
    if (facet === "countryFacet")
        countryFacet = '';
    if (facet === "genreFacet")
        genreFacet = '';
    if (facet === "yearFacet")
        yearFacet = '';

    Search();
}

function UpdatePagination(docCount) {
    // Update the pagination
    var totalPages = Math.round(docCount / 10);
    // Set a max of 5 items and set the current page in middle of pages
    var startPage = currentPage;
    if ((startPage === 1) || (startPage === 2))
        startPage = 1;
    else
        startPage -= 2;

    var maxPage = startPage + 5;
    if (totalPages < maxPage)
        maxPage = totalPages + 1;
    var backPage = parseInt(currentPage) - 1;
    if (backPage < 1)
        backPage = 1;
    var forwardPage = parseInt(currentPage) + 1;

    var htmlString = '<li><a href="javascript:void(0)" onclick="GoToPage(\'' + backPage + '\')" class="fa fa-angle-left"></a></li>';
    for (var i = startPage; i < maxPage; i++) {
        if (i === currentPage)
            htmlString += '<li  class="active"><a href="#">' + i + '</a></li>';
        else
            htmlString += '<li><a href="javascript:void(0)" onclick="GoToPage(\'' + parseInt(i) + '\')">' + i + '</a></li>';
    }

    htmlString += '<li><a href="javascript:void(0)" onclick="GoToPage(\'' + forwardPage + '\')" class="fa fa-angle-right"></a></li>';
    $("#pagination").html(htmlString);
    $("#paginationFooter").html(htmlString);


}

function GoToPage(page) {
    currentPage = page;
    Search();
}

function UpdateCountryFacets(data) {
    var facetResultsHTML = '';
    for (var i = 0; i < data.length; i++) {
        facetResultsHTML += '<li><a href="javascript:void(0)" onclick="ChooseCountryFacet(\'' + data[i].value + '\');">' + data[i].value + ' (' + data[i].count + ')</span></a></li>';
    }

    $("#country_facets").html(facetResultsHTML);
}

function ChooseCountryFacet(facet) {
    countryFacet = facet;
    Search();
}


function UpdateGenreFacets(data) {
    var facetResultsHTML = '';
    for (var i = 0; i < data.length; i++) {
        facetResultsHTML += '<li><a href="javascript:void(0)" onclick="ChooseGenreFacet(\'' + data[i].value + '\');">' + data[i].value + ' (' + data[i].count + ')</span></a></li>';
    }

    $("#genre_facets").html(facetResultsHTML);
}

function ChooseGenreFacet(facet) {
    genreFacet = facet;
    Search();
}

function UpdateYearFacets(data) {
    var facetResultsHTML = '';
    for (var i = 0; i < data.length; i++) {
        facetResultsHTML += '<li><a href="javascript:void(0)" onclick="ChooseYearFacet(\'' + data[i].value + '\');">' + data[i].value + ' (' + data[i].count + ')</span></a></li>';
    }
    $("#year_facets").html(facetResultsHTML);
}

function ChooseYearFacet(facet) {
    yearFacet = facet;
    Search();
}

function setSortType() {
    sortType = $("#cmbSortType").val();
    Search();
}

function UpdateMovieDetails(data) {
    $("#available-movies-label").html('Available Movies <small>(' + data.count + " jobs)</small>");
    $("#movies-count").html(data.count);

    $("#available_movies_subheader").html(data.count + ' Available Movies');

    $("#mediaContainer").html('');
    for (var item in data.results) {
        var id = data.results[item].document.VodId;
        var title = data.results[item].document.Title;
        var hebtitle = data.results[item].document.HebTitle;
        var description = data.results[item].document.Description;
        var imageURL = data.results[item].document.Poster;
        $("#mediaContainer").
            append('<div class="col-md-4" style="text-align:center"><a href="javascript:void(0);" onclick="openMovieDetails(\'' + title + '\',\'' + hebtitle + '\',\'' + id + '\',\'' + description + '\');"><img src=' + imageURL + ' height=200><br><div style="height:100px"><b>' + title + '</b><br><div style="height:100px"><b>' + hebtitle + '</b></a></div></div>');
    }
}

function openMovieDetails(title, hebtitle, id, description)
{
	// Open the dialog with the recommendations
    $("#modal-title").html(title );
    $("#modal-hebtitle").html(hebtitle);
    $("#modal-description").html(description);

	$("#recDiv").html('Loading recommendations...');

    var recommendatationAPI = "https://tspapimanagement.azure-api.net/RecommendApi/Recommend/recommendId=" + id;

	$.ajax({
		url: recommendatationAPI,
		beforeSend: function (request) {
            request.setRequestHeader("Ocp-Apim-Subscription-Key", azureSearchApiManageKey);
            request.setRequestHeader("Content-Type", "application/json");
		},
		type: "GET",
		success: function (data) {
            $("#recDiv").html('');
            $("#recMlDiv").html('');
            var random = Math.floor((Math.random() * 5) + 1);
            var index = 1;
            for (var item in data.recommendedItems) {
                $("#recDiv").append('<p>' + data.recommendedItems[item].items[0].name + '</p>');
                if (index === random)
                    $("#recMlDiv").append('<p>' + data.recommendedItems[item].items[0].name + '</p>');
                index++;
            }
		}
	});

	$('#myModal').modal('show');
}