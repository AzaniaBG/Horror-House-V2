'use strict'

//store API keys in global variables to access for API calls
const omdbKey = "cb95d063"
const tmdbKey = "b81d09aa5f188c95ba4dc2e4336459b4"

//save API base URLs to modify according to search
const omdbSearchURL = "https://cors-anywhere.herokuapp.com/http://www.omdbapi.com/?"//use to get movie ID
const tmdbSearchURL = "https://cors-anywhere.herokuapp.com/http://api.themoviedb.org/3/movie/"//use for ratings, etc.
//config for ID: https://api.themoviedb.org/3/configuration?api_key=b81d09aa5f188c95ba4dc2e4336459b4
const YouTubeURL = "https://www.googleapis.com/youtube/v3/"

//format query parameters
    function formatOmdbQueryParams(params) {
    //return an array of keys in the `params` object and, from that array, create a string from each property: key=value, and join the key/value properties with &
        const imageQueryItems = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`);

        return imageQueryItems.join("&");
    }
    function formatTmdbQueryParams(params) {
        const videoQueryItems = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`);
        return videoQueryItems.join("&");
    }

    function getOmdbMovieInfo(query, num) {
        
        const params = {
            apikey: omdbKey,
            t: query,
            type: "movie",            
            page: num,
        }
        const queryString = formatOmdbQueryParams(params);
        const searchURL = omdbSearchURL + queryString;

        fetch(searchURL)
           .then(response => {
               if(response.ok) {
                return response.json();
               }
               throw new Error(response.statusText);
            })
           .then(responseJson => {
               if(responseJson.hasOwnProperty("Response") && responseJson.hasOwnProperty("Error")) {
                throw new Error(responseJson.Error);
               }
                parseMovieInfo(responseJson, query);               
            }).catch((err) => {
console.log("Oh the HORROR! Something went wrong :(", err);
                handleErrorMessage(err);
            });
    }

    function  getDetailsWithId(id) {
        const params = {
            apikey: omdbKey,
            i: id,
        }
        let queryIdString = formatOmdbQueryParams(params);
        let omdbIdSearchURL = `https://cors-anywhere.herokuapp.com/http://www.omdbapi.com/?` + queryIdString;
        fetch(omdbIdSearchURL).then(response => {
            if(response.ok) {
                return response.json();
            } throw new Error("Oh the HORROR! Something went wrong :(")
            }).then(responseJson => console.log(responseJson)).catch(err => {
                handleErrorMessage(err);
            });

    }
    function getYtId(imdbID) {
                const params = {
                api_key: tmdbKey,
                language: "en-US",
                append_to_response: "videos",
            }
            const queryString = formatTmdbQueryParams(params);
            const videoURL = tmdbSearchURL + `${imdbID}/videos?` + queryString;
            fetch(videoURL).then(response => response.json()).then(responseJson => {
                let videos = responseJson.results;
                let ytMatch = videos.filter(video => video["site"] === "YouTube");
                let ytID = ytMatch[0]["key"]
                displayVideoTrailer(ytID);
            })
    }

//find similar movies and list results according to maxResults specified
    function getSimilarMovies(searchInput, maxResults) {

        const parameters = {
            api_key: tmdbKey,
            language: "en-US",
            query: searchInput,
            page: 1,
        }
        const queryString = formatTmdbQueryParams(parameters);
        const tmdbSearchURL = "https://cors-anywhere.herokuapp.com/http://api.themoviedb.org/3/search/movie/?"
        const similarURL = tmdbSearchURL + queryString;

        fetch(similarURL).then(response => {
                if(response.ok) {
                    return response.json();
                } throw new Error("Oh the HORROR! Something went wrong :(")
            }).then(responseJson => { 
console.log(`responseJson is:`, responseJson);
                if(responseJson.results.length === 0) {
                    handleUndefined();
                } else {
                let results = responseJson.results;
                let titles = results.map(item => item["title"]);
                //for each result, display the title per the displaySimilarMovies function them in a list item
                displaySimilarMovies(titles, maxResults)   
                }         
            }).catch(err => {
console.log(`err is ${err}`)
                $("#search-error-message")
                });
    }

    function parseMovieInfo(responseJson, query) {

        let movieTitle = responseJson["Title"];
        let movieYear = responseJson["Year"];
        let moviePlot = responseJson["Plot"];
        let imdbRating = responseJson["imdbRating"];
        let imdbID = responseJson["imdbID"];
        displayMovieInfo(movieTitle, movieYear, moviePlot, imdbRating);
        getYtId(imdbID);
        getDetailsWithId(imdbID);       
}

//display information related to search results for one movie
    function displayMovieInfo(title, year, plot, rating) {
        let movieInfoString = `<h3>${title} (${year})</h3>
        <aside>IMDB Rating: ${rating}</aside>
        <article>${plot}</article>
        <video></video>`;
        $("#one-movie-description").html(movieInfoString);
    }

    function displayVideoTrailer(ytID) {

        let trailer = `https://www.youtube.com/embed/${ytID}?enablejsapi=1&origin=https://m.media-amazon.com/images/M/MV5BMTUyNzkwMzAxOF5BMl5BanBnXkFtZTgwMzc1OTk1NjE@._V1_SX300.jpg`
        let iFrameElement = `<iFrame id="iFrame-player" type="text/html" width="200" height="200"src="${trailer}"></iFrame>`
        $("#iFrame-player").html(iFrameElement);    
    }

    function displaySimilarMovies(movies, maxResults) {
        $("li").detach();
        if(movies.includes("undefined || 0")) {
            handleErrorMessage();
        } else {
        
            for(let i = 0; i < maxResults; i++) {
                let movie = `<li class="results">${movies[i]}</li>`;
                $("ul").append(movie);         
            }
        }
    }
