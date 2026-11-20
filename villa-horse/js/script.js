(() => {
  "use strict";

  /* ELEMENTOS E UTILITÁRIOS */

  const $ = (selector, root = document) => root.querySelector(selector);

  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];

  const CART_KEY = "vh_cart_v2";

  const money = (value) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

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

  /*
    WHATSAPP

    Gera uma URL de WhatsApp com somente um parâmetro de mensagem.
    Também impede a repetição consecutiva da saudação de contato.
  */

  const normalizeWhatsAppMessage = (message) => {
    const cleaned = String(message || "").trim();

    return cleaned.replace(
      /(Olá! Gostaria de mais informações sobre os produtos da Villa Horse\.)(?:\s*\1)+/g,
      "$1",
    );
  };

  const whatsappURL = (message) => {
    const base = `https://wa.me/${WHATSAPP}`;

    if (!message) {
      return base;
    }

    const params = new URLSearchParams();

    params.set("text", normalizeWhatsAppMessage(message));

    return `${base}?${params.toString()}`;
  };

  /* ESTADO */

  let cart = [];

  let selectedCategory = "todos";
  let searchTerm = "";
  let sortOrder = "";
  let toastTimer;

  /* RECUPERAR O CARRINHO SALVO */

  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));

    if (Array.isArray(saved)) {
      cart = saved
        .filter((item) => item && productById(item.id))
        .map((item) => ({
          id: item.id,
          qty: quantityValue(item.qty),
        }));
    }
  } catch (_) {
    cart = [];
  }

  /* SALVAR O CARRINHO */

  const saveCart = () => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (_) {
      // O site continua funcionando mesmo se o armazenamento estiver indisponível.
    }
  };

  /* CONTROLE DE QUANTIDADE */

  const quantityControl = (product) => `
    <div class="buy">

      <div
        class="qty"
        role="group"
        aria-label="Escolher quantidade de ${escapeHTML(product.nome)}"
      >
        <button
          type="button"
          data-act="dec"
          aria-label="Diminuir quantidade de ${escapeHTML(product.nome)}"
        >−</button>

        <input
          type="number"
          inputmode="numeric"
          min="1"
          max="99"
          value="1"
          aria-label="Quantidade de ${escapeHTML(product.nome)}"
        >

        <button
          type="button"
          data-act="inc"
          aria-label="Aumentar quantidade de ${escapeHTML(product.nome)}"
        >+</button>
      </div>

      <button type="button" class="btn" data-act="add">
        <svg class="icon" aria-hidden="true">
          <use href="#i-bag"/>
        </svg>
        Adicionar à sacola
      </button>

    </div>
  `;

  /* CARTÃO DE PRODUTO */

  const productCard = (product) => {
    const category = categoryById(product.categoria);

    const tag = category ? category.nome : "Villa Horse";

    return `
      <article class="card" data-id="${escapeHTML(product.id)}">

        <button
          type="button"
          class="thumb"
          data-act="det"
          aria-label="Ver detalhes de ${escapeHTML(product.nome)}"
        >
          <img
            src="${escapeHTML(product.imagens[0].src)}"
            alt="${escapeHTML(product.imagens[0].alt)}"
            width="600"
            height="800"
            loading="lazy"
            decoding="async"
          >
        </button>

        <div class="info">

          <span class="product-tag">
            ${escapeHTML(tag)}
          </span>

          <h3>${escapeHTML(product.nome)}</h3>

          <p class="desc">
            ${escapeHTML(product.descricao)}
          </p>

          <p class="price">
            ${productPrice(product)}
          </p>

          ${quantityControl(product)}

          <button
            type="button"
            class="link"
            data-act="det"
          >
            Detalhes do produto
            <span aria-hidden="true">↗</span>
          </button>

        </div>
      </article>
    `;
  };

  /* RENDERIZAR PRODUTOS */

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

    if (sortOrder === "az") {
      results.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    }

    $("#grid").innerHTML = results.map(productCard).join("");

    const empty = $("#empty");

    empty.hidden = results.length > 0;

    empty.innerHTML = `
      ${
        term
          ? "Não encontramos produtos com essa busca."
          : "Ainda não há produtos cadastrados nesta categoria."
      }

      <button
        type="button"
        class="link"
        data-cat="todos"
      >
        Ver todos os produtos
      </button>
    `;

    $("#count").textContent = `${results.length} ${
      results.length === 1 ? "produto encontrado" : "produtos encontrados"
    }`;

    $$("[data-cat]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.cat === selectedCategory),
      );
    });
  }

  /* ADICIONAR AO CARRINHO */

  function addToCart(id, quantity) {
    const product = productById(id);

    if (!product) {
      return;
    }

    const existing = cart.find((item) => item.id === id);

    if (existing) {
      existing.qty = Math.min(99, existing.qty + quantity);
    } else {
      cart.push({
        id,
        qty: quantity,
      });
    }

    syncCart();
  }

  /* CÁLCULO DO CARRINHO */

  function totals() {
    return cart.reduce(
      (total, item) => {
        const product = productById(item.id);

        if (!product) {
          return total;
        }

        total.units += item.qty;

        if (hasPrice(product)) {
          total.subtotal += product.preco * item.qty;
        } else {
          total.unpricedItems += 1;
        }

        return total;
      },
      {
        units: 0,
        subtotal: 0,
        unpricedItems: 0,
      },
    );
  }

  const subtotalText = (total) => {
    if (total.unpricedItems === 0) {
      return money(total.subtotal);
    }

    if (total.subtotal > 0) {
      return `${money(total.subtotal)} (parcial)`;
    }

    return "Sob consulta";
  };

  /*
    MENSAGEM DO PEDIDO

    Esta mensagem é usada no botão de finalizar pelo WhatsApp.

    O subtotal e as observações não entram na mensagem.
    Os preços continuam aparecendo por produto quando cadastrados.
  */

  function buildOrderMessage() {
    const items = cart.map((item) => {
      const product = productById(item.id);

      const unitPrice = hasPrice(product)
        ? ` — ${money(product.preco)} cada`
        : " — preço a consultar";

      return `• ${product.nome} — Quantidade: ${item.qty}${unitPrice}`;
    });

    return normalizeWhatsAppMessage(
      [
        "Olá! Gostaria de fazer um pedido na Villa Horse.",
        "",
        "*Meu pedido:*",
        ...items,
        "",
        "Poderiam confirmar a disponibilidade, o valor final e o frete?",
      ].join("\n"),
    );
  }

  /* ATUALIZAR O CARRINHO */

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

    $("#barn").textContent = `${total.units} ${
      total.units === 1 ? "item na sacola" : "itens na sacola"
    }`;

    $("#bars").textContent = subtotalText(total);

    /* ITENS DA SACOLA */

    $("#lines").innerHTML = cart
      .map((item) => {
        const product = productById(item.id);
        const name = escapeHTML(product.nome);

        return `
        <li class="line" data-id="${escapeHTML(product.id)}">

          <img
            src="${escapeHTML(product.imagens[0].src)}"
            alt=""
            width="68"
            height="82"
            loading="lazy"
          >

          <div>
            <p class="ln">${name}</p>

            <p class="lp">
              ${productPrice(product)}
            </p>

            <div
              class="qty sm"
              role="group"
              aria-label="Quantidade de ${name}"
            >
              <button
                type="button"
                data-act="cdec"
                aria-label="Diminuir quantidade de ${name}"
              >−</button>

              <output aria-live="polite">${item.qty}</output>

              <button
                type="button"
                data-act="cinc"
                aria-label="Aumentar quantidade de ${name}"
              >+</button>
            </div>
          </div>

          <button
            type="button"
            class="rm"
            data-act="rm"
            aria-label="Remover ${name} da sacola"
          >
            Remover
          </button>

        </li>
      `;
      })
      .join("");

    /* RESUMO */

    $("#cempty").hidden = hasItems;

    $("#csub").textContent = subtotalText(total);

    $("#cnote").hidden = !hasItems || total.unpricedItems === 0;

    const checkout = $("#fin");

    checkout.setAttribute("aria-disabled", String(!hasItems));

    if (hasItems) {
      checkout.href = whatsappURL(buildOrderMessage());
    } else {
      checkout.removeAttribute("href");
    }
  }

  /* AVISO VISUAL */

  function showToast(message) {
    const live = $("#live");

    live.textContent = message;
    live.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      live.classList.remove("show");
    }, 2400);
  }

  /* DETALHES DO PRODUTO */

  function openProductDetails(id) {
    const product = productById(id);

    if (!product) {
      return;
    }

    const dialog = $("#det");
    const pictures = product.imagens;
    const category = categoryById(product.categoria);

    dialog.innerHTML = `
      <div class="sheet">

        <div class="dialog-head">

          <div>
            <span class="section-kicker">
              ${escapeHTML(category ? category.nome : "Villa Horse")}
            </span>

            <h2 id="dt">Detalhes do produto</h2>
          </div>

          <button
            type="button"
            class="close-btn"
            data-act="close"
            aria-label="Fechar detalhes"
          >×</button>

        </div>

        <div class="dgrid" data-id="${escapeHTML(product.id)}">

          <div>
            <img
              id="dimg"
              src="${escapeHTML(pictures[0].src)}"
              alt="${escapeHTML(pictures[0].alt)}"
              width="600"
              height="800"
            >

            ${
              pictures.length > 1
                ? `
                  <div class="pics">
                    ${pictures
                      .map(
                        (picture, index) => `
                      <button
                        type="button"
                        data-act="pic"
                        data-src="${escapeHTML(picture.src)}"
                        data-alt="${escapeHTML(picture.alt)}"
                        aria-label="Ver foto ${index + 1} de ${pictures.length}"
                      >
                        <img
                          src="${escapeHTML(picture.src)}"
                          alt=""
                          width="48"
                          height="56"
                          loading="lazy"
                        >
                      </button>
                    `,
                      )
                      .join("")}
                  </div>
                `
                : ""
            }
          </div>

          <div>
            <h2 id="dt-name">
              ${escapeHTML(product.nome)}
            </h2>

            <p>${escapeHTML(product.descricao)}</p>

            <p class="price">
              ${productPrice(product)}
            </p>

            ${quantityControl(product)}
          </div>

        </div>
      </div>
    `;

    dialog.setAttribute("aria-labelledby", "dt-name");
    dialog.showModal();
  }

  /* ABRIR CARRINHO */

  function openCart() {
    const dialog = $("#cart");

    if (!dialog.open) {
      dialog.showModal();
    }
  }

  /* CLIQUES E INTERAÇÕES */

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-act], [data-cat]");

    if (!button) {
      return;
    }

    /* FILTRAR CATEGORIA */

    if (button.hasAttribute("data-cat")) {
      selectedCategory = button.dataset.cat;

      if (selectedCategory === "todos") {
        searchTerm = "";
        $("#q").value = "";
      }

      renderProducts();

      if (button.classList.contains("cat")) {
        $("#produtos").scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      return;
    }

    const action = button.dataset.act;
    const itemRoot = button.closest("[data-id]");
    const id = itemRoot && itemRoot.dataset.id;

    /* AUMENTAR OU DIMINUIR QUANTIDADE */

    if (action === "inc" || action === "dec") {
      const input = $("input", itemRoot);

      if (input) {
        input.value = Math.max(
          1,
          Math.min(
            99,
            quantityValue(input.value) + (action === "inc" ? 1 : -1),
          ),
        );
      }
    } else if (action === "add" && !button.disabled && id) {

    /* ADICIONAR PRODUTO */
      const input = $("input", itemRoot);

      addToCart(id, quantityValue(input ? input.value : 1));

      const originalText = button.innerHTML;

      button.disabled = true;

      button.innerHTML = `
        <svg class="icon" aria-hidden="true">
          <use href="#i-bag"/>
        </svg>
        Adicionado!
      `;

      showToast(`${productById(id).nome} adicionado à sacola`);

      setTimeout(() => {
        button.disabled = false;
        button.innerHTML = originalText;
      }, 1000);
    } else if (action === "det" && id) {

    /* DETALHES */
      openProductDetails(id);
    } else if (action === "pic") {

    /* FOTOS ALTERNATIVAS */
      const mainImage = $("#dimg");

      if (mainImage) {
        mainImage.src = button.dataset.src;
        mainImage.alt = button.dataset.alt;
      }
    } else if (action === "cinc" || action === "cdec") {

    /* QUANTIDADE DENTRO DO CARRINHO */
      const item = cart.find((entry) => entry.id === id);

      if (item) {
        item.qty = Math.max(
          1,
          Math.min(99, item.qty + (action === "cinc" ? 1 : -1)),
        );

        syncCart();
      }
    } else if (action === "rm") {

    /* REMOVER */
      cart = cart.filter((entry) => entry.id !== id);

      syncCart();

      if (!cart.length) {
        $("#cart .close-btn").focus();
      }
    } else if (action === "open-cart") {

    /* ABRIR CARRINHO */
      openCart();
    } else if (action === "close") {

    /* FECHAR MODAL */
      const dialog = button.closest("dialog");

      if (dialog && dialog.open) {
        dialog.close();
      }
    }
  });

  /* VALIDAR QUANTIDADES */

  document.addEventListener("change", (event) => {
    if (event.target.matches(".qty input")) {
      event.target.value = quantityValue(event.target.value);
    }
  });

  /* COMPORTAMENTO DOS MODAIS */

  $$("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });

    dialog.addEventListener("close", () => {
      if (dialog.id === "cart") {
        $("#cartbtn").focus({
          preventScroll: true,
        });
      }
    });
  });

  /* BUSCA E ORDENAÇÃO */

  $("#q").addEventListener("input", (event) => {
    searchTerm = event.target.value;
    renderProducts();
  });

  $("#ord").addEventListener("change", (event) => {
    sortOrder = event.target.value;
    renderProducts();
  });

  $("#sbtn").addEventListener("click", () => {
    $("#produtos").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setTimeout(() => {
      $("#q").focus({
        preventScroll: true,
      });
    }, 250);
  });

  /* MENU MOBILE */

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
    if (event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      closeMenu();
      menuButton.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 800) {
      closeMenu();
    }
  });

  /* WHATSAPP — CONTATO GERAL */

  const contactMessage =
    "Olá! Gostaria de mais informações sobre os produtos da Villa Horse.";

  $$("[data-wa]").forEach((link) => {
    /*
      Sempre recria o endereço a partir do telefone principal.
      Isso evita acumular parâmetros text na URL.
    */

    link.href = whatsappURL(contactMessage);

    link.setAttribute("aria-label", "Falar com a Villa Horse pelo WhatsApp");

    link.addEventListener("click", () => {
      link.href = whatsappURL(contactMessage);
    });
  });

  /* FINALIZAR PEDIDO */

  $("#fin").addEventListener("click", (event) => {
    if (!cart.length) {
      event.preventDefault();
    }
  });

  /* COPIAR A MENSAGEM DO PEDIDO */

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

  /* GERAR AS CATEGORIAS */

  $("#cats").innerHTML = CATEGORIAS.map(
    (category) => `
    <button
      type="button"
      class="cat"
      data-cat="${escapeHTML(category.id)}"
      aria-pressed="false"
    >
      <span class="cat-photo">
        <img
          src="${escapeHTML(category.img)}"
          alt=""
          width="240"
          height="180"
          loading="lazy"
          decoding="async"
        >
      </span>

      <span class="cn">
        ${escapeHTML(category.nome)}
        <small>Ver modelos</small>
      </span>

      <span class="cat-arrow" aria-hidden="true">↗</span>
    </button>
  `,
  ).join("");

  /* FILTROS */

  $("#chips").innerHTML = [
    {
      id: "todos",
      nome: "Todos",
    },
    ...CATEGORIAS,
  ]
    .map(
      (category) => `
    <button
      type="button"
      class="chip"
      data-cat="${escapeHTML(category.id)}"
      aria-pressed="false"
    >
      ${escapeHTML(category.nome)}
    </button>
  `,
    )
    .join("");

  /* DICAS */

  $("#arts").innerHTML = ARTIGOS.map(
    (article) => `
    <details>
      <summary>${escapeHTML(article.titulo)}</summary>
      <p>${escapeHTML(article.texto)}</p>
    </details>
  `,
  ).join("");

  /* INSTAGRAM */

  $("#ig").innerHTML = INSTAGRAM
    ? `
      <a
        href="${escapeHTML(INSTAGRAM)}"
        target="_blank"
        rel="noopener"
      >
        Instagram
      </a>
    `
    : "Instagram: em breve";

  /* ANO AUTOMÁTICO */

  $("#y").textContent = new Date().getFullYear();

  /* PRIMEIRA RENDERIZAÇÃO */

  renderProducts();
  renderCart();
})();
