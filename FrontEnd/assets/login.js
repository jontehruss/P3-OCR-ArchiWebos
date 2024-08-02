const loginUrl = "http://localhost:5678/api/users/login";

document.addEventListener('DOMContentLoaded', () => {


  targetLoginForm();


  function targetLoginForm() {
    let eMail = document.querySelector('#email');
    let passwd = document.querySelector('#pwd');

    let loginBtn = document.querySelector('input[type="submit"]');
    loginBtn.addEventListener('click', (event) => {
      event.preventDefault();
      formatCredentials(eMail.value, passwd.value);
    });
  };


  function formatCredentials(eMail, passwd) {
    let id = JSON.stringify({
      "email": eMail,
      "password": passwd
    });
    loginRequest(id);
  };


  function loginRequest(id) {
    let httpHeaders = new Headers();
    httpHeaders.append("Content-Type", "application/json");

    let requestOptions = {
      method: 'POST',
      headers: httpHeaders,
      body: id,
      redirect: 'follow'
    };

    fetch(loginUrl, requestOptions)
      .then(response => response.text())

      .then(result => {
        let obj;
        try {
          obj = JSON.parse(result, (key, value) => {
            if (key === 'token') {
              saveLocaly(value);
            } else if (key === 'error' || key === 'message' && value === 'user not found') {
              badCredentials();
            }
            return value;
          }
          );
          
        } catch (err) {
          console.error('Erreur dans le JSON.parse:', err);
          throw new Error('JSON invalide');
        }  
      })

      .catch(error => console.error('Erreur : ', error));
  }

  function saveLocaly(token) {
    localStorage.setItem('bearerToken', token);
    goToPage('../index.html');
  }

  function goToPage(url) {
    window.location.href = url;
  };

  function badCredentials() {
    alert('Erreur de connexion, indentifiant non reconnu')
  };

});