export const initLogic = () => {
  const urlInput = document.querySelector("#videoUrl");
  const statusDiv = document.querySelector("#status");
  const btnColar = document.querySelector("#btnColar");

  const fetchPreview = async (url) => {
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) return;

    statusDiv.innerHTML = "⌛ Loading Preview....";

    try {
      const response = await fetch(
        `http://localhost:5000/info?url=${encodeURIComponent(url)}`,
      );
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // const hasFormats = Array.isArray(data.formats) && data.formats.length > 0;
      const qualityOptions = data.formats
        ? data.formats
            .map(
              (f) =>
                `<option value="${f.itag}"> ${f.quality} .${f.container}</option>`,
            )
            .join("")
        : "";

      statusDiv.innerHTML = `
         <div class="preview-card">
         <div class="card-header">
          <img src="${data.thumbnail}" 
          class="preview-thumb" alt="Thumbnail"/>
          <div class="preview-info">
            <p class="preview-title">${data.title}</p>
            <p class="preview-author">👤${data.author}</p></div></div>


            <div class="quality-panel">
            <div class="quality-selector">
              <label>Format</label>
              <select id="formatSelect" class="pro-select">
                <option value="mp3">MP3 (Audio)</option>
                <option value="mp4">MP4 (Video)</option>
              </select>
            </div>
            
            
            <div class="select-group">
            <label>Quality</label>
            <select id="itagSelect" class="pro-select">
              ${qualityOptions || '<option value="">No formats available</option>'}
            </select>
            
            <button id="mainDownloadBtn" class="btn-download-pro">
            Download Media
            </button>


          </div>
        </div>
        `;

      document
        .querySelector("#mainDownloadBtn")
        .addEventListener("click", () => {
          const format = document.querySelector("#formatSelect").value;
          const itag = document.querySelector("#itagSelect").value;
          window.location.href = `http://localhost:5000/downoad?url=${encodeURIComponent(url)}&format=${format}&itag=${itag}`;
        });
    } catch (err) {
      console.error("Preview fetch error:", err);
      statusDiv.innerText = `❌ Preview failed: ${err.message || "Unknown error"}`;
    }
  };

  //const startDownload = (format) => {
  // const url = urlInput.value;
  //const itagSelect = document.querySelector("#itagSelect");
  //    const itag = itagSelect ? itagSelect.value : "";

  //  if (!url) {
  //  statusDiv.innerText = "❌ Please enter a valid URL";
  //     statusDiv.style.color = "#FF4444";
  //   return;
  // }

  //if (itagSelect) {
  //  const selectedOption = itagSelect.options[itagSelect.selectedIndex];
  //   const selType = selectedOption ? selectedOption.dataset.type : null;
  // if (format === "mp4" && selType === "audio") {
  // statusDiv.innerText =
  //   "❌ Selected quality is audio-only; choose MP3 or select a video quality.";
  //statusDiv.style.color = "#FF4444";
  // return;
  // }
  //} else {
  // no formats available: allow mp3, block mp4
  //if (format === "mp4") {
  //statusDiv.innerText = "❌ MP4 not available for this video.";
  //statusDiv.style.color = "#FF4444";
  //return;
  //  }
  //}

  //window.location.href = `http://localhost:5000/download?url=${encodeURIComponent(url)}&format=${format}&itag=${itag}`;
  // };

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
