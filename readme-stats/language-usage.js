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

  const sorted = Object.entries(languageTotals)
    .map(([lang, bytes]) => ({
      lang,
      bytes,
      percent: (bytes / totalBytes) * 100
    }))
    .sort((a, b) => b.percent - a.percent);

  const visible = sorted.filter(item => item.percent >= 0.1);
  const hidden = sorted.filter(item => item.percent < 0.1);
  const othersTotal = hidden.reduce((acc, cur) => acc + cur.percent, 0);

  if (othersTotal > 0) {
    visible.push({ lang: "Others", percent: othersTotal });
  }

  const colors = {};
  visible.forEach((item, i) => {
    const hue = (i * 37) % 360;
    colors[item.lang] = `hsl(${hue}, 70%, 60%)`;
  });

  const bar = document.getElementById("bar");
  const legend = document.getElementById("legend");
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  document.body.appendChild(tooltip);

  // Render bar segments
  visible.forEach(item => {
    const div = document.createElement("div");
    div.className = "bar-segment";
    div.style.width = `${item.percent}%`;
    div.style.backgroundColor = colors[item.lang];

    div.addEventListener("mousemove", (e) => {
      tooltip.textContent = `${item.lang}: ${item.percent.toFixed(2)}%`;
      tooltip.style.left = `${e.pageX + 10}px`;
      tooltip.style.top = `${e.pageY + 10}px`;
      tooltip.style.opacity = 1;
    });

    div.addEventListener("mouseleave", () => {
      tooltip.style.opacity = 0;
    });

    bar.appendChild(div);
  });

  // Render legend table/grid
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
