export const initLogic = () => {
  const urlInput = document.querySelector("#videoUrl");
  const statusDiv = document.querySelector("#status");
  const btnColar = document.querySelector("#btnColar");

  const startDownload = (format) => {
    const url = urlInput.value;
    if (!url) {
      statusDiv.innerText = "❌ Please enter a valid URL";
      statusDiv.style.color = "#FF4444";
      return;
    }
    statusDiv.innerText = `⌛ Preparing ${format.toUpperCase()}...`;
    statusDiv.style.color = "#00EAFF";

    // Relacionando com seu server.js na porta 5000
    window.location.href = `http://localhost:5000/download?url=${encodeURIComponent(url)}&format=${format}`;
  };

  // Listeners
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
      setTimeout(() => (btnColar.innerText = "Paste"), 1000);
    } catch (err) {
      btnColar.innerText = "❌ Error";
    }
  });
};
