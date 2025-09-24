# 📋 Regras de Negócio – Big Barber

## 1. Cadastro e Acesso
- O usuário deve se cadastrar informando **nome completo, telefone e e-mail válido**.  
- O e-mail cadastrado deve ser **verificado** por meio de link de ativação enviado automaticamente.  
- Perfis de usuário:  
  - **Cliente**: pode visualizar serviços, agendar horários, cancelar e avaliar atendimentos.  
  - **Administrador**: possui permissões especiais, incluindo acesso à agenda, histórico de atendimentos e gerenciamento de disponibilidade.  

---

## 2. Serviços, Preços e Agendamentos
- O site deve exibir **todos os serviços** com **descrição e preço de forma clara**.  
- O cliente pode visualizar a **disponibilidade de horários em tempo real**.  
- Agendamentos devem respeitar:  
  - **Antecedência mínima de 30 minutos** antes do horário desejado.  
- Cancelamentos ou modificações devem ser comunicados pelo cliente com **pelo menos 30 minutos de antecedência**, entrando em contato diretamente com a barbearia.  

---

## 3. Pagamentos e Tarifas
- Métodos de pagamento aceitos:  
  - **Cartão de crédito/débito**  
  - **Pix**  
- O **preço final** deve ser exibido de forma **transparente antes da confirmação**.  

---

## 4. Experiência do Usuário
- O cliente recebe **confirmação de agendamento via WhatsApp**.  
- Após o atendimento, o cliente pode **avaliar o serviço**; o barbeiro tem direito de resposta.  
- O cliente pode consultar seu **histórico de serviços realizados** e repetir agendamentos com facilidade.  

---

## 5. Administrador
- O administrador pode **gerenciar barbeiros, serviços, preços e categorias**.  
- O sistema deve gerar **relatórios de agendamentos**, permitindo análise do fluxo de clientes.  

---

## 6. Segurança e Privacidade
- O site deve cumprir a **LGPD**:  
  - Coleta mínima de dados.  
  - Consentimento explícito do usuário.  
  - Uso restrito dos dados para as finalidades informadas.  
- **Senhas** devem ser armazenadas de forma **criptografada**.  
- Todas as conexões devem ocorrer via **HTTPS**.  
- Devem ser realizados **backups regulares** das informações do sistema.  

---

## 7. Operações e Logística
- Exibir de forma clara a **localização física da barbearia** e seu **horário de funcionamento**.  
- Caso haja venda de produtos (shampoos, cremes, etc.), devem existir regras para:  
  - **Controle de estoque**.  
  - **Definição de métodos de entrega** ou **retirada no local**.  
