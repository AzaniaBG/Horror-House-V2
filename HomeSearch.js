'use strict'

function handleSingleSearchSubmit() {
    $("#js-single-movie-search-submit").on("click", event => {
        event.preventDefault();
        let singleSearchValue = $("#js-single-movie-search").val();
        getOmdbMovieInfo(singleSearchValue, 10);
        $("#js-single-movie-search").val("");
        $("#multi-movie-search").hide();
    })

}

function handleMultiSearchSubmit() {

    
}