/* ===== Villa Horse: dados editáveis =====
   Para adicionar um produto, copie um objeto de PRODUTOS e altere os campos.
   preco: número (ex.: 89.9) ou null. Com null aparece "Consulte pelo WhatsApp". */

const WHATSAPP = "18991381618"; // +55 18 99117-6395
const INSTAGRAM = ""; // ex.: "https://instagram.com/seu_perfil" (vazio = "em breve")

const CATEGORIAS = [
  { id: "redeas", nome: "Rédeas", img: "assets/img/redea-trancada.jpg" },
  {
    id: "cabrestos",
    nome: "Cabrestos",
    img: "assets/img/cabresto-sete-nos.jpg",
  },
  {
    id: "cabecadas",
    nome: "Cabeçadas",
    img: "assets/img/cabecada-trancada.jpg",
  },
];

const PRODUTOS = [
  {
    id: "redea-trancada-couro",
    nome: "Rédea de lã",
    categoria: "redeas",
    preco: 120,
    descricao:
      " Rédea  de lã trançada com miolo de corda de polipropileno de 8 mm, comprimento de 2,10 mts com argolas de inox e biqueiras trançadas manualmente.",
    imagens: [
      {
        src: "assets/img/redea-trancada.jpg",
      },
    ],
  },
  {
    id: "cabresto-sete-nos",
    nome: "Cabresto 7 nós",
    categoria: "cabrestos",
    preco: 120,
    descricao:
      "Cabresto confeccionado em corda de polipropileno de 8 mm com  regulagem, acompanha cabo de 3 mts trançado c/ 5 fios de polipropileno de 5mm com biqueira para desatar do cabresto. Acompanha cabo trançado de três metros.",
    imagens: [
      {
        src: "assets/img/cabresto-sete-nos.jpg",
      },
      {
        src: "assets/img/cabresto-sete-nos-2.jpg",
      },
    ],
  },
  {
    id: "cabecada-trancada",
    nome: "Cabeçada trançada",
    categoria: "cabecadas",
    preco: 85,
    descricao:
      "Cabeçada Trançada com  cordinha de polipropileno de 3 mm (trança chata de 9 tentos), com argolas e fivelas em inox, possui regulagem.",
    imagens: [
      {
        src: "assets/img/cabecada-trancada.jpg",
      },
      {
        src: "assets/img/cabecada-trancada-2.jpg",
      },
    ],
  },
  {
    id: "cabresto-personalizado-inox",
    nome: "Cabresto personalizado",
    categoria: "cabrestos",
    preco: 160,
    descricao:
      "Cabresto confeccionado em corda de polipropileno de 8 mm com regulagem,  personalizado com nome do animal, acompanha cabo fixo de 3 mts de comprimento",
    imagens: [
      {
        src: "assets/img/cabresto-personalizado.jpg",
      },
    ],
  },
];

/* Artigos: adicione objetos. Sem "texto", aparece "Conteúdo em preparação." */
const ARTIGOS = [
  { titulo: "Como escolher o cabresto adequado", texto: "" },
  { titulo: "Cuidados com cordas, couro e ferragens", texto: "" },
  { titulo: "Como conservar seus acessórios para cavalos", texto: "" },
];
