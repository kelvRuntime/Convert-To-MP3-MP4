const formatFileName = (title) => {
  if (title == null || title === "") return "media_download";

  const cleaned = String(title)
    .replace(/[\u0000-\u001F\x7F]+/g, "")
    .replace(/["'%;\\]/g, "")
    .replace(/[^\w\s.-]/gi, "")
    .replace(/\.{2,}/g, ".")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[_\.]+|[_\.]+$/g, "")
    .trim()
    .substring(0, 100);

  return cleaned || "media_download";
};

module.exports = {
  formatFileName};
