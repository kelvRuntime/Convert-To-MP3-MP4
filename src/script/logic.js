export const initLogic = () => {
  const urlInput = document.querySelector("#videoUrl");
  const statusDiv = document.querySelector("#status");
  const btnColar = document.querySelector("#btnColar");
  const API_URL= "http://localhost:5000";

  const fetchPreview = async (url) => {

    if (!url.includes("youtube.com") && !url.includes("youtu.be")) return;

    statusDiv.innerHTML = "⌛ Loading Preview....";
    statusDiv.computedStyleMap.color = "#8b949e";

    try {
            const response = await fetch(`${API_URL}/info?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (data.error) throw new Error(data.error);

            
            const allFormats = data.formats || [];
         

          statusDiv.innerHTML = `
         <div class="preview-card">
         <div class="card-header">
          <img src="${data.thumbnail}" 
          class="preview-thumb" alt="Thumbnail"/>
          <div class="preview-info">
            <p class="preview-title">${data.title}</p>
            <p class="preview-author">${data.author}</p></div></div>


            <div class="quality-panel">
            <div class="select-group">
              <label>Format</label>
              <select id="formatSelect" class="pro-select">
                <option value="mp4">MP4 (Video)</option>
                <option value="mp3">MP3 (Audio)</option>
              </select>
            </div>
            
            
            <div class="select-group">
            <label>Quality</label>
            <select id="itagSelect" class="pro-select">
            </select>
             </div>
            
            <button id="mainDownloadBtn" class="btn-download-pro">
            Download Media
            </button>
            

          </div>
        </div>
        `;

            const itagSelect = document.querySelector("#itagSelect");
            const formatSelect = document.querySelector("#formatSelect");

           //para copiar
         const updateQualities = (format) =>{

          

          if (format === 'mp3'){
            itagSelect.innerHTML = `<option value="bestaudio"> Extreme (320kbps)</option>
            <option value="140"> High (128kbps)</option>
            <option value="139"> Medium (48kbps)</option>
            `;

          }else{
           const videoOptions = allFormats.filter(f => f.quality && f.quality !=='unknown').slice(0, 5).map( f =>  `<option value="${f.itag}">${f.quality} .${f.container}</option>`).join("");
           
           itagSelect.innerHTML = videoOptions ||`<option value="best"> Best Available</option>`;
          }
         };
         updateQualities("mp4");
          
         formatSelect.addEventListener("change", (e)=> updateQualities(e.target.value))

           document.querySelector("#mainDownloadBtn")
          .addEventListener("click", () => {
           const format = formatSelect.value;
           const itag = itagSelect.value;
           statusDiv.innerHTML = ` <div style="color: #00eaff; margin-top: 15px;"> <p > ⌛ Loading Your ${format.toUpperCase()}...</p> 
           <small style="color:#8b949e;">Waiting, The transfer Start Automatically, </small>`;


            

            window.location.href = `${API_URL}/download?url=${encodeURIComponent(url)}&format=${format}&itag=${itag}&title=${encodeURIComponent(data.title)}`;
              

          });

          

          
       
    } catch (err) {
      console.error("Preview fetch error:", err);
      statusDiv.innerText = `❌ Preview failed: ${err.message }`;
    }
  };
  
  urlInput.addEventListener("input", (e) => fetchPreview(e.target.value));

  btnColar.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      urlInput.value = text;
      fetchPreview(text);
    } catch (err) {
      console.error(err);
    }
  });
};
