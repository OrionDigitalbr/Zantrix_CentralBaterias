// Script para criar todas as tabelas do banco de dados
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 Criando tabelas do banco de dados...\n');

async function createTables() {
  try {
    // Criar tabela de roles
    console.log('👥 Criando tabela roles...');
    const { error: rolesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS roles (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) UNIQUE NOT NULL,
          description TEXT,
          permissions JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (rolesError) {
      console.log('❌ Erro ao criar tabela roles:', rolesError.message);
    } else {
      console.log('✅ Tabela roles criada');
    }

    // Criar tabela de users
    console.log('👤 Criando tabela users...');
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          role_id INTEGER REFERENCES roles(id) DEFAULT 1,
          avatar_url TEXT,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (usersError) {
      console.log('❌ Erro ao criar tabela users:', usersError.message);
    } else {
      console.log('✅ Tabela users criada');
    }

    // Criar tabela de categories
    console.log('📂 Criando tabela categories...');
    const { error: categoriesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          image_url TEXT,
          parent_id INTEGER REFERENCES categories(id),
          display_order INTEGER DEFAULT 0,
          active BOOLEAN DEFAULT true,
          featured BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (categoriesError) {
      console.log('❌ Erro ao criar tabela categories:', categoriesError.message);
    } else {
      console.log('✅ Tabela categories criada');
    }

    // Criar tabela de products
    console.log('🛍️ Criando tabela products...');
    const { error: productsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          sku VARCHAR(100) UNIQUE,
          description TEXT,
          short_description TEXT,
          price DECIMAL(10,2),
          promotional_price DECIMAL(10,2),
          cost_price DECIMAL(10,2),
          category_id INTEGER REFERENCES categories(id),
          brand VARCHAR(255),
          model VARCHAR(255),
          weight DECIMAL(8,3),
          dimensions JSONB,
          stock_quantity INTEGER DEFAULT 0,
          min_stock INTEGER DEFAULT 0,
          max_stock INTEGER DEFAULT 1000,
          featured BOOLEAN DEFAULT false,
          active BOOLEAN DEFAULT true,
          meta_title VARCHAR(255),
          meta_description TEXT,
          tags TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (productsError) {
      console.log('❌ Erro ao criar tabela products:', productsError.message);
    } else {
      console.log('✅ Tabela products criada');
    }

    // Criar tabela de product_images
    console.log('🖼️ Criando tabela product_images...');
    const { error: imagesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS product_images (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          alt_text VARCHAR(255),
          display_order INTEGER DEFAULT 0,
          is_primary BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (imagesError) {
      console.log('❌ Erro ao criar tabela product_images:', imagesError.message);
    } else {
      console.log('✅ Tabela product_images criada');
    }

    // Criar tabela de slides
    console.log('🎠 Criando tabela slides...');
    const { error: slidesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS slides (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subtitle TEXT,
          description TEXT,
          image_url TEXT NOT NULL,
          mobile_image_url TEXT,
          link_url TEXT,
          button_text VARCHAR(100),
          display_order INTEGER DEFAULT 0,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (slidesError) {
      console.log('❌ Erro ao criar tabela slides:', slidesError.message);
    } else {
      console.log('✅ Tabela slides criada');
    }

    // Criar tabela de units
    console.log('🏢 Criando tabela units...');
    const { error: unitsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS units (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          address TEXT NOT NULL,
          city VARCHAR(255) NOT NULL,
          state VARCHAR(2) NOT NULL,
          postal_code VARCHAR(20),
          phone VARCHAR(20),
          email VARCHAR(255),
          manager_name VARCHAR(255),
          opening_hours JSONB,
          coordinates POINT,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (unitsError) {
      console.log('❌ Erro ao criar tabela units:', unitsError.message);
    } else {
      console.log('✅ Tabela units criada');
    }

    // Criar tabela de notifications
    console.log('🔔 Criando tabela notifications...');
    const { error: notificationsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'info',
          user_id UUID REFERENCES users(id),
          read BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (notificationsError) {
      console.log('❌ Erro ao criar tabela notifications:', notificationsError.message);
    } else {
      console.log('✅ Tabela notifications criada');
    }

    // Criar tabela de analytics
    console.log('📊 Criando tabela analytics...');
    const { error: analyticsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS analytics (
          id SERIAL PRIMARY KEY,
          event_type VARCHAR(100) NOT NULL,
          page_url TEXT,
          user_agent TEXT,
          ip_address INET,
          session_id VARCHAR(255),
          user_id UUID REFERENCES users(id),
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (analyticsError) {
      console.log('❌ Erro ao criar tabela analytics:', analyticsError.message);
    } else {
      console.log('✅ Tabela analytics criada');
    }

    console.log('\n🎉 Todas as tabelas foram criadas com sucesso!');
    console.log('📝 Próximo passo: Execute o script de criação de buckets');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

createTables();
