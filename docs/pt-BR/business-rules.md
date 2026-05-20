# Regras de Negócio

Este documento descreve as regras de negócio implementadas no sistema Coriga.

## Regras de Reserva

### Unicidade de Data
- Cada data pode ter apenas uma reserva
- Tentar criar uma reserva para uma data já reservada falhará

### Status do Morador
- Apenas moradores ativos podem fazer novas reservas
- Moradores inativos não podem criar reservas
- Desativar um morador preserva seu histórico de reservas

### Cálculo de Preço
- O preço da reserva é calculado automaticamente com base no tipo do dia
- **Dia útil**: Usa `weekdayPrice` da configuração de preços
- **Final de semana**: Usa `weekendPrice` da configuração de preços
- **Feriado**: Usa `holidayPrice` da configuração de preços
- Feriados sobrescrevem o preço de final de semana (um feriado no sábado usa o preço de feriado)

## Regras de Pagamento

### Status do Pagamento
- O status do pagamento é atualizado automaticamente com base no valor pago:
  - **Pendente**: Nenhum pagamento registrado
  - **Parcial**: Algum valor pago, mas não o preço completo da reserva
  - **Pago**: Preço completo da reserva foi pago

### Pagamentos Parciais
- Múltiplos pagamentos parciais podem ser registrados para uma única reserva
- Cada pagamento registra:
  - Valor pago
  - Método de pagamento (dinheiro, PIX, cartão de crédito, cartão de débito)
  - Data do pagamento

### Métodos de Pagamento
- **cash**: Dinheiro
- **pix**: PIX (sistema de pagamento instantâneo brasileiro)
- **credit**: Cartão de crédito
- **debit**: Cartão de débito

## Regras de Feriados

### Tipos de Feriados
- **national**: Feriados nacionais brasileiros
- **municipal**: Feriados municipais
- **community**: Datas específicas do condomínio (ex: aniversário da comunidade)

### Impacto nos Preços
- Feriados usam o `holidayPrice` da configuração de preços
- Se um feriado cair no final de semana, o preço de feriado tem precedência
- Feriados são exibidos com uma cor distinta no calendário

## Regras de Moradores

### Status Ativo/Inativo
- Novos moradores são criados como ativos por padrão
- Desativar um morador:
  - Impede novas reservas
  - Preserva o histórico de reservas existente
  - Não afeta pagamentos existentes

### Campos Obrigatórios
- **name**: Nome completo do morador
- **unit**: Número do apartamento/casa

### Campos Opcionais
- **phone**: Telefone de contato
- **email**: Email de contato

## Regras de Cancelamento

### Cancelamento de Reserva
- Reservas podem ser canceladas por administradores
- Reservas canceladas:
  - São marcadas com status "cancelled"
  - Permanecem visíveis no sistema para fins históricos
  - Não bloqueiam a data para novas reservas (a data fica disponível)

## Estatísticas do Painel

### Estatísticas Mensais
- Total de reservas do mês
- Contagem de reservas confirmadas
- Contagem de reservas canceladas
- Receita total (soma de todos os preços de reservas)
- Contagem de pagamentos pendentes

### Próximas Reservas
- Mostra reservas para datas futuras
- Ordenadas por data (mais próxima primeiro)
- Inclui nome do morador e status de pagamento
