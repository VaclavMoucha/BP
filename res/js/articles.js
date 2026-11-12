function getLang() {
  return localStorage.getItem("lang") || "cs";
}
function formatDate(date) {
  return new Date(date).toLocaleDateString(
    getLang() === "cs" ? "cs-CZ" : "en-US",
  );
}
function shorten(text, max = 155) {
  if (!text || text.length <= max) return text || "";
  return text.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

function setMeta(title, description) {
  const suffix =
    getLang() === "cs"
      ? "Laboratoř bateriových systémů a emobility"
      : "Laboratory of Battery Systems and Emobility";
  document.title = `${title} | ${suffix}`;

  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.appendChild(meta);
  }
  meta.content = description;
}
function renderBlocksClient(blocks, fallback) {
  if (blocks && blocks.length != 0) {
    return blocks
      .map((block) => {
        if (block.type === "text")
          return `<p class ="article-block-text">${block.content}</p>`;
        if (block.type === "image")
          return `<img class="article-block-image" src="${block.content}" alt="Obrázek" loading="lazy">  `;
        return "";
      })
      .join("");
  }
  return fallback ? `<p class="article-block-text">${fallback}</p>` : "";
}
async function renderList() {
  const list = document.querySelector(".article-list");
  const lang = getLang();
  if (!list) return;
  if (list.children.length > 0 && getLang() === "cs") return;
  try {
    const res = await fetch("/api/articles");
    const articles = await res.json();
    list.innerHTML = articles
      .map(
        (article) => `
      <a href="/article/${article._id}" class="article-card">
        <img src="${article.img || "/img/placeholder.jpg"}" alt="${article["title_" + lang]}" loading="lazy" />
        <div class="article-info">
          <h2 data-cs="${article.title_cs}" data-en="${article.title_en}">${article["title_" + lang]}</h2>
          <span class="article-date">${formatDate(article.date)}</span>
          <p data-cs="${article.perex_cs}" data-en="${article.perex_en}">${article["perex_" + lang]}</p>
        </div>
      </a>
    `,
      )
      .join("");
  } catch (err) {
    console.warn("articles.js: fetch selhal", err);
  }
}
async function renderArticle(){
  const detail = document.querySelector(".article-detail");
  if (!detail) return;
  const lang = getLang();
  const id = window.location.pathname.split("/").pop();   
  if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) return;
  try {
    const res = await fetch(`/api/articles/${id}`);
    if (!res.ok) return;
    const article = await res.json();
    detail.innerHTML = `
    <h1 data-cs="${article.title_cs}" data-en="${article.title_en}">${article["title_" + lang]}</h1>
      <span class="article-date">${formatDate(article.date)}</span>
      <img src="${article.img || "/img/placeholder.jpg"}" alt="${article["title_" + lang]}" />
      <div class="article-content">
        ${renderBlocksClient(article["blocks_" + lang], article["content_" + lang])}
      </div>
    `;
    setMeta(article["title_" + lang], shorten(article["perex_" + lang]));
  } catch (err) {
    console.warn("articles.js: fetch selhal", err);
  }
}
renderList();
renderArticle();