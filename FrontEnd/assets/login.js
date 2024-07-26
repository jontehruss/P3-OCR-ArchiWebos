const loginUrl = "http://127.0.0.1:5678/api/users/login";

//  Ajout d'un écouteur global sur la page pour attendre que tout le contenu soit chargé avant d'executer les fonctions
document.addEventListener('DOMContentLoaded', () => {

  function verifyToken() {
    // renvoyer true ou false
    return localStorage.getItem('bearerToken') !== null;
  };

  // TODO : Vérifier doublon avec script.js
  function createTopBanner() {
    // Verifier si le Div existe déjà (car empilement si plusieurs clics sur 'Se connecter')
    if (document.querySelector('.top-banner-edit')) {
      //  si vrai on arrête la fonction
      return;
    }

    // créer un container pour le bandeau loggedIn
    let topBanner = document.createElement('div');

    // Attribuer la classe pour l'afficher et insérer le contenu
    topBanner.className = 'top-banner-edit';
    topBanner.innerHTML = '<p class="p-js-open-modal"><a href="#" class="js-open-modal"><i class="fa-regular fa-pen-to-square"></i> MODE Édition</a></p>';

    // cibler la première place du body et insérer le conteneur HTML
    let html = document.getElementsByTagName('html')[0];
    let body = document.getElementsByTagName('body')[0];
    html.insertBefore(topBanner, body);
  };

  function removeToken() {
    localStorage.removeItem('bearerToken');
  };

  function authStatus() {
    let navAuthStatus = document.getElementById('auth-status');
    if (verifyToken()) {
      // navAuthStatus.textContent = 'logout';
      navAuthStatus.innerHTML = `<a href="./index.html">logout</a>`;

      navAuthStatus.addEventListener('click', (event) => {
        // event.preventDefault(); 
        removeToken();
      })

    } else {
      navAuthStatus.innerHTML = `<a href="./assets/login.html">login</a>`;
    }
  };

  function showTopBanner() {
    let token = localStorage.getItem('bearerToken');
    if (token) {
      createTopBanner();
    }
  };

  // Appeller la fonction pour le status d'authentification
  authStatus();

  // Appeller la fonction pour afficher le bandeau top si un token est présent dans le localStorage
  showTopBanner();

  // TODO : Voir pour intégrer à une fonction
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
    fetch(loginUrl, requestOptions)
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

  // Informer l'utilisateur que les identifiants ne sont pas reconnus
  function informUser() {
    alert('Erreur de connexion, indentifiant non reconnu')
  };

});