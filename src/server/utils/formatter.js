const formatFileName = (title) => {
  return title.replace(/[^\w\s-]/gi, "").trim();
};

module.exports = {
  formatFileName,
};
