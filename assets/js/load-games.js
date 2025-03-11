async function fetchJson(url) {
  try {
    let response = await fetch(url);
    if (!response.ok) throw new Error(`Gagal memuat ${url}`);
    let data = await response.json();
    console.log(`Data berhasil diambil dari ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`Error mengambil ${url}:`, error);
    return null;
  }
}

async function checkAccess() {
  if (sessionStorage.getItem("redirected")) return;

  let [auth1, auth2, validHashes] = await Promise.all([
    fetchJson("auth1.json"),
    fetchJson("auth2.json"),
    fetchJson("validHashes.json")
  ]);

  if (!auth1 || !auth2 || !validHashes) return;

  let expectedHash = await hashSHA256(auth1.key + auth2.key + window.location.hostname);
  console.log("Expected Hash:", expectedHash);
  console.log("Valid Hashes:", validHashes);

  if (!validHashes.includes(expectedHash)) {
    sessionStorage.setItem("redirected", "true");
    setTimeout(() => {
      window.location.href = "https://newsus.github.io";
    }, 500);
  }
}

async function hashSHA256(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  await checkAccess();
  window.addEventListener("scroll", handleScroll);
});

function handleScroll() {
  console.log("Scroll event triggered");
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 600) {
    console.log("Memuat lebih banyak kartu...");
    loadMoreCards();
  }
  revealCards();
}

async function loadMoreCards() {
  let gamesData = await fetchJson("/data-json/games.json");
  if (!gamesData) return;

  console.log("Menambahkan game cards...");
  gamesData.forEach(game => {
    let card = document.createElement("div");
    card.classList.add("game-card");
    card.innerHTML = `<h3>${game.name}</h3><p>${game.description}</p>`;
    document.getElementById("game-container").appendChild(card);
  });
}

if (!window.adsbygoogle) {
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
  document.head.appendChild(script);
}
