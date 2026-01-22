import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * Health Check - Diagnóstico de conexão
 */
export async function GET() {
    const diagnostics: any = {
        timestamp: new Date().toISOString(),
        env: {
            DATABASE_URL: !!process.env.DATABASE_URL,
            DATABASE_URL_preview: process.env.DATABASE_URL ? 
                process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@').substring(0, 80) + '...' : 'NOT SET',
            DIRECT_URL: !!process.env.DIRECT_URL,
            DIRECT_URL_preview: process.env.DIRECT_URL ? 
                process.env.DIRECT_URL.replace(/:[^:@]+@/, ':****@').substring(0, 80) + '...' : 'NOT SET',
            NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
        database: {
            connected: false,
            error: null as string | null,
            tenantCount: 0,
        }
    };

    try {
        const { default: prisma } = await import("@/lib/prisma");
        
        // Tenta contar tenants
        const count = await prisma.tenant.count();
        diagnostics.database.connected = true;
        diagnostics.database.tenantCount = count;
    } catch (error: any) {
        diagnostics.database.connected = false;
        diagnostics.database.error = error.message || 'Unknown error';
    }

    return NextResponse.json(diagnostics, {
        status: diagnostics.database.connected ? 200 : 503
    });
}


