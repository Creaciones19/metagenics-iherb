/* =========================================================
   CONFIGURACIÓN GENERAL
========================================================= */

const WHATSAPP_NUMBER = "523343340062";
const categories = [
  "Todos",
  ...new Set(PRODUCTS.map((product) => product.category)),
];

let activeCategory = "Todos";
let currentProduct = null;
let cart = JSON.parse(localStorage.getItem("catalogoCart") || "[]");

const grid = document.querySelector("#grid");
const search = document.querySelector("#search");
const chips = document.querySelector("#chips");
const count = document.querySelector("#count");
const modal = document.querySelector("#modal");
const cartDrawer = document.querySelector("#cartDrawer");
const cartOverlay = document.querySelector("#cartOverlay");
const videoModal = document.querySelector("#videoModal");

const money = (number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(number);

/* =========================================================
   INFORMACIÓN COMPLEMENTARIA DE LAS FICHAS
========================================================= */

const PURPOSE_BY_CATEGORY = {
  "Bienestar femenino":
    "Fórmula perteneciente a la categoría de bienestar femenino. Sus componentes están pensados para complementar la nutrición y las necesidades propias de esta categoría.",
  "Digestión y probióticos":
    "Producto orientado al acompañamiento del bienestar digestivo y al equilibrio de la microbiota, de acuerdo con los ingredientes incluidos en su fórmula.",
  "Vitaminas y minerales":
    "Complementa la alimentación con vitaminas o minerales específicos presentes en su fórmula.",
  "Omegas y antioxidantes":
    "Aporta nutrientes y compuestos antioxidantes pertenecientes a la categoría de omegas y protección nutricional.",
  "Nutrición y proteína":
    "Opción nutricional en polvo diseñada para complementar la alimentación con proteína u otros nutrientes.",
  "Bienestar diario":
    "Fórmula nutricional diseñada para complementar la alimentación y acompañar una rutina diaria de bienestar.",
};

function extractIngredients(product) {
  const summary = product.summary || "";
  const match = summary.match(/(?:a base de|contiene|con)\s+(.+?)(?:\.|$)/i);

  if (match?.[1]) {
    return match[1]
      .replace(/\s+y\s+/gi, ", ")
      .replace(/\s*,\s*/g, ", ")
      .trim();
  }

  return "Consulta la lista completa de ingredientes y cantidades en la etiqueta del producto.";
}

function purposeFor(product) {
  return (
    product.purpose ||
    PURPOSE_BY_CATEGORY[product.category] ||
    PURPOSE_BY_CATEGORY["Bienestar diario"]
  );
}

function directionsFor(product) {
  return (
    product.directions ||
    "Sigue únicamente el modo de uso indicado en la etiqueta del producto o la recomendación de un profesional de la salud. La cantidad puede variar según la fórmula y las necesidades de cada persona."
  );
}

function warningsFor(product) {
  return (
    product.warnings ||
    "Para obtener una orientación adecuada, revisa las indicaciones de la etiqueta y respeta el modo de uso del fabricante. Si deseas identificar la opción más apropiada para ti, agenda una orientación con nuestro equipo ."
  );
}

/* =========================================================
   CATÁLOGO, BÚSQUEDA Y FILTROS
========================================================= */

function renderChips() {
  chips.innerHTML = categories
    .map(
      (category) => `
        <button
          class="chip ${category === activeCategory ? "active" : ""}"
          data-cat="${category}"
          type="button"
        >
          ${category}
        </button>
      `,
    )
    .join("");
}

function renderProducts() {
  const query = search.value.toLowerCase().trim();
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory =
      activeCategory === "Todos" || product.category === activeCategory;
    const searchableText =
      `${product.name} ${product.summary} ${product.category}`.toLowerCase();
    return matchesCategory && searchableText.includes(query);
  });

  count.textContent = `${filteredProducts.length} productos encontrados`;

  grid.innerHTML = filteredProducts
    .map(
      (product) => `
        <article class="card">
          <div class="photo">
            <span class="tag">${product.category}</span>
            <img loading="lazy" src="${product.image}" alt="${product.name}">
          </div>

          <div class="body">
            <div class="brandname">${product.brand}</div>
            <h3>${product.name}</h3>
            <p class="summary">${product.summary}</p>
            <div class="meta">${product.presentation}</div>
            <div class="price">${money(product.price)}</div>

            <div class="cardactions">
              <button class="detail" data-id="${product.id}" type="button">
                Ver ficha completa
              </button>
              <button class="wa add-cart-card" data-id="${product.id}" type="button">
                Agregar
              </button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

function selectCategory(category) {
  activeCategory = categories.includes(category) ? category : "Todos";
  renderChips();
  renderProducts();
}

/* =========================================================
   FICHA COMPLETA DEL PRODUCTO
========================================================= */

function updateProductWhatsApp() {
  if (!currentProduct) return;

  const quantity = Number(document.querySelector("#modalQty").value);
  const total = currentProduct.price * quantity;
  const message = [
    "Hola, quiero comprar:",
    `${quantity} pieza(s) de ${currentProduct.name}`,
    `Presentación: ${currentProduct.presentation}`,
    `Precio unitario: ${money(currentProduct.price)}`,
    `Total: ${money(total)}`,
  ].join("\n");

  document.querySelector("#modalWhats").href =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function openProduct(id) {
  const product = PRODUCTS.find((item) => item.id === id);
  if (!product) return;

  currentProduct = product;

  document.querySelector("#modalImage").src = product.image;
  document.querySelector("#modalImage").alt = product.name;
  document.querySelector("#modalBrand").textContent = product.brand;
  document.querySelector("#modalTitle").textContent = product.name;
  document.querySelector("#modalSummary").textContent = product.summary;
  document.querySelector("#modalPresentation").textContent =
    `Presentación: ${product.presentation}`;
  document.querySelector("#modalPrice").textContent = money(product.price);
  document.querySelector("#modalPurpose").textContent = purposeFor(product);
  document.querySelector("#modalIngredients").textContent =
    extractIngredients(product);
  document.querySelector("#modalDetail").textContent = product.detail;
  document.querySelector("#modalDirections").textContent =
    directionsFor(product);
  document.querySelector("#modalWarnings").textContent = warningsFor(product);
  document.querySelector("#modalQty").value = "1";

  document.querySelector("#modalThumbs").innerHTML = product.gallery
    .map(
      (source, index) => `
        <button
          type="button"
          data-src="${source}"
          aria-label="Ver imagen ${index + 1}"
        >
          <img src="${source}" alt="">
        </button>
      `,
    )
    .join("");

  updateProductWhatsApp();
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeProduct() {
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

/* =========================================================
   CARRITO DE COMPRA
========================================================= */

function saveCart() {
  localStorage.setItem("catalogoCart", JSON.stringify(cart));
}

function cartQuantity() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function cartTotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function addToCart(productId, quantity = 1) {
  const product = PRODUCTS.find((item) => item.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity = Math.min(100, existing.quantity + Number(quantity));
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      presentation: product.presentation,
      image: product.image,
      quantity: Number(quantity),
    });
  }

  saveCart();
  renderCart();
  openCart();
}

function changeCartQuantity(productId, change) {
  const item = cart.find((product) => product.id === productId);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter((product) => product.id !== productId);
  }

  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter((product) => product.id !== productId);
  saveCart();
  renderCart();
}

function cartMessage() {
  const lines = ["Hola, quiero realizar el siguiente pedido:", ""];

  cart.forEach((item) => {
    lines.push(
      `• ${item.quantity} x ${item.name} — ${money(item.price * item.quantity)}`,
    );
  });

  lines.push("", `Total del pedido: ${money(cartTotal())}`);
  lines.push("Quedo pendiente de disponibilidad, entrega o envío.");
  return lines.join("\n");
}

function renderCart() {
  const cartItems = document.querySelector("#cartItems");
  const cartEmpty = document.querySelector("#cartEmpty");
  const whatsAppButton = document.querySelector("#cartWhatsApp");

  document.querySelector("#cartCount").textContent = cartQuantity();
  document.querySelector("#cartTotal").textContent = money(cartTotal());

  cartItems.innerHTML = cart
    .map(
      (item) => `
        <article class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div>
            <h3>${item.name}</h3>
            <p>${item.presentation} · ${money(item.price)}</p>
            <div class="cart-item-controls">
              <button data-action="minus" data-id="${item.id}" type="button">−</button>
              <strong>${item.quantity}</strong>
              <button data-action="plus" data-id="${item.id}" type="button">+</button>
            </div>
          </div>
          <button class="remove-cart" data-action="remove" data-id="${item.id}" type="button">
            Quitar
          </button>
        </article>
      `,
    )
    .join("");

  cartEmpty.style.display = cart.length ? "none" : "block";
  whatsAppButton.style.pointerEvents = cart.length ? "auto" : "none";
  whatsAppButton.style.opacity = cart.length ? "1" : ".5";
  whatsAppButton.href = cart.length
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(cartMessage())}`
    : "#";
}

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* =========================================================
   VIDEOS POR TEMA
