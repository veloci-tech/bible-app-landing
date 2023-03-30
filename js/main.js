
console.log("Loaded Main");

function Hello() {
    // Reactive properties
    const self = this;
    self.count = 90;
    self.articles = [
    ];
    const urlTop = "https://us-central1-bible-app-001.cloudfunctions.net/getTopArticles";
    const urlLocal = "http://localhost:5001/bible-app-001/us-central1/getTopArticles";
    const payloadGeneric = {
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        }
    };

    fetch(urlTop, payloadGeneric)
    .then(handleResponse()).then((result) => {
        self.text.style.visibility = 'hidden';
        self.text.style.height = '0';
        self.articles = result;
    }).catch((error) => {
        console.log(error);
    });

    // Component template
    return `
<>
        <div class="row align-items-center"  @ref='self.text'>
          <div class="lottie-container">
            <lottie-player src="./98194-loading.json" background="transparent"  speed="1"  style="width: 300px; height: 300px;" loop autoplay></lottie-player>
          </div>
        </div>
        <div class="row articles" @loop="self.articles">
          <div class="col-lg-4" >
            <div class="container" >
              <h2 class="fw-normal">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
                        class="bi bi-journal-text" style="margin-bottom: 8px"  viewBox="0 0 16 16">
                  <path d="M5 10.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                  <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2z"/>
                  <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1z"/>
                </svg>
                <span>{{self.title}}</span></h2>
              <p>{{self.articlePreview}}</p>
            </div>
          </div>
        </div>
</>
`;
}

function attachArticle() {
    lemonade.render(Hello, document.getElementById('articles'));
}

export const handleResponse = () => {
    return async function(response) {
        if(response.ok) {
            return response.json();
        }
    };
};
//setTimeout(attachArticle, 1000);
    attachArticle();


