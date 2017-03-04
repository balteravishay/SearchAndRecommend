//var azureSearchQueryApiKey = "54D83159A5E23BBF0AA35349F4DF1B31";
var azureSearchApiManageKey = "424a7e57dcab40e4a3d33c64459b4552"
//var azureMLModelId = "45446586-493f-40e2-9d1a-a7bd9853375d"
//var azureMLBuildId = "1543796"
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
            for (var item in data.recommendedItems)
                $("#recDiv").append('<p>' + data.recommendedItems[item].items[0].name + '</p>' );
		}
	});

	$('#myModal').modal('show');
}