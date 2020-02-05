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
    $("#js-multi-movie-search-submit").on("click", event => {
        event.preventDefault();
        let multiMovieSearchValue = $("#js-multi-movie-search").val();
        let maxResults = $("#js-max-results").val();
        getSimilarMovies(multiMovieSearchValue, maxResults);
        $("#js-multi-movie-search").val("");
        $("#js-max-results").val("");
        $("#single-search-screen-header").show();
        $("#results-screen").show();
        $("#js-similar-movie-results").show();

    })
    
}