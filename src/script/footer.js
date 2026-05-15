export const footerApp = () => {
  const data = new Date();

  return `
    

    
    <footer class="app-footer">
         <div class="footer-content">
            
                <p>&copy; ${data.getFullYear()} <a href="" target="_blank">KelvRunTime</a> Engine — HT</p>
            <div class="tech-stack">
                <span>Node.js</span>  <span>Docker</span>  <span>FFmpeg</span>
            </div>
        
         
        </div>
    
        </footer>

    
    
    
    
    
    `;
};
function mountFooter() {
  const el = document.querySelector("#footer");
  if (el) el.innerHTML = footerApp();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountFooter);
} else {
  mountFooter();
}
