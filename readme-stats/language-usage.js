const username = "yaylymov";
const apiURL = `https://api.github.com/users/${username}/repos?per_page=100`;

async function getLanguageStats() {
  const reposRes = await fetch(apiURL);
  const repos = await reposRes.json();

  const languageTotals = {};
  let totalBytes = 0;

  for (const repo of repos) {
    if (repo.fork) continue;

    const langRes = await fetch(repo.languages_url);
    const langData = await langRes.json();

    for (const [lang, bytes] of Object.entries(langData)) {
      languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
      totalBytes += bytes;
    }
  }

  // Convert to array and sort
  const sorted = Object.entries(languageTotals)
    .map(([lang, bytes]) => ({
      lang,
      bytes,
      percent: (bytes / totalBytes) * 100
    }))
    .sort((a, b) => b.percent - a.percent);

  // Group languages under 0.1% into "Others"
  const visible = sorted.filter(item => item.percent >= 0.1);
  const others = sorted.filter(item => item.percent < 0.1);
  const otherTotal = others.reduce((acc, cur) => acc + cur.percent, 0);

  if (otherTotal > 0) {
    visible.push({ lang: "Others", percent: otherTotal });
  }

  // Generate color palette (just cycling hues)
  const colors = {};
  visible.forEach((item, i) => {
    const hue = (i * 47) % 360; // Spread hues
    colors[item.lang] = `hsl(${hue}, 70%, 60%)`;
  });

  // Render bar
  const bar = document.getElementById("bar");
  visible.forEach(item => {
    const div = document.createElement("div");
    div.className = "bar-segment";
    div.style.width = `${item.percent.toFixed(2)}%`;
    div.style.backgroundColor = colors[item.lang];
    bar.appendChild(div);
  });

  // Render legend
  const legend = document.getElementById("legend");
  legend.innerHTML = "";
  visible.forEach(item => {
    const entry = document.createElement("div");
    entry.className = "legend-item";
    entry.innerHTML = `
      <span class="legend-color" style="background:${colors[item.lang]}"></span>
      ${item.lang} (${item.percent.toFixed(2)}%)
    `;
    legend.appendChild(entry);
  });
}

getLanguageStats();
