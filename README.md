# PROJ-LES - Sistema de Gestão Local de Eventos Científicos

Projeto desenvolvido no âmbito da unidade curricular de Laboratório de Engenharia de Software (LES).

---

## Introdução

Este projeto foi desenvolvido no âmbito da unidade curricular de **Laboratório de Engenharia de Software (LES)**, com o objetivo de combinar o desenvolvimento de software com as competências de trabalho desenvolvidas em engenharia de software, nomeadamente processos de trabalho ágeis.

O tema do projeto é **Sistema de Gestão Local de Eventos Científicos**, que se centra no desenvolvimento de uma aplicação para a gestão de eventos, atividades e conteúdos científicos associados, como artigos, tipos de registos nos eventos e benefícios. A aplicação permite aos utilizadores consultar informação, criar e gerir eventos, associar atividades a esses eventos e interagir com diferentes funcionalidades através de uma aplicação web.

O sistema foi desenvolvido com uma separação entre frontend e backend. O frontend é responsável pela interação com o utilizador, enquanto o backend disponibiliza uma API responsável por toda a lógica de negócio por trâs: validação dos pedidos, segurança e comunicação com a base de dados.

Ao longo do desenvolvimento foram aplicadas práticas como organização modular do código, utilização de componentes reutilizáveis, CI/CD, documentação da API, controlo de versões e uso de Docker para facilitar a execução do projeto em diferentes ambientes.

---

## Escolhas de Design
A aplicação foi dividida em duas partes principais: **frontend** e **backend**.

O frontend é responsável pela interface com o utilizador, incluindo a navegação entre páginas, o preenchimento de formulários e a interação com os dados da aplicação. O backend disponibiliza a API responsável pela lógica, validação dos pedidos, autenticação/autorização e comunicação direta com a base de dados.

A comunicação entre o frontend e o backend é feita através de uma **API REST**. Esta abordagem permite que o frontend realize operações CRUD, como consultar, criar, editar e eliminar recursos através de pedidos HTTP.

A utilização de endpoints REST torna a comunicação mais clara e estruturada, facilitando também a documentação da API através do Swagger.

No frontend, optou-se por criar alguns componentes reutilizáveis para evitar duplicação de código e manter uma interface mais consistente. Por exemplo:
- `TopBar`
- `BackButton`

O código foi organizado por pastas separadas por funcionalidades, que se separam ainda em páginas, componentes, utilitários e funcionalidades específicas. Isto facilita a procura de ficheiros e melhora o trabalho mantendo o projeto mais legível.

Algumas operações da aplicação, como a criação, edição ou remoção de dados, requerem validações adicionais, e então, foram utilizados mecanismos de autenticação, cookies e tokens CSRF, que garantem que apenas pedidos válidos sejam processados pelo backend de forma correta sem emitir erro.

Utilizamos **Docker** para facilitar a execução do projeto em diferentes ambientes de trabalho. Com Docker, é mais simples iniciar os serviços necessários, como frontend, backend e base de dados ao mesmo tempo sem preocupação com diferenças entre versões locais ou dependências.

A API foi documentada com **Swagger**, permitindo consultar facilmente os endpoints disponíveis, os métodos HTTP suportados e os dados esperados em cada pedido.

---

## Stack Tecnológico usado
Para o desenvolvimento do projeto foram utilizadas as seguintes linguagens, frameworks, bibliotecas e ferramentas.

### Frontend
- TypeScript
- React
- Tailwind CSS
- Vite

### Backend
- Go
- Gin
- GORM
- Goth
- SQLite

### Documentação
- Swagger

### Testes
- Testify (Go)
- Postman
- Newman

### CI/CD
- Docker
- Docker Compose
- GitHub Actions

### Justificação das escolhas
Para o frontend, foi escolhido **React** e **TypeScript**, uma vez que eram tecnologias com as quais a equipa já tinha alguma familiaridade e que são usadas extensivamente no mundo profissional. Além disso, foi utilizado **Tailwind CSS** para facilitar e acelerar a estilização da UI.

