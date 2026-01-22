/**
 * Contexto de Autenticação e Tenant
 * Por enquanto, retorna um tenant padrão
 * TODO: Implementar autenticação real com Supabase Auth
 */

// Tenant padrão temporário - substitua por lógica de autenticação real
const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID || '';

/**
 * Obtém o ID do tenant atual
 * TODO: Implementar lógica de autenticação real
 */
export async function getTenantId(): Promise<string> {
  // Por enquanto, retorna um tenant padrão
  // Em produção, isso deve vir da sessão do usuário autenticado
  if (DEFAULT_TENANT_ID) {
    return DEFAULT_TENANT_ID;
  }
  
  // Se não houver tenant padrão, busca o primeiro tenant ativo
  const { prisma } = await import('./prisma');
  const tenant = await prisma.tenant.findFirst({
    where: { active: true },
    orderBy: { createdAt: 'asc' },
  });
  
  if (!tenant) {
    // Retorna string vazia em vez de erro
    // As APIs devem lidar com isso retornando dados vazios
    return '';
  }
  
  return tenant.id;
}

/**
 * Verifica se existe um tenant configurado
 */
export async function hasTenant(): Promise<boolean> {
  const { prisma } = await import('./prisma');
  const tenant = await prisma.tenant.findFirst({
    where: { active: true },
  });
  return !!tenant;
}
