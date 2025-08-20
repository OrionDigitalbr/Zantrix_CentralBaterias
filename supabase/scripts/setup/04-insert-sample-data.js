// Script para inserir dados de exemplo no banco de dados
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 Inserindo dados de exemplo...\n');

async function insertSampleData() {
  try {
    // Inserir categorias
    console.log('📂 Inserindo categorias...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .upsert([
        { name: 'Baterias', slug: 'baterias', description: 'Baterias automotivas de alta qualidade', active: true, featured: true },
        { name: 'Iluminação', slug: 'iluminacao', description: 'Produtos de iluminação para veículos', active: true, featured: true },
        { name: 'Conforto', slug: 'conforto', description: 'Itens de conforto para motoristas', active: true, featured: true },
        { name: 'Segurança', slug: 'seguranca', description: 'Equipamentos de segurança veicular', active: true, featured: true },
        { name: 'Peças Automotivas', slug: 'pecas-automotivas', description: 'Peças e acessórios automotivos', active: true, featured: true }
      ], { onConflict: 'slug' })
      .select();

    if (categoriesError) {
      console.log('❌ Erro ao inserir categorias:', categoriesError.message);
    } else {
      console.log('✅ Categorias inseridas:', categories?.length || 0);
    }

    // Inserir produtos
    console.log('🛍️ Inserindo produtos...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .upsert([
        {
          name: 'Bateria Jupiter 60Ah',
          slug: 'bateria-jupiter-60ah',
          sku: 'BAT-JUP-60',
          description: 'Bateria automotiva Jupiter 60Ah com 18 meses de garantia',
          short_description: 'Bateria 60Ah - 18 meses garantia',
          price: 299.90,
          category_id: 1,
          brand: 'Jupiter',
          featured: true,
          active: true
        },
        {
          name: 'Farol LED H4',
          slug: 'farol-led-h4',
          sku: 'LED-H4-001',
          description: 'Farol LED H4 6000K alta luminosidade',
          short_description: 'Farol LED H4 6000K',
          price: 89.90,
          category_id: 2,
          brand: 'Philips',
          featured: true,
          active: true
        },
        {
          name: 'Capa de Banco Universal',
          slug: 'capa-banco-universal',
          sku: 'CAP-BAN-001',
          description: 'Capa de banco universal em couro sintético',
          short_description: 'Capa de banco em couro sintético',
          price: 159.90,
          category_id: 3,
          brand: 'Automotiva',
          featured: false,
          active: true
        },
        {
          name: 'Kit Triângulo + Extintor',
          slug: 'kit-triangulo-extintor',
          sku: 'SEG-KIT-001',
          description: 'Kit de segurança completo com triângulo e extintor',
          short_description: 'Kit segurança completo',
          price: 89.90,
          category_id: 4,
          brand: 'Safety',
          featured: true,
          active: true
        }
      ], { onConflict: 'slug' })
      .select();

    if (productsError) {
      console.log('❌ Erro ao inserir produtos:', productsError.message);
    } else {
      console.log('✅ Produtos inseridos:', products?.length || 0);
    }

    // Inserir slides
    console.log('🖼️ Inserindo slides...');
    const { data: slides, error: slidesError } = await supabase
      .from('slides')
      .upsert([
        {
          title: 'Distribuidora de Autopeças e Baterias',
          subtitle: 'Qualidade e tradição há mais de 30 anos',
          image_url: '/placeholder.svg?height=400&width=1200&text=Slide+1',
          link_url: '/loja',
          button_text: 'Ver Produtos',
          display_order: 1,
          active: true
        },
        {
          title: 'Baterias Jupiter',
          subtitle: 'A melhor qualidade em baterias automotivas',
          image_url: '/placeholder.svg?height=400&width=1200&text=Slide+2',
          link_url: '/baterias',
          button_text: 'Conheça',
          display_order: 2,
          active: true
        },
        {
          title: 'Atendimento de Qualidade',
          subtitle: 'Equipe especializada para melhor atendê-lo',
          image_url: '/placeholder.svg?height=400&width=1200&text=Slide+3',
          link_url: '/contato',
          button_text: 'Fale Conosco',
          display_order: 3,
          active: true
        }
      ])
      .select();

    if (slidesError) {
      console.log('❌ Erro ao inserir slides:', slidesError.message);
    } else {
      console.log('✅ Slides inseridos:', slides?.length || 0);
    }

    // Inserir unidades
    console.log('🏢 Inserindo unidades...');
    const { data: units, error: unitsError } = await supabase
      .from('units')
      .upsert([
        {
          name: 'Matriz - Centro',
          address: 'Rua Principal, 123',
          city: 'São Paulo',
          state: 'SP',
          postal_code: '01000-000',
          phone: '(11) 3333-4444',
          email: 'matriz@grupocentral.com.br',
          active: true
        },
        {
          name: 'Filial - Zona Norte',
          address: 'Av. Norte, 456',
          city: 'São Paulo',
          state: 'SP',
          postal_code: '02000-000',
          phone: '(11) 3333-5555',
          email: 'norte@grupocentral.com.br',
          active: true
        },
        {
          name: 'Filial - ABC',
          address: 'Rua Industrial, 789',
          city: 'Santo André',
          state: 'SP',
          postal_code: '09000-000',
          phone: '(11) 3333-6666',
          email: 'abc@grupocentral.com.br',
          active: true
        }
      ])
      .select();

    if (unitsError) {
      console.log('❌ Erro ao inserir unidades:', unitsError.message);
    } else {
      console.log('✅ Unidades inseridas:', units?.length || 0);
    }

    console.log('\n🎉 Dados de exemplo inseridos com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

insertSampleData();
