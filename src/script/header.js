import "../style/style.css";
import "../style/header.css";

export const headerApp = () => {
  return `   
    
    <header  class="app-header">
        <section class="header-content">
            <div class="logo-group">
                <div class="status-indicator"></div>
                <h1 class="logo-text">MEDIA <span>API</span></h1>
            </div>
            
            <nav class="header-nav">
            <a href="" target="_blank" rel="noopener noreferrer" class="nav-link">GitHub</a>
            <span class="version-tag">v1.0.0</span>
            </nav>


        </section>
    </header>


`;
};
function mountHeader() {
  const el = document.querySelector("#header");
  if (el) el.innerHTML = headerApp();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountHeader);
} else {
  mountHeader();
}
