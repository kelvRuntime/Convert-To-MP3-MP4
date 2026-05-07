import "../style/style.css";
import "../style/card.css";
import { initLogic } from "./logic.js";

export const renderApp = () => {
  document.querySelector("#app").innerHTML = `
    <section id="container">

    <h1 class="logo"> Media <span> API </span></h1>
    <p class="subtitle"> Software by KelvRunTime</p>

    <div class="input-wrapper">
    <input type="text" id="videoUrl" placeholder="www.youtube.com/watch?v=..."/>
    <button  type="button" id="btnColar">Paste</button>
    </div>

    <div class="buttons"> 
    <button   id="downloadMP3" class="btn-primary"> Convert to MP3</button>
    <button   id="downloadMP4" class="btn-secondary"> Convert to MP4</button>
    </div>

    <div id="status" class="status-msg"></div>

    </section>
    `;
};

renderApp();
initLogic();
