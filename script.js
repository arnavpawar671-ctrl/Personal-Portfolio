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

    const heroElements = document.querySelectorAll(
        ".hero-eyebrow, .hero h1, .hero-description, .hero-actions"
    );

    if (!reducedMotion) {
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
        ".section-heading, .about-grid, .skill-card, .project-card, .timeline-item, .contact-content"
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

            element.style.transform =
                "translateY(25px)";

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
                behavior:
                    reducedMotion
                        ? "auto"
                        : "smooth",
                block: "start"
            });

        });

    });


    /* =========================
       CURSOR GLOW
       ========================= */

    if (!reducedMotion && window.innerWidth > 800) {

        const glow = document.createElement("div");

        glow.className = "cursor-glow";

        document.body.appendChild(glow);


        document.addEventListener(
            "mousemove",
            (event) => {

                glow.style.left =
                    `${event.clientX}px`;

                glow.style.top =
                    `${event.clientY}px`;

            }
        );

    }


    /* =========================
       PROJECT CARD TILT
       ========================= */

    if (!reducedMotion && window.innerWidth > 900) {

        const cards =
            document.querySelectorAll(
                ".project-card"
            );


        cards.forEach((card) => {

            card.addEventListener(
                "mousemove",
                (event) => {

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
                        ((y - centerY) /
                            centerY) * -2;

                    const rotateY =
                        ((x - centerX) /
                            centerX) * 2;


                    card.style.transform =
                        `perspective(900px)
                         rotateX(${rotateX}deg)
                         rotateY(${rotateY}deg)
                         translateY(-8px)`;

                }
            );


            card.addEventListener(
                "mouseleave",
                () => {

                    card.style.transform =
                        "";

                }
            );

        });

    }

});
