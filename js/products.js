/* ===== Villa Horse: dados editáveis =====
   Para adicionar um produto, copie um objeto de PRODUTOS e altere os campos.
   preco: número (ex.: 89.9) ou null. Com null aparece "Consulte pelo WhatsApp". */

const WHATSAPP = "5518991176395"; // +55 18 99117-6395
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
    descricao: "Rédea trançada de couro com argolas inox pequenas trançadas.",
    imagens: [
      {
        src: "assets/img/redea-trancada.jpg",
        alt: "Rédea trançada nas cores marrom e bege, com argolas de inox e arremates em couro",
      },
    ],
  },
  {
    id: "cabresto-sete-nos",
    nome: "Cabresto 7 nós",
    categoria: "cabrestos",
    preco: 120,
    descricao:
      "Cabresto sete nós confeccionado em corda de poliamida com argola pinheiro DMM com regulagem. Acompanha cabo trançado de três metros. Produto resistente e confortável para o seu animal.",
    imagens: [
      {
        src: "assets/img/cabresto-sete-nos.jpg",
        alt: "Cabresto de corda preta com detalhes amarelos e cabo trançado enrolado ao lado",
      },
      {
        src: "assets/img/cabresto-sete-nos-2.jpg",
        alt: "Cabresto de corda preta com detalhes verdes e cabo trançado enrolado ao lado",
      },
    ],
  },
  {
    id: "cabecada-trancada",
    nome: "Cabeçada trançada",
    categoria: "cabecadas",
    preco: 85,
    descricao:
      "Cabeçada trançada na corda de três milímetros com argolas e fivelas de inox, regulável. Cabo trançado na trança patriagrosa 3 com regulagem, acompanha cabo trançado de três metros de comprimento.",
    imagens: [
      {
        src: "assets/img/cabecada-trancada.jpg",
        alt: "Duas cabeçadas trançadas pretas com detalhes em branco e em azul e argolas de inox",
      },
      {
        src: "assets/img/cabecada-trancada-2.jpg",
        alt: "Cabeçada trançada preta com detalhe amarelo, argola de inox e rédeas trançadas",
      },
    ],
  },
  {
    id: "cabresto-personalizado-inox",
    nome: "Cabresto personalizado com nome do animal",
    categoria: "cabrestos",
    preco: 160,
    descricao:
      "Cabresto personalizado com inox, confeccionado em corda de poliamida de oito milímetros, com regulagem. Acompanha cabo fixo de dois metros. Produto confortável e seguro para o seu animal.",
    imagens: [
      {
        src: "assets/img/cabresto-personalizado.jpg",
        alt: "Cabresto rosa com nome personalizado em miçangas no focinho e cabo preto enrolado",
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
