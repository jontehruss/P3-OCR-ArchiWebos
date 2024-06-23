// Attribuer une classe au container HTML pour qu'il s'affiche avec ses règles CSS
export function showTopBanner() {

    let token = localStorage.getItem('bearerToken');
    // Vérifier la présence du Token 
    /** 
     * TODO : Améliorer la vérification du token
     */
    if (token) {
        console.log(token)
        //   let topBanner = document.querySelector('#logged-in');
        //   console.log(topBanner);
        //   topBanner.className = 'top-banner-edit';
        //   console.log(topBanner);

        createTopBanner();
    }
};

function createTopBanner() {
    // Verifier si le Div existe déjà (car empilement si plusieurs clics sur 'Se connecter')
    if (document.querySelector('.top-banner-edit')) {
        //  si vrai on arrête la fonction
        console.log('TopBanner existe !!')
        return;
    }

    // créer un container pour le bandeau loggedIn
    let topBanner = document.createElement('div');

    // Attribuer la classe pour l'afficher et insérer le contenu
    topBanner.className = 'top-banner-edit';
    topBanner.innerHTML = '<p><a href="#"><i class="fa-regular fa-pen-to-square"></i></a> MODE Édition</p>';

    // cibler la première place du body et insérer le conteneur HTML
    let html = document.getElementsByTagName('html')[0];
    let body = document.getElementsByTagName('body')[0];
    html.insertBefore(topBanner, body);

};

export function addEditButon () {
    
    // Créer un div pour les boutons filtres
    let editBtn = document.createElement('p');
    editBtn.innerHTML = '<a href="#"><i class="fa-regular fa-pen-to-square"></i></a> MODE Édition';

    let titleEdit = document.querySelector('#title-projet > h2');
    // insérer après titrePortfolio sans l'imbriquer à l'intérieur avec insertAdjacentElement afterend
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