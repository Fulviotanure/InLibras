# INLIBRAS - Sistema de Orçamentos

Sistema de gerenciamento de orçamentos desenvolvido para a INLIBRAS.

## 🚀 Estrutura do Projeto

```
inlibras/
├── src/                    # Código fonte
│   ├── components/        # Componentes React
│   ├── services/         # Serviços (Firebase, etc.)
│   └── utils/            # Funções utilitárias
├── config/               # Arquivos de configuração
├── assets/              # Recursos estáticos
│   ├── images/         # Imagens
│   ├── icons/          # Ícones
│   └── fonts/          # Fontes
├── public/             # Arquivos públicos
└── server.js          # Servidor Express
```

## 🛠️ Tecnologias Utilizadas

- React
- Firebase (Authentication, Firestore)
- Express.js
- Webpack
- Jest
- ESLint
- Prettier

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn
- Conta no Firebase

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/inlibras.git
cd inlibras
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
- Crie um arquivo `.env` na raiz do projeto
- Adicione as configurações do Firebase:
```
FIREBASE_API_KEY=sua_api_key
FIREBASE_AUTH_DOMAIN=seu_auth_domain
FIREBASE_PROJECT_ID=seu_project_id
FIREBASE_STORAGE_BUCKET=seu_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
FIREBASE_APP_ID=seu_app_id
FIREBASE_MEASUREMENT_ID=seu_measurement_id
```

## 🚀 Executando o Projeto

1. Modo de desenvolvimento:
```bash
npm run dev
```

2. Modo de produção:
```bash
npm run build
npm start
```

## 📝 Scripts Disponíveis

- `npm start`: Inicia o servidor em modo de produção
- `npm run dev`: Inicia o servidor em modo de desenvolvimento
- `npm run build`: Compila o projeto para produção
- `npm test`: Executa os testes
- `npm run lint`: Executa o linter
- `npm run format`: Formata o código

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✨ Funcionalidades

- Autenticação de usuários
- Gerenciamento de orçamentos
- Cálculo automático de valores
- Geração de PDF
- Dashboard administrativo
- Relatórios e estatísticas

## 📞 Suporte

Para suporte, envie um email para seu-email@dominio.com ou abra uma issue no GitHub.


