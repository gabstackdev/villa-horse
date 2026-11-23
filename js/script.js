(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];
  const CART_KEY = "vh_cart_v2";
  const OBS_KEY = "vh_obs_v2";
  const money = (value) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const escapeHTML = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const normalize = (value) =>
    String(value)
      .toLocaleLowerCase("pt-BR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const quantityValue = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.max(1, Math.min(99, parsed)) : 1;
  };
  const productById = (id) => PRODUTOS.find((product) => product.id === id);
  const categoryById = (id) =>
    CATEGORIAS.find((category) => category.id === id);
  const hasPrice = (product) =>
    product &&
    typeof product.preco === "number" &&
    Number.isFinite(product.preco) &&
    product.preco > 0;
  const productPrice = (product) =>
    hasPrice(product) ? money(product.preco) : "Consulte pelo WhatsApp";
  const whatsappURL = (message) =>
    `https://wa.me/${WHATSAPP}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

  let cart = [];
  let selectedCategory = "todos";
  let searchTerm = "";
  let sortOrder = "";
  let toastTimer;

  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    if (Array.isArray(saved)) {
      cart = saved
        .filter((item) => item && productById(item.id))
        .map((item) => ({ id: item.id, qty: quantityValue(item.qty) }));
    }
  } catch (_) {
    cart = [];
  }

  const saveCart = () => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (_) {
      /* armazenamento pode estar indisponível */
    }
  };

  /* ---------- catálogo ---------- */
  const quantityControl = (product) => `
    <div class="buy">
      <div class="qty" role="group" aria-label="Escolher quantidade de ${escapeHTML(product.nome)}">
        <button type="button" data-act="dec" aria-label="Diminuir quantidade de ${escapeHTML(product.nome)}">−</button>
        <input type="number" inputmode="numeric" min="1" max="99" value="1" aria-label="Quantidade de ${escapeHTML(product.nome)}">
        <button type="button" data-act="inc" aria-label="Aumentar quantidade de ${escapeHTML(product.nome)}">+</button>
      </div>
      <button type="button" class="btn" data-act="add"><svg class="icon" aria-hidden="true"><use href="#i-bag"/></svg> Adicionar à sacola</button>
    </div>`;

  const productCard = (product) => {
    const category = categoryById(product.categoria);
    const tag = category ? category.nome : "Villa Horse";
    return `
      <article class="card" data-id="${escapeHTML(product.id)}">
        <button type="button" class="thumb" data-act="det" aria-label="Ver detalhes de ${escapeHTML(product.nome)}">
          <img src="${escapeHTML(product.imagens[0].src)}" alt="${escapeHTML(product.imagens[0].alt)}" width="600" height="800" loading="lazy" decoding="async">
        </button>
        <div class="info">
          <span class="product-tag">${escapeHTML(tag)}</span>
          <h3>${escapeHTML(product.nome)}</h3>
          <p class="desc">${escapeHTML(product.descricao)}</p>
          <p class="price">${productPrice(product)}</p>
          ${quantityControl(product)}
          <button type="button" class="link" data-act="det">Detalhes do produto <span aria-hidden="true">↗</span></button>
        </div>
      </article>`;
  };

  function renderProducts() {
    const term = normalize(searchTerm.trim());
    const results = PRODUTOS.filter((product) => {
      const categoryMatch =
        selectedCategory === "todos" || product.categoria === selectedCategory;
      const searchMatch = normalize(
        `${product.nome} ${product.descricao}`,
      ).includes(term);
      return categoryMatch && searchMatch;
    });

    if (sortOrder === "az")
      results.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    $("#grid").innerHTML = results.map(productCard).join("");

    const empty = $("#empty");
    empty.hidden = results.length > 0;
    empty.innerHTML = `${term ? "Não encontramos produtos com essa busca." : "Ainda não há produtos cadastrados nesta categoria."} <button type="button" class="link" data-cat="todos">Ver todos os produtos</button>`;
    $("#count").textContent =
      `${results.length} ${results.length === 1 ? "produto encontrado" : "produtos encontrados"}`;
    $$("[data-cat]").forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.cat === selectedCategory),
      ),
    );
  }

  /* ---------- carrinho ---------- */
  function addToCart(id, quantity) {
    const product = productById(id);
    if (!product) return;
    const existing = cart.find((item) => item.id === id);
    if (existing) existing.qty = Math.min(99, existing.qty + quantity);
    else cart.push({ id, qty: quantity });
    syncCart();
  }

  function totals() {
    return cart.reduce(
      (total, item) => {
        const product = productById(item.id);
        if (!product) return total;
        total.units += item.qty;
        if (hasPrice(product)) total.subtotal += product.preco * item.qty;
        else total.unpricedItems += 1;
        return total;
      },
      { units: 0, subtotal: 0, unpricedItems: 0 },
    );
  }

  const subtotalText = (total) => {
    if (total.unpricedItems === 0) return money(total.subtotal);
    if (total.subtotal > 0) return `${money(total.subtotal)} (parcial)`;
    return "Sob consulta";
  };
  const whatsappSubtotal = (total) => {
    if (total.unpricedItems === 0) return money(total.subtotal);
    if (total.subtotal > 0)
      return `${money(total.subtotal)} (parcial; há itens para cotar)`;
    return "a cotar (itens sem preço cadastrado)";
  };

  function buildOrderMessage() {
    const total = totals();
    const observations = $("#obs").value.trim();
    const items = cart.map((item) => {
      const product = productById(item.id);
      const unitPrice = hasPrice(product)
        ? ` — ${money(product.preco)} cada`
        : " — preço a consultar";
      return `• ${product.nome} — Quantidade: ${item.qty}${unitPrice}`;
    });
    return [
      "Olá! Gostaria de fazer um pedido na Villa Horse.",
      "",
      "*Meu pedido: *".replace(": *", ":*"),
      ...items,
      "",
      `*Subtotal:* ${whatsappSubtotal(total)}`,
      `*Observações:* ${observations || "Nenhuma"}`,
      "",
      "Poderiam confirmar a disponibilidade, o valor final e o frete?",
    ].join("\n");
  }

  function syncCart() {
    saveCart();
    renderCart();
  }

  function renderCart() {
    const total = totals();
    const hasItems = cart.length > 0;
    $$(".cnt").forEach((badge) => {
      badge.textContent = total.units;
      badge.hidden = total.units === 0;
    });
    $("#cartbtn").setAttribute(
      "aria-label",
      `Abrir sacola, ${total.units} ${total.units === 1 ? "item" : "itens"}`,
    );
    document.body.classList.toggle("has-bar", hasItems);
    $("#bar").hidden = !hasItems;
    $("#barn").textContent =
      `${total.units} ${total.units === 1 ? "item na sacola" : "itens na sacola"}`;
    $("#bars").textContent = subtotalText(total);

    $("#lines").innerHTML = cart
      .map((item) => {
        const product = productById(item.id);
        const name = escapeHTML(product.nome);
        return `
        <li class="line" data-id="${escapeHTML(product.id)}">
          <img src="${escapeHTML(product.imagens[0].src)}" alt="" width="68" height="82" loading="lazy">
          <div>
            <p class="ln">${name}</p>
            <p class="lp">${productPrice(product)}</p>
            <div class="qty sm" role="group" aria-label="Quantidade de ${name}">
              <button type="button" data-act="cdec" aria-label="Diminuir quantidade de ${name}">−</button>
              <output aria-live="polite">${item.qty}</output>
              <button type="button" data-act="cinc" aria-label="Aumentar quantidade de ${name}">+</button>
            </div>
          </div>
          <button type="button" class="rm" data-act="rm" aria-label="Remover ${name} da sacola">Remover</button>
        </li>`;
      })
      .join("");

    $("#cempty").hidden = hasItems;
    $("#csub").textContent = subtotalText(total);
    $("#cnote").hidden = !hasItems || total.unpricedItems === 0;
    const checkout = $("#fin");
    checkout.setAttribute("aria-disabled", String(!hasItems));
    if (hasItems) checkout.href = whatsappURL(buildOrderMessage());
    else checkout.removeAttribute("href");
  }

  /* ---------- diálogos e feedback ---------- */
  function showToast(message) {
    const live = $("#live");
    live.textContent = message;
    live.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => live.classList.remove("show"), 2400);
  }

  function openProductDetails(id) {
    const product = productById(id);
    if (!product) return;
    const dialog = $("#det");
    const pictures = product.imagens;
    const category = categoryById(product.categoria);
    dialog.innerHTML = `
      <div class="sheet">
        <div class="dialog-head">
          <div><span class="section-kicker">${escapeHTML(category ? category.nome : "Villa Horse")}</span><h2 id="dt">Detalhes do produto</h2></div>
          <button type="button" class="close-btn" data-act="close" aria-label="Fechar detalhes">×</button>
        </div>
        <div class="dgrid" data-id="${escapeHTML(product.id)}">
          <div>
            <img id="dimg" src="${escapeHTML(pictures[0].src)}" alt="${escapeHTML(pictures[0].alt)}" width="600" height="800">
            ${pictures.length > 1 ? `<div class="pics">${pictures.map((picture, index) => `<button type="button" data-act="pic" data-src="${escapeHTML(picture.src)}" data-alt="${escapeHTML(picture.alt)}" aria-label="Ver foto ${index + 1} de ${pictures.length}"><img src="${escapeHTML(picture.src)}" alt="" width="48" height="56" loading="lazy"></button>`).join("")}</div>` : ""}
          </div>
          <div>
            <h2 id="dt-name">${escapeHTML(product.nome)}</h2>
            <p>${escapeHTML(product.descricao)}</p>
            <p class="price">${productPrice(product)}</p>
            ${quantityControl(product)}
          </div>
        </div>
      </div>`;
    dialog.setAttribute("aria-labelledby", "dt-name");
    dialog.showModal();
  }

  function openCart() {
    const dialog = $("#cart");
    if (!dialog.open) dialog.showModal();
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-act], [data-cat]");
    if (!button) return;

    if (button.hasAttribute("data-cat")) {
      selectedCategory = button.dataset.cat;
      if (selectedCategory === "todos") {
        searchTerm = "";
        $("#q").value = "";
      }
      renderProducts();
      if (button.classList.contains("cat"))
        $("#produtos").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const action = button.dataset.act;
    const itemRoot = button.closest("[data-id]");
    const id = itemRoot && itemRoot.dataset.id;

    if (action === "inc" || action === "dec") {
      const input = $("input", itemRoot);
      if (input)
        input.value = Math.max(
          1,
          Math.min(
            99,
            quantityValue(input.value) + (action === "inc" ? 1 : -1),
          ),
        );
    } else if (action === "add" && !button.disabled && id) {
      const input = $("input", itemRoot);
      addToCart(id, quantityValue(input ? input.value : 1));
      const originalText = button.innerHTML;
      button.disabled = true;
      button.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#i-bag"/></svg> Adicionado!`;
      showToast(`${productById(id).nome} adicionado à sacola`);
      setTimeout(() => {
        button.disabled = false;
        button.innerHTML = originalText;
      }, 1000);
    } else if (action === "det" && id) {
      openProductDetails(id);
    } else if (action === "pic") {
      const mainImage = $("#dimg");
      if (mainImage) {
        mainImage.src = button.dataset.src;
        mainImage.alt = button.dataset.alt;
      }
    } else if (action === "cinc" || action === "cdec") {
      const item = cart.find((entry) => entry.id === id);
      if (item) {
        item.qty = Math.max(
          1,
          Math.min(99, item.qty + (action === "cinc" ? 1 : -1)),
        );
        syncCart();
      }
    } else if (action === "rm") {
      cart = cart.filter((entry) => entry.id !== id);
      syncCart();
      if (!cart.length) $("#cart .close-btn").focus();
    } else if (action === "open-cart") {
      openCart();
    } else if (action === "close") {
      const dialog = button.closest("dialog");
      if (dialog && dialog.open) dialog.close();
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches(".qty input"))
      event.target.value = quantityValue(event.target.value);
  });
  $$("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      if (dialog.id === "cart") $("#cartbtn").focus({ preventScroll: true });
    });
  });

  /* ---------- busca, ordenação e menu mobile ---------- */
  $("#q").addEventListener("input", (event) => {
    searchTerm = event.target.value;
    renderProducts();
  });
  $("#ord").addEventListener("change", (event) => {
    sortOrder = event.target.value;
    renderProducts();
  });
  $("#sbtn").addEventListener("click", () => {
    $("#produtos").scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => $("#q").focus({ preventScroll: true }), 250);
  });

  const menuButton = $("#menu");
  const nav = $("#nav");
  const closeMenu = () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu");
  };
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Fechar menu" : "Abrir menu",
    );
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      closeMenu();
      menuButton.focus();
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 800) closeMenu();
  });

  /* ---------- WhatsApp, observações e primeira renderização ---------- */
  try {
    $("#obs").value = localStorage.getItem(OBS_KEY) || "";
  } catch (_) {}
  $("#obs").addEventListener("input", () => {
    try {
      localStorage.setItem(OBS_KEY, $("#obs").value);
    } catch (_) {}
    renderCart();
  });
  $("#fin").addEventListener("click", (event) => {
    if (!cart.length) event.preventDefault();
  });
  $("#copy").addEventListener("click", async () => {
    if (!cart.length) {
      $("#cmsg").textContent = "Adicione produtos à sacola primeiro.";
      return;
    }
    try {
      await navigator.clipboard.writeText(buildOrderMessage());
      $("#cmsg").textContent =
        "Mensagem copiada. Cole na conversa do WhatsApp.";
    } catch (_) {
      $("#cmsg").textContent =
        "Não foi possível copiar automaticamente. Tente abrir o WhatsApp pelo botão acima.";
    }
  });

  $("#cats").innerHTML = CATEGORIAS.map(
    (category) => `
    <button type="button" class="cat" data-cat="${escapeHTML(category.id)}" aria-pressed="false">
      ${
        category.img
          ? `<img src="${escapeHTML(category.img)}" alt="" width="600" height="800" loading="lazy" decoding="async">`
          : `<span class="soon">Mais opções<br>em breve</span>`
      }
      <span class="cn">${escapeHTML(category.nome)}</span>
    </button>`,
  ).join("");

  $("#chips").innerHTML = [{ id: "todos", nome: "Todos" }, ...CATEGORIAS]
    .map(
      (category) =>
        `<button type="button" class="chip" data-cat="${escapeHTML(category.id)}" aria-pressed="false">${escapeHTML(category.nome)}</button>`,
    )
    .join("");

  $("#arts").innerHTML = ARTIGOS.map(
    (article) => `
    <details><summary>${escapeHTML(article.titulo)}</summary><p>${escapeHTML(article.texto || "Conteúdo em preparação. Em breve, a Villa Horse compartilhará mais informações sobre este tema.")}</p></details>`,
  ).join("");

  $$("[data-wa]").forEach((link) => {
    link.href = whatsappURL(
      "Olá! Gostaria de mais informações sobre os produtos da Villa Horse.",
    );
    link.setAttribute("aria-label", "Falar com a Villa Horse pelo WhatsApp");
  });
  $("#ig").innerHTML = INSTAGRAM
    ? `<a href="${escapeHTML(INSTAGRAM)}" target="_blank" rel="noopener">Instagram</a>`
    : "Instagram: em breve";
  $("#y").textContent = new Date().getFullYear();

  renderProducts();
  renderCart();
})();
