// Attribuer une classe au container HTML pour qu'il s'affiche avec ses règles CSS
export function showTopBanner() {

    let token = localStorage.getItem('bearerToken');
    // Vérifier la présence du Token 
    /** 
     * TODO : Améliorer la vérification du token ?
     */
    if (token) {
        createTopBanner();
    }
};

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
    topBanner.innerHTML = '<p><a href="#" class="js-open-modal"><i class="fa-regular fa-pen-to-square"></i> MODE Édition</a></p>';

    // cibler la première place du body et insérer le conteneur HTML
    let html = document.getElementsByTagName('html')[0];
    let body = document.getElementsByTagName('body')[0];
    html.insertBefore(topBanner, body);
};

export function addEditButon () {
    // 
    let editBtn = document.createElement('p');
    editBtn.innerHTML = '<a href="#" class="js-open-modal"><i class="fa-regular fa-pen-to-square"></i>MODE Édition</a> ';

    let titleEdit = document.querySelector('#title-projet > h2');

    titleEdit.insertAdjacentElement('afterend', editBtn);
};


// Vérifier si le Token est présent dans localStorage
export function verifyToken () {
    // renvoyer true ou false
    return localStorage.getItem('bearerToken') !== null;
};

export function removeToken () {
    localStorage.removeItem('bearerToken');
};

//  fonction pour vérifier le statut via la présence du token 
// et modifier le menu de nav login/logout en ajoutant un écouteur pour retirer le token sur logout
export function authStatus () {
    let navAuthStatus = document.getElementById('auth-status');
    if(verifyToken()) {
        // navAuthStatus.textContent = 'logout';
        navAuthStatus.innerHTML = `<a href="./index.html">logout</a>`;

        navAuthStatus.addEventListener('click' , (event) => {
            // event.preventDefault(); 
            removeToken();       
        })

    } else {
        navAuthStatus.innerHTML = `<a href="./assets/login.html">login</a>`;       
    }
};


// fonction pour récupérer la valeur du Token 
export function getTokenValue() {
    if (verifyToken()) {
        return localStorage.getItem('bearerToken');
    }
    return null; // normalement on arrive pas ici car la modale est accessible que quand un token est présent
};