Para o backend, foi escolhido o ecossistema de **Go**, uma vez que é uma linguagem com utilização crescente no meio profissional e adequada para o desenvolvimento de APIs REST. Entre as várias frameworks disponíveis para Go, escolhemos o **Gin**, por ser uma alternativa popular, com boa documentação e adequada ao desenvolvimento de APIs. O **GORM** foi escolhido como ORM por motivos semelhantes, permitindo simplificar a interação com a base de dados.

Para a base de dados, foi escolhido **SQLite**, uma vez que tornava a gestão da base de dados durante o desenvolvimento mais simples e rápida. Estava também planeada uma migração para **PostgreSQL**, que seria assistida pela funcionalidade de auto-migração do GORM. No entanto, não tivemos tempo para realizar a migração deixando então a gestão da base de dados por conta do SQLite.

O **Swagger** foi escolhido para documentar a API, pois o ecossistema do Go fornece formas de conseguir gerar documentação com base em comentários dentro do código.

Por fim, para integração contínua e entrega contínua, usámos o **GitHub Actions** e **Docker**. Com GitHub Actions, é possível validar pull requests antes de realizar merge para a main, ajudando a evitar conflitos e erros no código base. Com Docker, é possível compilar e correr o projeto com uma configuração consistente e com todas as dependências necessárias com apenas uma linha de comando.

---

## Diagrama de Componentes

Para validar a stack tecnológica e representar a organização geral do sistema, foi elaborado um diagrama de componentes, tal como aprendemos em AMS.

<img width="1044" height="567" alt="LES" src="https://github.com/user-attachments/assets/76ce8be1-b7d7-4cf3-9361-2db98d2392ad" />

---

## Pré-requisitos
Antes de correr o projeto, é necessário ter instalado:
- Docker
- Docker Compose

Opcionalmente, caso se pretenda correr o projeto localmente ou realizar alterações ao código, é recomendado ter também instalado:
- Node.js
- npm
- Go

---

## Instalar Swagger e Gerar Documentação
Para gerar a documentação Swagger da API, é necessário ter o `swag` instalado.

### Instalar o swag
```bash
go install github.com/swaggo/swag/cmd/swag@latest
```

Para confirmar se a instalação foi feita corretamente, executar:
```bash
swag --version
```

### Gerar a documentação
A partir da raiz do projeto, deve-se executar o seguinte:
```bash
cd server
swag init -g cmd/main.go
cd ..
```

Este comando gera os ficheiros necessários para a documentação Swagger da API.
> **Nota:** este passo deve ser repetido sempre que forem feitas alterações aos endpoints ou aos comentários usados para gerar a documentação.

---

## Como Correr
Para correr deve, primeiramente, clonar este repositório:
```bash
git clone https://github.com/rodrigolinhas/PROJ-LES.git
```

Certifique-se que antes de prosseguir para os próximos passos, encontra-se na pasta do projeto. Para isso:
```bash
cd PROJ-LES
```

### Correr o projeto com Docker

#### 1. Criar o ficheiro `.env`
Criar o .env com as credenciais do Google OAuth.

> **Nota:** sem as credenciais do Google OAuth corretamente configuradas, o login com Google não irá funcionar.

#### 2. Gerar a documentação Swagger
Antes de correr o projeto, deve-se garantir que a documentação Swagger da API está gerada e atualizada.

