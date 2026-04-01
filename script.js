const repoContainer = document.getElementById("repo-container");
const repoDateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const repoNumberFormatter = new Intl.NumberFormat("en");
const htmlEscapes = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function renderLoadingCards() {
  repoContainer.innerHTML = "";

  for (let index = 0; index < 6; index += 1) {
    const card = document.createElement("article");
    card.className = "project skeleton";
    card.setAttribute("aria-hidden", "true");
    card.innerHTML = `
      <div class="skeleton-top">
        <div class="skeleton-pill"></div>
        <div class="skeleton-pill"></div>
      </div>
      <div class="skeleton-content">
        <div class="skeleton-line medium"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
      <div class="skeleton-footer">
        <div class="skeleton-pill"></div>
        <div class="skeleton-pill"></div>
      </div>
    `;
    repoContainer.appendChild(card);
  }
}

function createEmptyState(title, description) {
  repoContainer.innerHTML = `
    <article class="project project-empty">
      <h3>${title}</h3>
      <p>${description}</p>
    </article>
  `;
}

function formatRepoDate(dateString) {
  return repoDateFormatter.format(new Date(dateString));
}

function formatRepoCount(count) {
  return repoNumberFormatter.format(count);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => htmlEscapes[character]);
}

function buildProjectCard(repo) {
  const article = document.createElement("article");
  const language = escapeHtml(repo.language || "Repository");
  const description = escapeHtml(
    repo.description || "No description available yet."
  );
  const name = escapeHtml(repo.name);
  const url = escapeHtml(repo.html_url);

  article.className = "project";
  article.innerHTML = `
    <div class="project-top">
      <span class="project-tag">${language}</span>
      <span class="project-updated">Updated ${formatRepoDate(repo.pushed_at)}</span>
    </div>
    <h3>${name}</h3>
    <p>${description}</p>
    <div class="project-metrics">
      <span>Stars ${formatRepoCount(repo.stargazers_count)}</span>
      <span>Forks ${formatRepoCount(repo.forks_count)}</span>
    </div>
    <a
      class="project-link"
      href="${url}"
      target="_blank"
      rel="noreferrer"
    >View Repository</a>
  `;

  return article;
}

async function loadRepos() {
  renderLoadingCards();

  try {
    const response = await fetch(
      "https://api.github.com/users/bachoai/repos?sort=updated&per_page=12"
    );

    if (!response.ok) {
      throw new Error("Unable to load repositories");
    }

    const repos = await response.json();
    const featuredRepos = repos.filter((repo) => !repo.fork).slice(0, 6);

    repoContainer.innerHTML = "";

    if (featuredRepos.length === 0) {
      createEmptyState(
        "Projects are on the way",
        "No public repositories are available to display right now."
      );
      return;
    }

    featuredRepos.forEach((repo) => {
      repoContainer.appendChild(buildProjectCard(repo));
    });
  } catch (error) {
    createEmptyState(
      "GitHub feed unavailable",
      "The repository list could not be loaded at the moment. Please try again later."
    );
    console.error(error);
  }
}

loadRepos();
