// Typing effect
const TYPE_TARGET = document.getElementById('type');
const WORDS = ['beautiful interfaces.', 'accessible products.', 'micro-interactions.'];
let wIndex = 0; let chIndex = 0; let deleting = false;

function tick(){
  const word = WORDS[wIndex];
  if(!deleting){
    TYPE_TARGET.textContent = word.slice(0, ++chIndex);
    if(chIndex === word.length){deleting = true; setTimeout(tick,1200); return}
  } else {
    TYPE_TARGET.textContent = word.slice(0, --chIndex);
    if(chIndex === 0){deleting = false; wIndex = (wIndex+1)%WORDS.length}
  }
  setTimeout(tick, deleting ? 60 : 90);
}
if(TYPE_TARGET) tick();

// Reveal on scroll
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting) e.target.classList.add('visible');
  });
},{threshold:0.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Try to play background video; if playback is blocked, fall back to animated background
const BG_VIDEO = document.getElementById('bg-video');
if(BG_VIDEO){
  BG_VIDEO.play().catch(()=>{
    document.body.classList.add('no-video');
  });
  // if video can play, reduce blur overlay so video is visible
  BG_VIDEO.addEventListener('playing', ()=>{
    document.querySelector('.animated-bg').style.filter = 'blur(18px)';
  });
}

// Fetch and render GitHub profile + repos
async function renderGitHub(username='arnavpawar671-ctrl'){
  try{
    // caching in localStorage for 15 minutes
    const cacheKey = `gh:${username}`;
    const cached = localStorage.getItem(cacheKey);
    let profile, repos;
    if(cached){
      try{const obj = JSON.parse(cached); if(Date.now()-obj.t < 1000*60*15){profile=obj.profile; repos=obj.repos;}}
      catch(e){/* ignore */}
    }
    if(!profile){
      const [profileRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100`)
      ]);
      if(!profileRes.ok || !reposRes.ok) throw new Error('GitHub API error');
      profile = await profileRes.json();
      repos = await reposRes.json();
      try{localStorage.setItem(cacheKey, JSON.stringify({t:Date.now(), profile, repos}));}catch(e){}
    }
    repos = repos.sort((a,b)=> new Date(b.pushed_at) - new Date(a.pushed_at));

    const prof = document.getElementById('gh-profile');
    prof.innerHTML = `
      <img src="${profile.avatar_url}" alt="${profile.login} avatar">
      <div class="gh-meta">
        <h4>${profile.name || profile.login}</h4>
        <div class="gh-meta-desc">${profile.bio || ''}</div>
        <div class="gh-stats">
          <div class="gh-stat">Repos: ${profile.public_repos}</div>
          <div class="gh-stat">Followers: ${profile.followers}</div>
          <div class="gh-stat">Following: ${profile.following}</div>
        </div>
        <div style="margin-top:.6rem" class="gh-meta-links">
          ${profile.html_url?`<a class="link" href="${profile.html_url}" target="_blank" rel="noopener">View GitHub</a>`:''}
          ${profile.blog?` <a class="link" href="${profile.blog}" target="_blank" rel="noopener">Website</a>`:''}
        </div>
      </div>`;

    const repoList = document.getElementById('repo-list');
    repoList.innerHTML = '';
    repos.forEach(r=>{
      const div = document.createElement('article');
      div.className = 'card repo-card reveal';
      div.innerHTML = `
        <div class="card-body">
          <h4>${r.name}</h4>
          <div class="repo-meta">
            ${r.language?`<span class="repo-language" title="${r.language}"></span><span>${r.language}</span>`:''}
            <span>★ ${r.stargazers_count}</span>
            <span>•</span>
            <span>Updated ${new Date(r.pushed_at).toLocaleDateString()}</span>
          </div>
          <p style="margin-top:.6rem;color:var(--muted)">${r.description || ''}</p>
          <div class="repo-actions">
            <a class="link" href="${r.html_url}" target="_blank" rel="noopener">Repository</a>
            ${r.homepage?`<a class="link" href="${r.homepage}" target="_blank" rel="noopener">Demo</a>`:''}
            <button type="button" class="btn ghost md-open" data-repo="${r.name}">Details</button>
            <button type="button" class="btn ghost copy-clone" data-clone="${r.clone_url}">Copy Clone</button>
          </div>
        </div>`;
      repoList.appendChild(div);
      observer.observe(div);
    });
    attachRepoControls();
  }catch(err){
    const repoList = document.getElementById('repo-list');
    if(repoList) repoList.innerHTML = '<p class="gh-meta">Could not load GitHub data. Try again later.</p>';
    console.warn(err);
  }
}

renderGitHub();

// Repo filter controls
const filterInput = document.getElementById('repo-filter');
const clearFilter = document.getElementById('clear-filter');
if(filterInput){
  filterInput.addEventListener('input', ()=>{
    const q = filterInput.value.trim().toLowerCase();
    document.querySelectorAll('#repo-list .card').forEach(c=>{
      const text = c.innerText.toLowerCase();
      c.style.display = text.includes(q) ? '' : 'none';
    });
  });
}
if(clearFilter){clearFilter.addEventListener('click', ()=>{filterInput.value='';filterInput.dispatchEvent(new Event('input'));});}

// Modal & details
const mdModal = document.getElementById('md-modal');
const mdContent = document.getElementById('md-content');
const mdClose = document.getElementById('md-close');
mdClose && mdClose.addEventListener('click', ()=>{mdModal.classList.remove('open'); mdModal.setAttribute('aria-hidden','true'); mdContent.innerHTML='';});

function attachRepoControls(){
  document.querySelectorAll('.md-open').forEach(btn=>{
    if(btn.dataset._attached) return; btn.dataset._attached = '1';
    btn.addEventListener('click', async ()=>{
      const repo = btn.dataset.repo;
      mdContent.innerHTML = 'Loading README...';
      mdModal.classList.add('open'); mdModal.setAttribute('aria-hidden','false');
      try{
        const username = 'arnavpawar671-ctrl';
        // try to fetch rendered HTML of README
        const res = await fetch(`https://api.github.com/repos/${username}/${repo}/readme`, {headers:{Accept:'application/vnd.github.v3.html+json'}});
        if(res.ok){
          const html = await res.text();
          mdContent.innerHTML = html || 'No README available.';
        } else {
          mdContent.innerText = 'No README available.';
        }
      }catch(e){ mdContent.innerText = 'Error loading README.' }
    });
  });

  document.querySelectorAll('.copy-clone').forEach(btn=>{
    if(btn.dataset._attached) return; btn.dataset._attached='1';
    btn.addEventListener('click', ()=>{
      const url = btn.dataset.clone;
      navigator.clipboard?.writeText(url).then(()=>{btn.textContent='Copied!'; setTimeout(()=>btn.textContent='Copy Clone',1200)}).catch(()=>{alert('Copy failed — manually copy: '+url)});
    });
  });
}
