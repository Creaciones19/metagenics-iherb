const categories = ["Todos", ...new Set(PRODUCTS.map((p) => p.category))];
let active = "Todos",
  currentProduct = null;
const grid = document.querySelector("#grid"),
  search = document.querySelector("#search"),
  chips = document.querySelector("#chips"),
  count = document.querySelector("#count"),
  modal = document.querySelector("#modal");
const money = (n) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);
function renderChips() {
  chips.innerHTML = categories
    .map(
      (c) =>
        '<button class="chip ' +
        (c === active ? "active" : "") +
        '" data-cat="' +
        c +
        '">' +
        c +
        "</button>",
    )
    .join("");
}
function render() {
  const q = search.value.toLowerCase().trim();
  const list = PRODUCTS.filter(
    (p) =>
      (active === "Todos" || p.category === active) &&
      (p.name.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)),
  );
  count.textContent = list.length + " productos encontrados";
  grid.innerHTML = list
    .map(
      (p) =>
        '<article class="card"><div class="photo"><span class="tag">' +
        p.category +
        '</span><img loading="lazy" src="' +
        p.image +
        '" alt="' +
        p.name +
        '"></div><div class="body"><div class="brandname">' +
        p.brand +
        "</div><h3>" +
        p.name +
        '</h3><p class="summary">' +
        p.summary +
        '</p><div class="meta">' +
        p.presentation +
        '</div><div class="price">' +
        money(p.price) +
        '</div><div class="cardactions"><button class="detail" data-id="' +
        p.id +
        '">Ver ficha completa</button><a class="wa" target="_blank" href="https://wa.me/523343340062?text=' +
        encodeURIComponent(
          "Hola, quiero comprar " + p.name + " de " + money(p.price),
        ) +
        '">Comprar</a></div></div></article>',
    )
    .join("");
}
function updateWhats() {
  if (!currentProduct) return;
  const qty = document.querySelector("#modalQty").value,
    total = currentProduct.price * qty;
  document.querySelector("#modalWhats").href =
    "https://wa.me/523343340062?text=" +
    encodeURIComponent(
      "Hola, quiero comprar " +
        qty +
        " pieza(s) de " +
        currentProduct.name +
        ". Precio unitario: " +
        money(currentProduct.price) +
        ". Total: " +
        money(total),
    );
}
function openProduct(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  currentProduct = p;
  document.querySelector("#modalImage").src = p.image;
  document.querySelector("#modalImage").alt = p.name;
  document.querySelector("#modalBrand").textContent = p.brand;
  document.querySelector("#modalTitle").textContent = p.name;
  document.querySelector("#modalSummary").textContent = p.summary;
  document.querySelector("#modalPresentation").textContent =
    "Presentación: " + p.presentation;
  document.querySelector("#modalPrice").textContent = money(p.price);
  document.querySelector("#modalDetail").textContent = p.detail;
  document.querySelector("#modalQty").value = "1";
  document.querySelector("#modalThumbs").innerHTML = p.gallery
    .map(
      (src, i) =>
        '<button type="button" data-src="' +
        src +
        '" aria-label="Ver imagen ' +
        (i + 1) +
        '"><img src="' +
        src +
        '" alt=""></button>',
    )
    .join("");
  updateWhats();
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  modal.classList.remove("open");
  document.body.style.overflow = "";
}
chips.addEventListener("click", (e) => {
  if (!e.target.dataset.cat) return;
  active = e.target.dataset.cat;
  renderChips();
  render();
});
grid.addEventListener("click", (e) => {
  const b = e.target.closest(".detail");
  if (b) openProduct(+b.dataset.id);
});
document.querySelector("#modalThumbs").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (b) document.querySelector("#modalImage").src = b.dataset.src;
});
document.querySelector("#modalQty").addEventListener("change", updateWhats);
search.addEventListener("input", render);
document.querySelector(".close").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
renderChips();
render();
