import { showTopBanner, authStatus } from "./shared.js";


// Appeller la fonction pour le status d'authentification
authStatus();

// Appeller la fonction pour afficher le bandeau top si un token est présent dans le localStorage
showTopBanner();

//  cibler le formulaire de login et ses champs
let loginForm = document.querySelector('#login-form');
let eMail = document.querySelector('#email');
let passwd = document.querySelector('#pwd');

// cibler le bouton de validation du formulaire
let loginBtn = document.querySelector('input[type="submit"]');
loginBtn.addEventListener('click', (event) => {
  event.preventDefault();

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

  // Appel de la fonction loginRequest avec l'id pour effectuer l'authentification 
  loginRequest(id);
}



function loginRequest(id) {

  // initialiser le header de la requête HTTP
  let httpHeaders = new Headers();
  httpHeaders.append("Content-Type", "application/json");

  // définir la méthode POST et insérer l'id JSON dans le body
  let requestOptions = {
    method: 'POST',
    headers: httpHeaders,
    body: id,
    redirect: 'follow'
  };

  // envoyer la requête de connexion
  // TODO - Voir pour remplacer la partie http:Domain:Port de l'url par une variable 
  fetch("http://127.0.0.1:5678/api/users/login", requestOptions)
    .then(response => response.text())

    .then(result => {

      let obj;
      console.log("résultat avant JSON.parse : " + result)
      try {
        // Parser l'objet JSON pour transformer result en objet et récupérer le token
        obj = JSON.parse(result, (key, value) => {
          if (key === 'token') {
            console.warn(); ('le token de lutilisateur est : ' + value)
            // Passer le token au Local Storage
            saveLocaly(value);
          } else if (key === 'error' || key === 'message' && value === 'user not found') {
            console.error('Erreur de connexion, indentifiant non reconnu')
            informUser();
          }

          //  Renvoyer la valeur du token pour la suite du traitement 
          return value;

        }
        );
      } catch (err) {
        // en cas d'erreur dans le try envoyer de l'information dans la console
        console.error('Erreur dans le JSON.parse:', err);
        throw new Error('JSON invalide');
      }
    })

    .catch(error => console.error('error', error));

}

/** 
 * TODO : Interdire une value "undefined" pour le token avec une structure conditionelle 
 * ! enregistrer uniquement le token dans le localstorage si il est valide
 * ! appeller la fonction showTopBanner unqiuement si le token est valide 
 * TODO : redirection à la page d'accueil après le login
 * ! changer login en logout dans le menu de nav
 * * ajouter les modales 
 * * appeller la route de POST
 */
function saveLocaly(token) {
  // Enregistrer le token dans le local storage du navigateur
  localStorage.setItem('bearerToken', token);

  // Appeller la fonction pour afficher le bandeau top
  showTopBanner();
  goToPage('../index.html');
}




function goToPage(url) {
  window.location.href = url;
};


// TODO : Améliorer la fonction pour afficher un message d'erreur en cas de mauvais crédentials
function informUser() {
  alert('Erreur de connexion, indentifiant non reconnu')
};


