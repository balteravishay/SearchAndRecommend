var azureSearchQueryApiKey = "54D83159A5E23BBF0AA35349F4DF1B31";
var azureSearchApiManageKey = "5a117587e47b4cb199e9b78caf8ef7ac"
var azureMLModelId = "45446586-493f-40e2-9d1a-a7bd9853375d"
var azureMLBuildId = "1543796"
var inSearch = false;

function execSuggest()
{
	// Execute a search to lookup viable movies
   // var q = encodeURIComponent($("#q").val());
    
   // //$top = 12 &&
   // var searchAPI;
   // searchAPI = "https://tspapimanagement.azure-api.net/SearchApi/Suggest/suggest=" + q;        
   // inSearch= true;
   // $.ajax({
   //     url: searchAPI,
   //     beforeSend: function (request) {
   //         request.setRequestHeader("Ocp-Apim-Subscription-Key", azureSearchApiManageKey);
   //         request.setRequestHeader("Content-Type", "application/json");
   //         //request.setRequestHeader("Accept", "application/json; odata.metadata=none");
   //     },
   //     type: "GET",
   //     success: function (data) {
			//$( "#mediaContainer" ).html('');
			//for (var item in data.value)
			//{
   //             var id = data.value[item].VodId;
   //             var title = data.value[item].Title;
   //             var hebtitle = data.value[item].HebTitle;
   //             var description = data.value[item].HebTitle;
   //             var imageURL = data.value[item].Poster;
   //             $("#mediaContainer").
   //                 append('<div class="col-md-4" style="text-align:center"><a href="javascript:void(0);" onclick="openMovieDetails(\'' + title + '\',\'' + id + '\');"><img src=' + imageURL + ' height=200><br><div style="height:100px"><b>' + title + '</b><br><div style="height:100px"><b>' + hebtitle + '</b></a></div></div>');
			//}
			//inSearch= false;
   //     }
   // });
}

function execSearch() {
    // Execute a search to lookup viable movies
    var q = encodeURIComponent($("#q").val());

    //$top = 12 &&
    var searchAPI;
    searchAPI = "https://tspapimanagement.azure-api.net/SearchApi/Search/search=" + q;
    inSearch = true;
    $.ajax({
        url: searchAPI,
        beforeSend: function (request) {
            request.setRequestHeader("Ocp-Apim-Subscription-Key", azureSearchApiManageKey);
            request.setRequestHeader("Content-Type", "application/json");
            //request.setRequestHeader("Accept", "application/json; odata.metadata=none");
        },
        type: "GET",
        success: function (data) {
            $("#mediaContainer").html('');
            for (var item in data.value) {
                var id = data.value[item].VodId;
                var title = data.value[item].Title;
                var hebtitle = data.value[item].HebTitle;
                var description = data.value[item].Description;
                var imageURL = data.value[item].Poster;
                $("#mediaContainer").
                    append('<div class="col-md-4" style="text-align:center"><a href="javascript:void(0);" onclick="openMovieDetails(\'' + title + '\',\'' + hebtitle + '\',\'' + id + '\',\'' + description + '\');"><img src=' + imageURL + ' height=200><br><div style="height:100px"><b>' + title + '</b><br><div style="height:100px"><b>' + hebtitle + '</b></a></div></div>');
            }
            inSearch = false;
        }
    });
}

function openMovieDetails(title, hebtitle, id, description)
{
	// Open the dialog with the recommendations
    $("#modal-title").html(title );
    $("#modal-hebtitle").html(hebtitle);
    $("#modal-description").html(description);

	$("#recDiv").html('Loading recommendations...');

	var recommendatationAPI = "https://api.datamarket.azure.com/data.ashx/amla/recommendations/v2/ItemRecommend?$format=json&modelId='" + azureMLModelId + "'&numberOfResults=5&buildId=" + azureMLBuildId + "&includeMetadata=false&apiVersion='1.0'&itemIds='" + id + "'";

	$.ajax({
		url: recommendatationAPI,
		beforeSend: function (request) {
			request.setRequestHeader("Authorization", "Basic QWNjb3VudEtleTpIK0ZDVldETWZZbnpja2ZUa3pxNDlzT01aR2dFVDlVNFdqL2xCSHhZeStzPQ==");
		},
		type: "GET",
		success: function (data) {
			$("#recDiv").html('');
			for (var item in data.d.results)
				$( "#recDiv" ).append( '<p>' + data.d.results[item].Name + '</p>' );
		}
	});

	$('#myModal').modal('show');
}