//previously handleOneSearch()
    function handleSingleSearchSubmit() {
        $("#main-screen-header").hide()
        $("#js-single-movie-search-submit").on("click", event => {
            event.preventDefault();
            let singleSearchValue = $("#js-single-movie-search").val();
            getOmdbMovieInfo(singleSearchValue, 10);
            $("#js-single-movie-search").val("");
            $("#multi-movie-search").hide();
            $("#single-search-screen-header").show();
            $("#results-screen").show();
            $("#js-one-movie-results").show();
        })

    }
// function handleOneSearch() {                             DELETE 
//         $("#single-search-screen-header").hide();
//     $("#js-search-one").on("click", event => {
//         event.preventDefault();
//         $("#main-screen-header").hide();
//         $("#multi-search-screen-header").hide();
//         $("#js-multi-search-option").hide();
//         $("#js-search-one").hide();
//         $("#one-movie-search").show();
//         $("#single-search-screen-header").show();
//     });
// }

//previously handleMultiSearch()   
function handleMultiSearchSubmit() {
    $("#js-multi-movie-search-submit").on("click", event => {
        event.preventDefault();
        let multiMovieSearchValue = $("#js-multi-movie-search").val();
        let maxResults = $("#js-max-results").val();
        getSimilarMovies(multiMovieSearchValue, maxResults);
        $("#js-multi-movie-search").val("");
        $("#js-max-results").val("");
        $("#main-screen-header").hide();
        $("#single-search-screen-header").show();
        $("#results-screen").show();
        $("#js-similar-movie-results").show();

    })
    
}
// function handleMultiSearch() {                        DELETE
//     $("#js-multi-search-option").on("click", event => {
//         event.preventDefault();    
//         $("#main-screen-header").hide();
//         $("#js-search-one").hide();
//         $("#js-multi-search-option").hide();
//         $("#multi-search-screen-header").show();
//         $("#js-multi-search-button").show();
//         $("#similar-movies-search").show();
//     });
// }
    
// function handleOneSubmitButton() {                       DELETE
//     $("#js-one-movie-search-button").on("click", event => {
//         event.preventDefault();
//         $("#error-messages").hide();
//         let searchTerm = $("#js-one-movie-search").val();
//         //empty search results in order to permit new search 
//         $("#js-one-movie-search").val("");
//         getOmdbMovieInfo(searchTerm, 10);
//         // $("#main-screen-header").hide();
//         $("#similar-movies-search").hide();
//         //$("#single-search-screen-header").hide();
//         //$("#one-movie-search").hide();
//         $("#js-one-movie-results").show();
//         //$("#js-new-search").show();
//     });
// }


// function handleMultiSubmitButton() {                 DELETE
//     $("#js-multi-search-button").on("click", event => {
//         event.preventDefault();
//         $("#error-messages").hide();
//         $("#search-error-message").hide();
//         let multiSearchTerm = $("#js-similar-movies").val();
//         let maxResults = $("#js-max-results").val();
//         $("#js-similar-movies").val("");
//         $("#js-max-results").val("3");
//         getSimilarMovies(multiSearchTerm, maxResults);
//         $("#main-screen-header").hide();
//         $("#one-movie-search").hide();
//         $("#js-one-movie-results").hide(); 
//         //$("#similar-movies-search").hide(); 
//         $("#js-similar-movie-results").show();
//         $("ul").show();
//         //$("#js-new-search").show();
//         //$("#js-multi-new-search").show();
//     })
// }

    // function handleNewSearchOne() {
    //     $("#js-new-search-one").on("submit", event => {
    //         event.preventDefault();
    //         // $("#js-new-search").hide();
    //         // $("#js-multi-new-search").hide();
    //         $("#one-movie-search").show();
    //     })
        
    // }

    // function handleNewSearchMulti() {
    //     $("#js-multi-new-search").on("submit", event => {
    //         event.preventDefault();
    //         $(".search").show();
    //         // $("#js-new-search").hide();
    //         // $("#js-multi-new-search").hide();
    //         // $(".search").show();
    //         // handleMultiSubmitButton();
    //     });
    // }
    function handleErrorMessage(error) {
console.log(`handleErrorMessage ran`)
        let errorMessage = `Oh the HORROR! ${error}`;
            $("#error-messages").show();
            $("#search-error-message").show();
            $("#search-error-message").text(errorMessage); 
            
    }
    function handleUndefined() {
        let errorMessage = `Oh the HORROR! No movie found.`;
        $("ul").hide();
        $("#error-messages").show();
        $("#search-error-message").show();
        $("#search-error-message").text(errorMessage); 
    }

    function handleHomeButton() {
        $("#js-results-home").on("click", event => {
            event.preventDefault();
            $(".results").hide();
            $("#error-messages").hide();
            $(".similar-movies").show();
            $(".one-movie").show();
           
        })
    }

    function handleHomeScreen() {
        $("#main-screen-header").show();
        $("#search-screen-headers").hide();
    }
    function handleResultsScreen() {
        $("#results-screen").show();
        $("#credits").show();
        $("#js-one-movie-results").hide();
        $("#js-similar-movie-results").hide();
    }

    function initApp() {
        handleSingleSearchSubmit();
        handleMultiSearchSubmit();
        handleHomeButton();
        handleHomeScreen();
    }
    
//ACTIVATE APP--call j$ and pass in a callback function to run when the page loads
$(initApp)