# Villa Horse — catálogo country mobile-first

Site desenvolvido com HTML, CSS e JavaScript puro. A experiência foi projetada primeiro para celulares, com catálogo por categorias, busca, carrinho persistido no navegador e finalização de pedidos pelo WhatsApp.

## Abrir localmente

1. Extraia a pasta `villa-horse`.
2. Abra a pasta no VS Code.
3. Abra `index.html` com a extensão **Live Server**; ou abra o arquivo diretamente no navegador.

Também é possível executar um servidor local a partir desta pasta:

```bash
python -m http.server 8000
```

Depois, acesse `http://localhost:8000`.

## Arquivos principais

- `index.html`: estrutura das seções, cabeçalho, banner, catálogo, carrinho e rodapé.
- `css/style.css`: identidade visual, layout responsivo e estados dos componentes.
- `js/products.js`: dados editáveis dos produtos, categorias, WhatsApp e textos de dicas.
- `js/script.js`: busca, filtros, detalhes dos produtos, carrinho, persistência e mensagem de pedido.
- `assets/img/`: fotografias reais de produtos e versão otimizada da logo recebida.

## Adicionar ou atualizar produtos

Edite o array `PRODUTOS` em `js/products.js`. Cada produto deve ter:

- `id`: identificador único;
- `nome`: nome exibido no catálogo;
- `categoria`: um dos IDs existentes em `CATEGORIAS`;
- `preco`: número (por exemplo, `89.9`) ou `null` para mostrar “Consulte pelo WhatsApp”;
- `descricao`: descrição do produto;
- `imagens`: lista de imagens com `src` e texto `alt`.

Para substituir uma foto, coloque o novo arquivo em `assets/img/` e altere o caminho no objeto do produto. Não é necessário duplicar código HTML.

## WhatsApp e redes sociais

O telefone de pedidos está configurado em `js/products.js` na constante `WHATSAPP`, no formato internacional, somente com números: `5518991176395`.

Para incluir o Instagram, preencha a constante `INSTAGRAM` com o endereço completo do perfil.

## Logo e foto de capa

- A versão otimizada da logo enviada está em `assets/img/logo-villa-horse.webp`.
- A fotografia da capa (banner) é carregada por uma URL do Unsplash no `index.html`. Para usar uma foto própria, salve-a em `assets/img/` e troque o `src` do elemento `.hero-photo img` pelo caminho local.
- As fotos de produtos do catálogo são as imagens fornecidas no ZIP original.

## Antes de divulgar

- Confira os nomes e as descrições dos produtos, em especial a expressão técnica “trança patriagrosa 3”, mantida conforme fornecida.
- Cadastre os preços quando estiverem definidos.
- Troque a fotografia de capa pela foto preferida da marca, se desejar.
- Configure o Instagram e demais informações comerciais que forem confirmadas.
- Teste o carrinho e a mensagem no WhatsApp em um celular real antes da publicação.

O carrinho usa `localStorage` no próprio navegador. A loja não confirma pedidos automaticamente: disponibilidade, preço final, frete e pagamento são combinados pelo WhatsApp.
