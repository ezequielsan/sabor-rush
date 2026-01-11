// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando o seed COMPLETO...')

  // 1. Limpeza (Ordem correta para não quebrar chaves estrangeiras)
  await prisma.pagamento.deleteMany()
  await prisma.itemPedido.deleteMany()
  await prisma.pedido.deleteMany()
  await prisma.movimentacaoEstoque.deleteMany()
  await prisma.produto.deleteMany()
  await prisma.mesa.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.cupom.deleteMany()
  await prisma.fechamentoCaixa.deleteMany()
  await prisma.usuario.deleteMany()

  // 2. Criar Usuários (RF11)
  console.log('Criando usuários...')
  await prisma.usuario.createMany({
    data: [
      { nome: 'Gerente Admin', email: 'admin@sabor.com', senhaHash: 'admin', perfil: 'ADMIN' },
      { nome: 'João Garçom', email: 'garcom@sabor.com', senhaHash: '1234', perfil: 'GARCOM' },
      { nome: 'Maria Chef', email: 'cozinha@sabor.com', senhaHash: '1234', perfil: 'COZINHA' },
      { nome: 'Carlos Caixa', email: 'caixa@sabor.com', senhaHash: '1234', perfil: 'CAIXA' },
    ]
  })

  // 3. Criar Clientes (RF01)
  console.log('Criando clientes...')
  await prisma.cliente.create({
    data: { nome: 'Cliente Vip', telefone: '88999990000' }
  })

  // 4. Criar Cupons (RF15)
  console.log('Criando cupons...')
  await prisma.cupom.create({
    data: { codigo: 'DESC10', descontoPercentual: 10, ativo: true }
  })
  await prisma.cupom.create({
    data: { codigo: 'VIP20REAIS', descontoFixo: 20.0, ativo: true }
  })

  // 5. Criar Mesas (RF14)
  console.log('Criando mesas...')
  for (let i = 1; i <= 10; i++) {
    await prisma.mesa.create({ data: { numero: i, status: 'LIVRE' } })
  }

  // 6. Criar Cardápio (RF02)
  console.log('Criando produtos...')
  await prisma.produto.createMany({
    data: [
      { nome: 'X-Bacon', preco: 25.0, categoria: 'Lanches', imagemUrl: 'https://placehold.co/400', temEstoqueControlado: false },
      { nome: 'Coca-Cola Lata', preco: 6.0, categoria: 'Bebidas', temEstoqueControlado: true, quantidadeEstoque: 100, minimoEstoque: 10 },
      { nome: 'Suco Natural', preco: 8.0, categoria: 'Bebidas', temEstoqueControlado: false },
      { nome: 'Pizza Média', preco: 40.0, categoria: 'Pizzas', temEstoqueControlado: false },
      { nome: 'Batata Frita', preco: 15.0, categoria: 'Acompanhamentos', temEstoqueControlado: false },
      { nome: 'Salada Caesar', preco: 18.0, categoria: 'Saladas', temEstoqueControlado: false },
      { nome: 'Água Mineral', preco: 4.0, categoria: 'Bebidas', temEstoqueControlado: true, quantidadeEstoque: 200, minimoEstoque: 20 },
      
    ]
  })

  console.log('Banco de dados populado e pronto para o Frontend!')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })