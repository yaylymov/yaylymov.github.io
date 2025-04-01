const username = "yaylymov";
const apiURL = `https://api.github.com/users/${username}/repos?per_page=100`;

async function getLanguages() {
  const reposRes = await fetch(apiURL);
  const repos = await reposRes.json();

  const languageData = {};
  let totalBytes = 0;

  for (const repo of repos) {
    if (repo.fork) continue;

    const langRes = await fetch(repo.languages_url);
    const langJSON = await langRes.json();

    for (const [lang, bytes] of Object.entries(langJSON)) {
      languageData[lang] = (languageData[lang] || 0) + bytes;
      totalBytes += bytes;
    }
  }

  const sorted = Object.entries(languageData)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, bytes]) => ({
      lang,
      percent: ((bytes / totalBytes) * 100).toFixed(2)
    }));

  const container = document.getElementById("language-stats");
  container.innerHTML = "";

  sorted.forEach(item => {
    const block = document.createElement("div");
    block.className = "language-block";
    block.innerHTML = `
      <div class="label">${item.lang}: ${item.percent}%</div>
      <div class="bar" style="width:${item.percent}%"></div>
    `;
    container.appendChild(block);
  });
}

getLanguages();
