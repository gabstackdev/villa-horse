/*
  VILLA HORSE
  Cadastro de produtos e categorias.

  Para alterar os preços:
  preco: 89.90

  Para deixar o preço sob consulta:
  preco: null
*/

const WHATSAPP = "5518991176395";

const INSTAGRAM = "";

/* CATEGORIAS DISPONÍVEIS */

const CATEGORIAS = [
  {
    id: "redeas",
    nome: "Rédeas",
    img: "assets/img/redea-trancada.jpg",
  },
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

/* PRODUTOS */

const PRODUTOS = [
  {
    id: "redea-trancada-couro",

    nome: "Rédea trançada de couro",

    categoria: "redeas",

    preco: null,

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

    nome: "Cabresto sete nós",

    categoria: "cabrestos",

    preco: null,

    descricao:
      "Cabresto sete nós confeccionado em corda de poliamida com argola pinheiro DMM com regulagem. Acompanha cabo trançado de três metros. Produto resistente e confortável para o seu animal.",

    imagens: [
      {
        src: "assets/img/cabresto-sete-nos.jpg",
        alt: "Cabresto de corda preta com detalhes amarelos e cabo trançado",
      },
      {
        src: "assets/img/cabresto-sete-nos-2.jpg",
        alt: "Cabresto de corda com detalhes coloridos e cabo trançado",
      },
    ],
  },

  {
    id: "cabecada-trancada",

    nome: "Cabeçada trançada",

    categoria: "cabecadas",

    preco: null,

    descricao:
      "Cabeçada trançada na corda de três milímetros com argolas e fivelas de inox, regulável. Cabo trançado na trança patriagrosa 3 com regulagem, acompanha cabo trançado de três metros de comprimento.",

    imagens: [
      {
        src: "assets/img/cabecada-trancada.jpg",
        alt: "Cabeçadas trançadas com argolas de inox",
      },
      {
        src: "assets/img/cabecada-trancada-2.jpg",
        alt: "Cabeçada trançada com argola de inox e rédeas",
      },
    ],
  },

  {
    id: "cabresto-personalizado-inox",

    nome: "Cabresto personalizado com inox",

    categoria: "cabrestos",

    preco: null,

    descricao:
      "Cabresto personalizado com inox, confeccionado em corda de poliamida de oito milímetros, com regulagem. Acompanha cabo fixo de dois metros. Produto confortável e seguro para o seu animal.",

    imagens: [
      {
        src: "assets/img/cabresto-personalizado.jpg",
        alt: "Cabresto personalizado com detalhes coloridos e cabo preto",
      },
    ],
  },
];

/* DICAS E CUIDADOS */

const ARTIGOS = [
  {
    titulo: "Como escolher um cabresto",

    texto:
      "Observe o material, as regulagens e o tamanho adequado para o seu animal. Se estiver em dúvida sobre o modelo, fale com a Villa Horse antes de escolher.",
  },

  {
    titulo: "Cuidados com cordas, couro e ferragens",

    texto:
      "Depois do uso, retire poeira e umidade e guarde o produto em local seco e ventilado. Considere sempre as orientações de conservação adequadas ao material.",
  },

  {
    titulo: "Como conservar seus acessórios",

    texto:
      "Confira periodicamente cordas, nós, argolas, fivelas e costuras. Se notar desgaste ou algum dano, interrompa o uso até que o produto seja avaliado.",
  },
];
