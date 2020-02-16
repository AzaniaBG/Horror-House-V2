const omdbKey = "cb95d063"
const tmdbKey = "b81d09aa5f188c95ba4dc2e4336459b4"

const omdbBase = "http://www.omdbapi.com/?"

function formatOmdbParameters(params) {
    let idQuery = Object.keys(params).map((key) => `${key}=${encodeURIComponent(params[key])}`);
console.log(`idQuery is ${idQuery}`)
    return idQuery.join("&");
}
function getMovieID(query) {
    const params = {
        apikey: omdbKey,
        s: query,
    }
    let omdbIDQuery = formatOmdbParameters(params);
console.log(`omdbIDQuery is ${omdbIDQuery}`)
    let omdbIDURL = omdbBase + omdbIDQuery;
console.log(`omdbIDURL is ${omdbIDURL}`)   
    fetch(omdbIDURL)
    .then(response => response.json())
    .then(responseJson => console.log(responseJson));
}
function getQuery() {
    $("#js-single-movie-search-submit").on("click", event => {
        event.preventDefault();
        let searchInput = $("#js-single-movie-search").val();
        getMovieID(searchInput);
    })
}
function initApp() {
    getQuery();
}
$(initApp);