========================================================= */

function openVideoPlaceholder(title) {
  document.querySelector("#videoModalTitle").textContent = title;
  videoModal.classList.add("open");
  videoModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeVideoPlaceholder() {
  videoModal.classList.remove("open");
  videoModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

/* =========================================================
   EVENTOS
========================================================= */

chips.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cat]");
  if (button) selectCategory(button.dataset.cat);
});

grid.addEventListener("click", (event) => {
  const detailButton = event.target.closest(".detail");
  const addButton = event.target.closest(".add-cart-card");

  if (detailButton) openProduct(Number(detailButton.dataset.id));
  if (addButton) addToCart(Number(addButton.dataset.id));
});

document.querySelector("#modalThumbs").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (button) document.querySelector("#modalImage").src = button.dataset.src;
});

document
  .querySelector("#modalQty")
  .addEventListener("change", updateProductWhatsApp);

document.querySelector("#modalAddCart").addEventListener("click", () => {
  if (!currentProduct) return;
  const quantity = Number(document.querySelector("#modalQty").value);
  addToCart(currentProduct.id, quantity);
  closeProduct();
});

document.querySelector(".close").addEventListener("click", closeProduct);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeProduct();
});

search.addEventListener("input", renderProducts);
document.querySelector("#openCart").addEventListener("click", openCart);
document.querySelector("#closeCart").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.querySelector("#cartItems").addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  if (button.dataset.action === "plus") changeCartQuantity(id, 1);
  if (button.dataset.action === "minus") changeCartQuantity(id, -1);
  if (button.dataset.action === "remove") removeFromCart(id);
});

document.querySelectorAll(".video-placeholder").forEach((placeholder) => {
  placeholder.addEventListener("click", () => {
    const topic = placeholder.closest(".video-topic");
    openVideoPlaceholder(topic.querySelector("h3").textContent);
  });
});

document.querySelectorAll(".topic-products").forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.closest(".video-topic").dataset.category;
    selectCategory(category);
    document.querySelector("#productos").scrollIntoView({ behavior: "smooth" });
  });
});

document
  .querySelector("#closeVideo")
  .addEventListener("click", closeVideoPlaceholder);
videoModal.addEventListener("click", (event) => {
  if (event.target === videoModal) closeVideoPlaceholder();
});

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeProduct();
  closeCart();
  closeVideoPlaceholder();
});

/* =========================================================
   INICIO
========================================================= */

renderChips();
renderProducts();
renderCart();
