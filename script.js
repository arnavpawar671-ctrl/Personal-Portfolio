/* =========================================================
   ARNAV PORTFOLIO
   INTERACTION ENGINE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       CURRENT YEAR
       ========================= */

    const year = document.getElementById("year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }


    /* =========================
       REDUCED MOTION
       ========================= */

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    /* =========================
       HERO ENTRANCE
       ========================= */

    if (!reducedMotion) {

        const heroElements = document.querySelectorAll(
            ".hero-eyebrow, .hero h1, .hero-description, .hero-actions"
        );

        heroElements.forEach((element, index) => {

            element.style.opacity = "0";
            element.style.transform = "translateY(20px)";

            setTimeout(() => {

                element.style.transition =
                    "opacity 0.7s ease, transform 0.7s ease";

                element.style.opacity = "1";
                element.style.transform = "translateY(0)";

            }, 150 + index * 120);

        });

    }


    /* =========================
       SCROLL REVEAL
       ========================= */

    const revealElements = document.querySelectorAll(
        ".section-heading, .about-grid, .skill-card, .timeline-item, .contact-content"
    );

    if (reducedMotion) {

        revealElements.forEach((element) => {
            element.style.opacity = "1";
            element.style.transform = "none";
        });

    } else {

        const revealObserver = new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";

                    revealObserver.unobserve(entry.target);

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -50px 0px"
            }
        );


        revealElements.forEach((element) => {

            element.style.opacity = "0";
            element.style.transform = "translateY(25px)";

            element.style.transition =
                "opacity 0.7s ease, transform 0.7s ease";

            revealObserver.observe(element);

        });

    }


    /* =========================
       ACTIVE NAVIGATION
       ========================= */

    const sections = document.querySelectorAll(
        "main section[id]"
    );

    const navLinks = document.querySelectorAll(
        ".nav-links a"
    );


    const navObserver = new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (!entry.isIntersecting) {
                    return;
                }

                const currentId =
                    entry.target.getAttribute("id");

                navLinks.forEach((link) => {

                    link.classList.remove("active");

                    if (
                        link.getAttribute("href") ===
                        `#${currentId}`
                    ) {
                        link.classList.add("active");
                    }

                });

            });

        },
        {
            threshold: 0.45
        }
    );


    sections.forEach((section) => {
        navObserver.observe(section);
    });


    /* =========================
       SMOOTH NAVIGATION
       ========================= */

    navLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId =
                link.getAttribute("href");

            if (!targetId.startsWith("#")) {
                return;
            }

            const target =
                document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: reducedMotion ? "auto" : "smooth",
                block: "start"
            });

        });

    });


    /* =========================
       GITHUB PROJECTS
       ========================= */

    const username = "arnavpawar671-ctrl";

    const projectsGrid =
        document.getElementById("projects-grid");

    const repoCount =
        document.getElementById("repo-count");

    const projectFilter =
        document.getElementById("project-filter");

    let repositories = [];


    async function loadRepositories() {

        try {

            let page = 1;
            let allRepos = [];

            while (true) {

                const response = await fetch(
                    `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=updated`
                );

                if (!response.ok) {
                    throw new Error(
                        `GitHub API error: ${response.status}`
                    );
                }

                const repos = await response.json();

                allRepos.push(...repos);

                if (repos.length < 100) {
                    break;
                }

                page++;

            }

            repositories = allRepos;

            renderRepositories(repositories);

        } catch (error) {

            console.error(
                "Could not load GitHub repositories:",
                error
            );

            projectsGrid.innerHTML = `
                <div class="projects-error">
                    <h3>Couldn't load projects</h3>
                    <p>
                        GitHub couldn't be reached right now.
                        You can still view all repositories directly.
                    </p>

                    <a
                        href="https://github.com/${username}?tab=repositories"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn btn-secondary"
                    >
                        Open GitHub ↗
                    </a>
                </div>
            `;

        }

    }


    function getLanguageClass(language) {

        if (!language) {
            return "other";
        }

        const value =
            language.toLowerCase();

        if (
            value === "html" ||
            value === "css" ||
            value === "javascript" ||
            value === "typescript" ||
            value === "python" ||
            value === "java" ||
            value === "c++"
        ) {
            return value;
        }

        return "other";
    }


    function renderRepositories(repos) {

        if (!projectsGrid) {
            return;
        }

        repoCount.textContent = repos.length;


        if (repos.length === 0) {

            projectsGrid.innerHTML = `
                <div class="projects-error">
                    <h3>No repositories found.</h3>
                </div>
            `;

            return;
        }


        projectsGrid.innerHTML = repos.map(
            (repo, index) => {

                const language =
                    repo.language || "Various";

                const description =
                    repo.description ||
                    "A project or experiment built by Arnav.";


                return `
                    <article class="project-card">

                        <div class="project-number">
                            ${String(index + 1).padStart(2, "0")}
                        </div>

                        <div class="project-content">

                            <p class="project-type">
                                ${language.toUpperCase()}
                            </p>

                            <h3>
                                ${escapeHTML(repo.name)}
                            </h3>

                            <p>
                                ${escapeHTML(description)}
                            </p>

                            <div class="project-tech">

                                <span>
                                    ${escapeHTML(language)}
                                </span>

                                ${
                                    repo.stargazers_count > 0
                                        ? `<span>★ ${repo.stargazers_count}</span>`
                                        : ""
                                }

                                ${
                                    repo.forks_count > 0
                                        ? `<span>⑂ ${repo.forks_count}</span>`
                                        : ""
                                }

                            </div>

                            <a
                                href="${repo.html_url}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="project-link"
                            >
                                View on GitHub ↗
                            </a>

                        </div>

                    </article>
                `;

            }
        ).join("");


        /* Reveal newly-created cards */

        if (!reducedMotion) {

            const cards =
                projectsGrid.querySelectorAll(
                    ".project-card"
                );

            cards.forEach((card, index) => {

                card.style.opacity = "0";
                card.style.transform =
                    "translateY(25px)";

                setTimeout(() => {

                    card.style.transition =
                        "opacity 0.6s ease, transform 0.6s ease";

                    card.style.opacity = "1";
                    card.style.transform =
                        "translateY(0)";

                }, index * 60);

            });

        }

    }


    function escapeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent = value ?? "";

        return div.innerHTML;

    }


    /* =========================
       PROJECT FILTER
       ========================= */

    if (projectFilter) {

        projectFilter.addEventListener(
            "change",
            () => {

                const selected =
                    projectFilter.value;

                if (selected === "all") {

                    renderRepositories(
                        repositories
                    );

                    return;

                }


                const filtered =
                    repositories.filter((repo) => {

                        const language =
                            getLanguageClass(
                                repo.language
                            );

                        return language === selected;

                    });


                renderRepositories(filtered);

            }
        );

    }


    loadRepositories();


    /* =========================
       PROJECT CARD TILT
       ========================= */

    if (!reducedMotion && window.innerWidth > 900) {

        document.addEventListener(
            "mousemove",
            (event) => {

                const card =
                    event.target.closest(
                        ".project-card"
                    );

                if (!card) {
                    return;
                }

                const rect =
                    card.getBoundingClientRect();

                const x =
                    event.clientX - rect.left;

                const y =
                    event.clientY - rect.top;

                const centerX =
                    rect.width / 2;

                const centerY =
                    rect.height / 2;

                const rotateX =
                    ((y - centerY) / centerY) * -2;

                const rotateY =
                    ((x - centerX) / centerX) * 2;

                card.style.transform =
                    `perspective(900px)
                     rotateX(${rotateX}deg)
                     rotateY(${rotateY}deg)
                     translateY(-8px)`;

            }
        );


        document.addEventListener(
            "mouseleave",
            () => {

                document
                    .querySelectorAll(".project-card")
                    .forEach((card) => {
                        card.style.transform = "";
                    });

            }
        );

    }

});