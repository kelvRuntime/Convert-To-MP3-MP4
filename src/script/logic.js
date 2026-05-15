export const initLogic = () => {
  const urlInput = document.querySelector("#videoUrl");
  const statusDiv = document.querySelector("#status");
  const btnColar = document.querySelector("#btnColar");
  const API_URL = "";

  let playlistState = {
    url: "",
    title: "",
    items: [],
    nextOffset: null,
    totalItems: 0,
  };

  const triggerDownload = (downloadPath) => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = `${API_URL}${downloadPath}`;
    document.body.appendChild(iframe);
    setTimeout(() => iframe.remove(), 60000);
  };

  const createPlaylistItem = (item) => {
    const label = document.createElement("label");
    label.className = "playlist-item";

    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "playlist-check";
    check.value = item.id;
    check.dataset.url = item.url;
    check.dataset.title = item.title;

    const img = document.createElement("img");
    img.className = "playlist-thumb";
    img.alt = "";
    img.src = item.thumbnail;
    img.onerror = () => {
      img.src = "https://placehold.co/120x68?text=?";
    };

    const title = document.createElement("span");
    title.className = "playlist-item-title";
    title.textContent = item.title;

    label.append(check, img, title);
    return label;
  };

  const appendPlaylistItems = (container, items) => {
    const fragment = document.createDocumentFragment();
    items.forEach((item) => fragment.appendChild(createPlaylistItem(item)));
    container.appendChild(fragment);
  };

  const updateLoadMore = (loaded, totalItems, nextOffset) => {
    const wrap = statusDiv.querySelector("#loadMoreWrap");
    if (!wrap) return;

    if (nextOffset != null) {
      wrap.innerHTML = `<button type="button" id="loadMoreBtn" class="btn-load-more">
        Ver mais (${loaded}/${totalItems})
      </button>`;
    } else {
      wrap.innerHTML = `<p class="playlist-end">Todos os ${totalItems} vídeos carregados.</p>`;
    }
  };

  const renderVideoPreview = (url, data) => {
    const allFormats = data.formats || [];

    statusDiv.innerHTML = `
      <div class="preview-card">
        <div class="card-header">
          <img src="${data.thumbnail}"
            class="preview-thumb" alt="Thumbnail"
            onerror="this.src='https://placehold.co/600x400?text=no+Preview'"/>
          <div class="preview-info">
            <p class="preview-title">${data.title}</p>
            <p class="preview-author">${data.author}</p>
          </div>
        </div>
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
            <select id="itagSelect" class="pro-select"></select>
          </div>
          <button id="mainDownloadBtn" class="btn-download-pro">Download Media</button>
        </div>
      </div>
    `;

    const itagSelect = document.querySelector("#itagSelect");
    const formatSelect = document.querySelector("#formatSelect");

    const updateQualities = (format) => {
      if (format === "mp3") {
        itagSelect.innerHTML = `
          <option value="bestaudio">Extreme (320kbps)</option>
          <option value="140">High (128kbps)</option>
          <option value="139">Medium (48kbps)</option>`;
      } else {
        const videoOptions = allFormats
          .filter((f) => f.container === "mp4" && f.quality !== "unknown")
          .slice(0, 5)
          .map(
            (f) =>
              `<option value="${f.itag}">${f.quality} (High Quality)</option>`
          )
          .join("");

        itagSelect.innerHTML =
          videoOptions || `<option value="best">Best Available</option>`;
      }
    };

    updateQualities("mp4");
    formatSelect.addEventListener("change", (e) =>
      updateQualities(e.target.value)
    );

    document.querySelector("#mainDownloadBtn").addEventListener("click", () => {
      const format = formatSelect.value;
      const itag = itagSelect.value;
      statusDiv.insertAdjacentHTML(
        "beforeend",
        `<p class="download-status">⌛ Loading your ${format.toUpperCase()}…</p>`
      );

      const params = new URLSearchParams({
        url,
        format,
        itag,
        title: data.title,
      });
      triggerDownload(`/download?${params.toString()}`);
    });
  };

  const renderPlaylistShell = (data) => {
    statusDiv.innerHTML = `
      <div class="preview-card playlist-card">
        <div class="card-header">
          <div class="preview-info">
            <p class="preview-title">📋 ${data.title}</p>
            <p class="preview-author">${data.totalItems} vídeos · ${data.loaded} carregados</p>
          </div>
        </div>
        <div class="playlist-toolbar">
          <label class="select-all-label">
            <input type="checkbox" id="selectAllPlaylist" /> Selecionar página
          </label>
          <div class="select-group">
            <label>Format</label>
            <select id="playlistFormat" class="pro-select">
              <option value="mp4">MP4 (Video)</option>
              <option value="mp3">MP3 (Audio)</option>
            </select>
          </div>
          <div class="select-group" id="playlistItagGroup" style="display:none">
            <label>Quality</label>
            <select id="playlistItag" class="pro-select">
              <option value="bestaudio">Extreme (320kbps)</option>
              <option value="140">High (128kbps)</option>
            </select>
          </div>
        </div>
        <div id="playlistItems" class="playlist-list"></div>
        <div id="loadMoreWrap"></div>
        <button type="button" id="batchDownloadBtn" class="btn-download-pro">
          Download selecionados
        </button>
        <p id="playlistDownloadStatus" class="download-status"></p>
      </div>
    `;
  };

  const renderPlaylistPreview = (data, append = false) => {
    if (!append) {
      playlistState.items = [];
    }
    playlistState.items.push(...data.items);
    playlistState.nextOffset = data.nextOffset;
    playlistState.totalItems = data.totalItems;
    playlistState.title = data.title;

    const loaded = playlistState.items.length;

    if (append) {
      const list = statusDiv.querySelector("#playlistItems");
      if (list) appendPlaylistItems(list, data.items);

      const authorEl = statusDiv.querySelector(".preview-author");
      if (authorEl) {
        authorEl.textContent = `${data.totalItems} vídeos · ${loaded} carregados`;
      }
      updateLoadMore(loaded, data.totalItems, data.nextOffset);
      return;
    }

    renderPlaylistShell({ title: data.title, totalItems: data.totalItems, loaded });
    appendPlaylistItems(
      statusDiv.querySelector("#playlistItems"),
      data.items
    );
    updateLoadMore(loaded, data.totalItems, data.nextOffset);
  };

  statusDiv.addEventListener("click", async (e) => {
    if (e.target.id === "loadMoreBtn" && playlistState.nextOffset != null) {
      fetchPreview(playlistState.url, playlistState.nextOffset, true);
      return;
    }

    if (e.target.id !== "batchDownloadBtn") return;

    const selected = [...statusDiv.querySelectorAll(".playlist-check")]
      .filter((cb) => cb.checked)
      .map((cb) => ({
        id: cb.value,
        url: cb.dataset.url,
        title: cb.dataset.title,
      }));

    if (selected.length === 0) {
      alert("Select at least one video.");
      return;
    }

    const format = statusDiv.querySelector("#playlistFormat")?.value;
    const itag =
      format === "mp3"
        ? statusDiv.querySelector("#playlistItag")?.value
        : "best";

    const statusEl = statusDiv.querySelector("#playlistDownloadStatus");
    if (statusEl) statusEl.textContent = `⌛ Starting ${selected.length} download(s)…`;

    try {
      const res = await fetch(`${API_URL}/download/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: selected, format, itag }),
      });
      const { downloads, error } = await res.json();
      if (error) throw new Error(error);

      downloads.forEach((dl, i) => {
        setTimeout(() => triggerDownload(dl.url), i * 2000);
      });

      if (statusEl) {
        statusEl.textContent = `✅ ${downloads.length} download(s) queued.`;
      }
    } catch (err) {
      if (statusEl) statusEl.textContent = `❌ ${err.message}`;
    }
  });

  statusDiv.addEventListener("change", (e) => {
    if (e.target.id === "selectAllPlaylist") {
      statusDiv.querySelectorAll(".playlist-check").forEach((cb) => {
        cb.checked = e.target.checked;
      });
    }
    if (e.target.id === "playlistFormat") {
      const itagGroup = statusDiv.querySelector("#playlistItagGroup");
      if (itagGroup) {
        itagGroup.style.display = e.target.value === "mp3" ? "flex" : "none";
      }
    }
  });

  const fetchPreview = async (url, offset = 0, append = false) => {
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) return;

    if (!append) {
      statusDiv.innerHTML = "⌛ Loading Preview…";
      statusDiv.style.color = "#8b949e";
      playlistState = {
        url,
        title: "",
        items: [],
        nextOffset: null,
        totalItems: 0,
      };
    } else {
      const btn = document.querySelector("#loadMoreBtn");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "⌛ Carregando…";
      }
      playlistState.url = url;
    }

    try {
      const params = new URLSearchParams({ url });
      if (offset > 0) params.set("offset", String(offset));

      const response = await fetch(`${API_URL}/info?${params}`);
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      if (data.type === "playlist") {
        renderPlaylistPreview(data, append);
        return;
      }

      renderVideoPreview(url, data);
    } catch (err) {
      console.error("Preview fetch error:", err);
      statusDiv.innerText = `❌ Preview failed: ${err.message}`;
      const btn = document.querySelector("#loadMoreBtn");
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Ver mais";
      }
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
