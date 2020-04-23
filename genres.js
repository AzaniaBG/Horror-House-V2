const genresURL = `https://api.themoviedb.org/3/genre/movie/list?api_key=b81d09aa5f188c95ba4dc2e4336459b4&language=en-US`;
const genres = fetch(genresURL)
    .then(res => res.json())
    .then(data => data);
const genreId = genres.map(genre => genre.id);
module.exports = genres;