Para isso, consultar a secção [Instalar Swagger e Gerar Documentação](#instalar-swagger-e-gerar-documentação).

#### 3. Construir e iniciar os serviços
Para dar build e correr todos os serviços de uma só vez, deve executar o seguinte comando:
```bash
docker compose up --build
```

Este comando inicia os serviços necessários para a aplicação, incluindo frontend, backend e base de dados.

#### 4. Aceder à aplicação
Depois de os containers iniciarem corretamente, a aplicação pode ser acedida através dos seguintes links:
```txt
Frontend:      http://localhost:5173
Backend:       http://localhost:8080
Swagger Docs:  http://localhost:8080/docs/index.html
```

#### 5. Parar os serviços
Para parar todos os serviços, deve executar o seguinte comando:
```bash
docker compose down
```

> **Nota:** ao executar o comando acima, os serviços simplesmente são parados, mantendo os dados da base de dados. Para parar os serviços e remover também os dados guardados na base de dados, deve usar o comando `docker compose down -v`.

---

## Estrutura do Projeto
```txt
PROJ-LES/
├── README.md
├── client/                      # Frontend do sistema.
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── src/
│   │   ├── app/                 # Configuração principal do sistema e as rotas do mesmo.
│   │   ├── assets/              # Imagens e ícones
│   │   ├── features/            # Funcionalidades organizadas por domínio
│   │   │   ├── articles/        # Gestão de artigos
│   │   │   ├── auth/            # Autenticação e criação de conta
│   │   │   ├── events/          # Gestão de eventos
│   │   │   │   ├── activities/  # Atividades associadas a eventos
│   │   │   │   ├── benefits/    # Benefícios associados a eventos
│   │   │   │   └── regtypes/    # Tipos de registos
│   │   │   ├── home/            # Página principal do sistema
│   │   │   ├── landing/         # Página inicial do sistema, a landigPage
│   │   │   ├── settings/        # Definições do utilizador
│   │   │   └── user/            # Perfil do utilizador
│   │   ├── main.tsx             # Ponto de entrada do frontend
│   │   ├── shared/              # Componentes, hooks e utilitários reutilizáveis
│   │   └── styles/              # Estilos globais a todo o projeto
│   └── vite.config.ts
│
├── server/                      # Backend/API do sistema
│   ├── Dockerfile
│   ├── cmd/
│   │   └── main.go              # Ponto de entrada do servidor
│   ├── docs/                    # Documentação Swagger gerada
│   ├── internal/
│   │   ├── api/                 # Endpoints e handlers da API
│   │   ├── database/            # Inicialização da base de dados
│   │   ├── models/              # Modelos do sistema, utilizados pela DB
│   │   └── utils/               # Funções auxiliares
│   ├── go.mod
│   └── go.sum
│
├── .github/ 
│   └── workflows/  
│       └── backend-postman-go.yml  # Configuração dos workflows para o actions
│
├── docs/                        # Enunciado, diagrama de componentes, etc
├── postman/                     # Coleções e ambientes para testar a API
└── docker-compose.yml           # Configuração dos serviços Docker
```
A estrutura do projeto encontra-se dividida em duas partes principais: `client`, que contém o frontend da aplicação, e `server`, que contém o backend/API. Para além disso, existem pastas auxiliares para documentação, testes da API com Postman, configuração dos serviços Docker e configuração dos workflows do Github Actions.

No frontend, a pasta `features` agrupa as funcionalidades principais da aplicação por domínio, facilitando a organização do código e a manutenção futura.

---

## Dados de Teste / Seeder
O projeto inclui um seeder com dados de avaliação, criado para facilitar o teste da aplicação por parte dos docentes.

O seeder popula automaticamente a base de dados com exemplos das principais entidades do sistema, permitindo testar as funcionalidades principais sem ser necessário criar todos os dados manualmente.

### Dados criados
O seeder cria, entre outros, os seguintes dados:
- Um utilizador com perfil de organizador de eventos;
- Um utilizador com perfil de estudante;
- Um evento científico de exemplo;
- Um tipo de inscrição associado ao evento de exemplo;
- Benefícios associados ao tipo de inscrição no evento de exemplo, quando disponíveis;
- Uma inscrição de estudante no evento de exemplo;
- Uma atividade associada ao evento de exemplo;
- Um artigo científico associado à atividade;

### Credenciais de teste
Podem ser usadas as seguintes contas para testar a aplicação:
```txt
Organizador:
Email:    admin@mail.com
Password: Jb@12345678

Estudante:
Email:    student@mail.com
Password: Jb@12345678
```

---

## Equipa de desenvolvimento
- **[Miguel Alvito](https://github.com/m-alvito)** — a83924
- **[Nicole Reis](https://github.com/nicoleacreis)** — a83926
- **[Ricardo Rodrigues](https://github.com/ricardoorodriguess)** — a83929
- **[Rodrigo Linhas](https://github.com/rodrigolinhas)** — a83933

### Universidade
**Universidade:** Universidade do Algarve  
**Curso:** Engenharia Informática  
**Ano letivo:** 2025/2026
