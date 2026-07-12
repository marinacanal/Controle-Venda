# Controle de Vendas

Site estático para controle de vendas, desenvolvido sob medida para vendedores de uma loja de materiais de construção, utilizando o armazenamento local do navegador para persistência dos dados.

## Funcionalidades

* **Regras de Negócio Exclusivas:** Suporte nativo para as formas de pagamento específicas da loja (1/1 e 5/2).
* **Armazenamento Local:** Utiliza o **IndexedDB** para salvar todas as vendas e dados diretamente no navegador, funcionando 100% offline e sem necessidade de um banco de dados externo.
* **Interface Simples:** Design focado na agilidade que o dia a dia de um vendedor exige.

## Tecnologias Utilizadas

O projeto foi construído do zero, utilizando a tríade clássica do desenvolvimento web, sem frameworks pesados:

* **HTML5:** Estruturação semântica da página.
* **CSS3:** Estilização e layout responsivo.
* **JavaScript (Vanilla):** Lógica de negócios, manipulação do DOM e integração com a API do **IndexedDB**.

## Como Funciona o Armazenamento (IndexedDB)?

Como este é um site estático, os dados **não** são enviados para um servidor. Eles ficam guardados no banco de dados interno do seu próprio navegador (IndexedDB). 
> **Nota:** Se você limpar os dados de navegação, cookies ou histórico do navegador, os dados salvos no app podem ser apagados.

## Como Rodar o Projeto

Por ser um site estático, não há dependências. 

1. Faça o clone ou baixe este repositório.
2. Abra o arquivo `index.html` diretamente em qualquer navegador.
