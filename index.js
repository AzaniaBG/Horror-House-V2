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
               throw new Error(response.statusText, `yikes`);
            })
           .then(responseJson => {
               if(responseJson.hasOwnProperty("Response") && responseJson.hasOwnProperty("Error")) {
                throw new Error(responseJson.Error);
               }
                parseMovieInfo(responseJson, query);               
            }).catch((err) => {

                let errorMessage = `Oh the HORROR! ${err} Please check your search...or else.`
                handleErrorMessage(errorMessage);
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
                let ytID = ytMatch[0]["key"];
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
                let results = responseJson.results;

                if(responseJson.results.length === 0) {
                    handleUndefined();
                } else {             
                let titles = results.map(item => item["title"]);
                let releaseDate = results.map(item => item["release_date"]);
                let genreIds = results.map(item => item["genre_ids"]);
                
                //for each result, display the title per the displaySimilarMovies function in a list item
                displaySimilarMovies(titles, releaseDate, maxResults)   
                }         
            }).catch(err => $("#search-error-message"));
    }

    function parseMovieInfo(responseJson, query) {
     
        let movieTitle = responseJson["Title"];
        let movieYear = responseJson["Year"];
        let moviePlot = responseJson["Plot"];
        let imdbRating = responseJson["imdbRating"];
        let imdbID = responseJson["imdbID"];
        if(responseJson["Genre"].includes("Horror" || "horror")) {
            getYtId(imdbID);
            displayMovieInfo(movieTitle, movieYear, moviePlot, imdbRating);
        } else {
            let error = "CURSES! No horror movies found"
            handleErrorMessage(error);
        }    
}

//display information related to search results for one movie
    function displayMovieInfo(title, year, plot, rating) {
        let movieInfoString = `<h3>${title} (${year})</h3>
        <aside>IMDB Rating: ${rating}</aside>
        <article>${plot}</article>
        `;
        $("#one-movie-description").html(movieInfoString);
    }

    function displayVideoTrailer(ytID) {

        let trailer = `https://www.youtube.com/embed/${ytID}?enablejsapi=1&origin=https://m.media-amazon.com/images/M/MV5BMTUyNzkwMzAxOF5BMl5BanBnXkFtZTgwMzc1OTk1NjE@._V1_SX300.jpg`
        let iFrameElement = `<iFrame id="iFrame-player" type="text/html" width="100%" height="200"src="${trailer}"></iFrame>`
        $("#iFrame-player").html(iFrameElement);    
    }

    function displaySimilarMovies(movies, releaseDate, maxResults) {
        $("li").detach();
        if(movies.includes("undefined || 0")) {
            handleErrorMessage(`Curses! No movie found.`);
        } else {
            let biggestResults = (movies.length > maxResults)? maxResults : movies.length;
            for(let i = 0; i < biggestResults; i++) {
                let movieAndDate = `<li class="results">${movies[i]} - Released: ${releaseDate[i]}</li><br>`;
                $("ul").append(movieAndDate);         
            }
        }
    }
//previously handleOneSearch()
    function handleSingleSearchSubmit() {
            $("#js-single-movie-search-submit").on("click", event => {
            event.preventDefault();
            $("#error-messages").hide();
            handleResultsScreen();
            let singleSearchValue = $("#js-single-movie-search").val();
            getOmdbMovieInfo(singleSearchValue, 10);
            $("#js-single-movie-search").val("");
            $("#multi-movie-search").hide();
            $("#single-search-screen-header").show();
            $("#js-one-movie-results").show();
        })
    }

//previously handleMultiSearch()   
function handleMultiSearchSubmit() {
    $("#js-multi-movie-search-submit").on("click", event => {
        event.preventDefault();
        $("#error-messages").hide();
        handleResultsScreen();
        let multiMovieSearchValue = $("#js-multi-movie-search").val();
        let maxResults = $("#js-max-results").val();
        getSimilarMovies(multiMovieSearchValue, maxResults);
        $("#js-multi-movie-search").val("");
        $("#js-max-results").val(3);
        $("#main-screen-header").hide();
        $("#multi-search-screen-header").show();
        $("#js-similar-movie-results").show();
        $("#js-similar-movies-list").show();

    })
    
}

    function handleErrorMessage(error) {
            $("#main-screen-header").hide();
            $("#js-one-movie-results").hide();
            $("#credits").hide();
            $("#search-error-message").text(error); 
            $("#error-messages").show();
            $("#search-error-message").show();            
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
            handleHomeScreen();
        })
    }

    function handleHomeScreen() {
        $("#error-messages").hide();
        $("#results-screen").hide();
        $("#search-screen-headers").hide();
        $("#js-results-home").hide();
        $("#credits").hide();
        $("#main-screen-header").show();
        $("#home-search-screen").show();
        $("#multi-movie-search").show();
    }
    function handleResultsScreen() {
        $("#main-screen-header").hide()
        $("#results-screen").show();
        $("#credits").show();
        $("#search-screen-headers").show();
        $("#js-results-home").show();
        $("#js-one-movie-results").hide();
        $("#js-similar-movie-results").hide();
        $("#single-search-screen-header").hide();
        $("#multi-search-screen-header").hide();
    }

    function initApp() {
        handleSingleSearchSubmit();
        handleMultiSearchSubmit();
        handleHomeButton();
        handleResultsScreen();
        handleHomeScreen();     
    }
    
//ACTIVATE APP--call j$ and pass in a callback function to run when the page loads
$(initApp)