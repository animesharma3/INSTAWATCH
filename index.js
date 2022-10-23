const admin = require("firebase-admin");
const csv = require("csv-parser");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
const dotenv = require("dotenv");
const serviceAccount = require("./moviedb-c6f8e-firebase-adminsdk-eykhs-69b43e882a.json");

dotenv.config({
  path: "./.env",
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://moviedb-c6f8e.firebaseio.com",
});

axios.get("https://www.imdb.com/list/ls000634294/").then(async (response) => {
  const $ = cheerio.load(response.data);
  const movies = [];

  let urls = JSON.parse($('script[type="application/ld+json"]').text()).about
    .itemListElement;
  let notFound = [];
  for (let i = 0; i < urls.length; i++) {
    let imdb_id = urls[i].url.split("/")[2];
    let url = `https://api.themoviedb.org/3/movie/${imdb_id}/videos?api_key=${process.env.TMDB_API_KEY}&language=en-US`;
    try {
      let movie = await axios.get(url);
      admin
        .firestore()
        .collection("movies")
        .doc(imdb_id)
        .update({
          videos: movie.data,
        })
        .then(() => {
          console.log("Document successfully written!");
        })
        .catch((error) => {
          console.error("Error writing document: ", error);
        });
    } catch (error) {
      notFound.push(imdb_id);
    }
  }
  console.log(notFound);
});
