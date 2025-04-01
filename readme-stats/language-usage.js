// language-usage.js
const GITHUB_USERNAME = "yaylymov"; 

async function fetchLanguages() {
  const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`);
  const repos = await response.json();

  const languageTotals = {};
  let totalBytes = 0;

  for (const repo of repos) {
    if (repo.fork) continue; // skip forks
    const langResponse = await fetch(repo.languages_url);
    const langData = await langResponse.json();

    for (const [lang, bytes] of Object.entries(langData)) {
      languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
      totalBytes += bytes;
    }
  }

  const sortedLanguages = Object.entries(languageTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([lang, bytes]) => ({
      name: lang,
      percentage: ((bytes / totalBytes) * 100).toFixed(2)
    }));

  const container = document.getElementById("language-stats");
  sortedLanguages.forEach(lang => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${lang.name}:</strong> ${lang.percentage}%<br>
      <div style="background:#eee;height:10px;width:100%;border-radius:5px;overflow:hidden;margin-bottom:10px;">
        <div style="background:#4c8eda;width:${lang.percentage}%;height:100%;"></div>
      </div>
    `;
    container.appendChild(div);
  });
}

fetchLanguages();
