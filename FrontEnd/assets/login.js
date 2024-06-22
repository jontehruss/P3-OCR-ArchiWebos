// Appeller la fonction pour afficher le bandeau top
showTopBanner();

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
  // console.log(requestOptions);

  // envoyer la requête de connexion
  // TODO - Voir pour remplacer la partie http:Domain:Port de l'url par une variable 
  fetch("http://127.0.0.1:5678/api/users/login", requestOptions)
    .then(response => response.text())

    .then(result => {
      // console.log('before JSON.parse')

      let obj;
      console.log("résultat avant JSON.parse : " + result)
      try {
        // Parser l'objet JSON pour transformer result en objet et récupérer le token
        obj = JSON.parse(result, (key, value) => {
          if (key === 'token' ) {
            console.log('le token de lutilisateur est : ' + value)
            // Passer le token au Local Storage
            saveLocaly(value);
          } else if (key === 'message' && value === 'user not found' ) {
            console.error('Erreur de connexion, indentifiant non reconnu')
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

      // Vérifier que la value du token est de type string 
      // if (obj && typeof ) 


    console.log(obj)



      // Passer le token au Local Storage
      // saveLocaly(token);

    })

    .catch(error => console.error('error', error));

}

/** 
 * TODO : Interdire une value "undefined" pour le token avec une structure conditionelle 
 * ! enregistrer uniquement le token dans le localstorage si il est valide
 * ! appeller la fonction showTopBanner unqiuement si le token est valide 
 * * Faire redirection sur page accueil après le login
 * * ajouter les modales 
 * * appeller la route de POST
 */
function saveLocaly(token) {
    // Enregistrer le token dans le local storage du navigateur
    localStorage.setItem('bearerToken', token);
    console.log('Le TOKEN est dans le local Storage');

    // Appeller la fonction pour afficher le bandeau top
    showTopBanner();
}

// Attribuer une classe au container HTML pour qu'il s'affiche avec ses règles CSS
function showTopBanner () {
  
  let token = localStorage.getItem('bearerToken');
  
  if (token) {
    console.log(token)
    let topBanner = document.querySelector('#logged-in');
    console.log(topBanner);
    topBanner.className = 'top-banner-edit';
    console.log(topBanner);
  }

  

}


/**
 * TODO: 
 * * -> Utiliser le token pour se connecter
 * * -> fonction pour vérifier si token dans le localstorage - si ok afficher le bandeau supérieur (connecté)
 */
