

// initialiser le header de la requête HTTP
let httpHeaders = new Headers();
httpHeaders.append("Content-Type", "application/json");

// Récupérer les infos de connexion depuis le formulaire
let id = JSON.stringify({
  "email": "sophie.bluel@test.tld",
  "password": "S0phie"
});


// initialiser la requête POST
let requestOptions = {
  method: 'POST',
  headers: httpHeaders,
  body: id,
  redirect: 'follow'
};

// envoyer la requête de connexion
fetch("http://127.0.0.1:5678/api/users/login", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));