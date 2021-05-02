const express = require('express')

const app = express()

app.listen('3000', () => {
    console.log(`I'm listening!`)
})

app.use(express.static('public'))

var firebaseConfig = {
    apiKey: "AIzaSyAKattZxSVNCvHhwXstBQVtFxH6zlcr5ao",
    authDomain: "vanillajsauth-76afb.firebaseapp.com",
    projectId: "vanillajsauth-76afb",
    storageBucket: "vanillajsauth-76afb.appspot.com",
    messagingSenderId: "804353047242",
    appId: "1:804353047242:web:7a80f327fb8140b3211233",
    measurementId: "G-LQ8DP7S3RF"
  };
  

app.get('/config',(request, response) => {
response.json(firebaseConfig)
})