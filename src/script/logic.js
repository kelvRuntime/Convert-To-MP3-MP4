

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
      console.log(`The data: ${data}`);

      if (data.error) throw new error(data.error);

      statusDiv.innerHTML = ` <div class="preview-card">
          <img src="${data.thumbnail}" 
          class="preview-thumb" alt="Thumbnail"/>
          <div class="preview-info">
            <p class="preview-title">${data.title}</p>
            <p class="preview-author">👤${data.author}</p>
          </div>
        </div>
        `;
    } catch (err) {
      statusDiv.innerText = "❌ It not Posivel show the preview.";
    }
  };

  urlInput.addEventListener("input", (e) => fetchPreview(e.target.value));

  const startDownload = (format) => {
    const url = urlInput.value;
    if (!url) {
      statusDiv.innerText = "❌ Please enter a valid URL";
      statusDiv.style.color = "#FF4444";
      return;
    }
    statusDiv.innerText = `⌛ Preparing ${format.toUpperCase()}...`;
    statusDiv.style.color = "#00EAFF";

    window.location.href = `http://localhost:5000/download?url=${encodeURIComponent(url)}&format=${format}`;
  };

  
  document
    .querySelector("#downloadMP3")
    .addEventListener("click", () => startDownload("mp3"));
  document
    .querySelector("#downloadMP4")
    .addEventListener("click", () => startDownload("mp4"));

  btnColar.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      urlInput.value = text;
      btnColar.innerText = "✅ Pasted!";
      fetchPreview(text);
      
    } catch (err) {
      btnColar.innerText = "❌ Error";
    }
  });
};
