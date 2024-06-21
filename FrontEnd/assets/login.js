

//  cibler le formulaire de login et ses champs
let loginForm = document.querySelector('#login-form');
let eMail = document.querySelector('#email');
let passwd = document.querySelector('#pwd');

// cibler le bouton de validation du formulaire
let loginBtn = document.querySelector('input[type="submit"]');
loginBtn.addEventListener('click', (event) => {
  event.preventDefault();

  // console.log(eMail.value);
  // console.log(passwd.value);

  formatCredentials(eMail.value, passwd.value);

});



/**
 * @param eMail est récupéré du champ email du formulaire
 * @param passwd est récupéré du champ password du formulaire
 */
function formatCredentials(eMail, passwd) {

  // Récupérer les infos de connexion depuis le formulaire
  let id = JSON.stringify({
    "email": eMail,
    "password": passwd
  });

  // Création JSON manuelle avec interpollation
    // let id = `{"email":"${eMail}","password":"${passwd}"}`;
    // console.log(id);

  // Appel de la fonction loginRequest avec l'id pour effectuer l'authentification 
  loginRequest(id);
}



function loginRequest(id) {

  // initialiser le header de la requête HTTP
  let httpHeaders = new Headers();
  httpHeaders.append("Content-Type", "application/json");
  // console.log(Headers);

  // définir la méthode POST et insérer l'id JSON dans le body
  let requestOptions = {
    method: 'POST',
    headers: httpHeaders,
    body: id,
    redirect: 'follow'
  };
  console.log(requestOptions);

  // envoyer la requête de connexion
  // TODO - Voir pour remplacer la partie http:Domain:Port de l'url par une variable 
  fetch("http://127.0.0.1:5678/api/users/login", requestOptions)
    .then(response => response.text())

    .then(result => console.log(result))

    .catch(error => console.log('error', error));


}




/**
 * TODO: 
 * -> JSON.Parse sur result pour récupérer le token
 * -> Utiliser le token pour se connecter
 * ->  fonction pour vérifier si token dans le localstorage - si ok afficher le bandeau supérieur (connecté)
 */
