// React
var React = require('react')
var ReactDOM = require('react-dom')

// Google Maps
var ReactGMaps = require('react-gmaps')
var {Gmaps, Marker} = ReactGMaps

// Movie data
var movieData = require('./data/movies.json')
var theatres = require('./data/theatres.json')

// Components
var Header = require('./components/Header')
var MovieDetails = require('./components/MovieDetails')
var MovieList = require('./components/MovieList')
var NoCurrentMovie = require('./components/NoCurrentMovie')
var MovieMap = require('./components/MovieMap')
var NavBar = require('./components/NavBar')

//Firebase
var Rebase = require('re-base')
var base = Rebase.createClass({
  apiKey: "AIzaSyB0uUUk4nZuoUIHhIl7DuH1SRf0_LN_WfA",
  databaseURL: "https://final-f9fb3.firebaseio.com/",
})

var App = React.createClass({
  movieClicked: function(movie) {
    this.setState({
      currentMovie: movie
    })
  },
  movieWatched: function(movie) {
    var existingMovies = this.state.movies
    var moviesWithWatchedMovieRemoved = existingMovies.filter(function(existingMovie) {
      return existingMovie.id !== movie.id
    })
    this.setState({
      movies: moviesWithWatchedMovieRemoved,
      currentMovie: null
    })
  },
  resetMovieListClicked: function() {
    this.setState({
      movies: movieData.sort(this.movieCompareByReleased)
    })
  },
  authChanged: function(user) {
    if (user) {
      this.setState({
        currentUser: user
      })
      console.log(user)
    } else {
      this.setState({
        currentUser: null
      })
      console.log("Logged out") }
  },
  loginComplete: function(error, response) {
    if (error) {
      console.log("Login failed")
    } else {
      console.log("Login succeeded")
    }
  },
  login: function() {
    base.authWithOAuthPopup('google', this.loginComplete)
  },
  logout: function() {
    base.unauth()
  },
  viewChanged: function(view) {
    var sortedmovies = this.state.movies
    if (view==='alpha') {
        sortedmovies = movieData.sort(this.movieCompareByTitle)
}
  else if (view==='latest') {
        sortedmovies = movieData.sort(this.movieCompareByReleased)
}
this.setState({
  currentView: view,
  movies: sortedmovies
    })
  },
  renderMovieDetails: function() {
    if (this.state.currentMovie == null) {
      return <NoCurrentMovie resetMovieListClicked={this.resetMovieListClicked} />
    } else {
      return <MovieDetails movie={this.state.currentMovie}
                           movieWatched={this.movieWatched} />
    }
  },
  renderMainSection: function() {
    if (this.state.currentView === 'map') {
      return (
        <div className="col-sm-12">
          <MovieMap />
          </div>
      )
    } else {
      return (
        <div>
          <MovieList movies={this.state.movies} movieClicked={this.movieClicked} />
          {this.renderMovieDetails()}
        </div>
      )
    }
  },
  movieCompareByTitle: function(movieA, movieB) {
    if (movieA.title < movieB.title) {
      return -1
    } else if (movieA.title > movieB.title) {
      return 1
    } else {
      return 0
    }
  },
  movieCompareByReleased: function(movieA, movieB) {
    if (movieA.released > movieB.released) {
      return -1
    } else if (movieA.released < movieB.released) {
      return 1
    } else {
      return 0
    }
  },
  getInitialState: function() {
    return {
      movies: movieData.sort(this.movieCompareByReleased),
      currentMovie: null,
      currentView: 'latest'
    }
  },
  componentDidMount: function() {
    base.syncState('/movies', { context: this, state: 'movies', asArray: true })
  },
  render: function() {
    return (
      <div>
      <Header currentUser={this.state.currentUser}
                login={this.login}
                logout={this.logout} />
              <NavBar movieCount={this.state.movies.length} currentView={this.state.currentView} viewChanged={this.viewChanged} />
      <div className="main row">
          {this.renderMainSection()}
        </div>
      </div>
    )
  }
})

ReactDOM.render(<App />, document.getElementById("app"))
