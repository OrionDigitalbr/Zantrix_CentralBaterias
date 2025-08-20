# 📁 Pasta Mídia - Grupo Central

Esta pasta contém imagens e arquivos de mídia que **NÃO** são armazenados no banco de dados Supabase. São arquivos estáticos organizados por categoria.

## 📂 Estrutura de Pastas

### 🛍️ `/produtos`
- Imagens de produtos que não são enviadas via upload do sistema
- Fotos de alta resolução para catálogos
- Imagens promocionais de produtos

### 🎨 `/slides`
- Imagens para slides do carrossel da homepage
- Banners promocionais
- Imagens de campanhas

### 📂 `/categorias`
- Ícones e imagens representativas de categorias
- Banners de categorias
- Imagens para filtros de produtos

### 🏢 `/logos`
- Logotipos da empresa em diferentes formatos
- Logos de parceiros e fornecedores
- Variações de marca (horizontal, vertical, monocromático)

### 🎯 `/icones`
- Ícones personalizados do sistema
- Ícones de interface
- Símbolos e pictogramas

## 📋 Diretrizes de Uso

### ✅ **O que colocar aqui:**
- Imagens que você adiciona manualmente
- Arquivos de mídia para desenvolvimento
- Recursos gráficos estáticos
- Backups de imagens importantes

### ❌ **O que NÃO colocar aqui:**
- Imagens enviadas via upload do admin
- Fotos de perfil de usuários
- Imagens que devem ser gerenciadas pelo sistema

## 🔧 **Integração com o Sistema**

Para usar essas imagens no sistema:

1. **Via URL direta:** `/Midia/produtos/exemplo.jpg`
2. **Em componentes:** `<img src="/Midia/logos/logo.png" alt="Logo" />`
3. **Em CSS:** `background-image: url('/Midia/slides/banner.jpg')`

## 📝 **Convenções de Nomenclatura**

- Use nomes descritivos: `bateria-60ah-frontal.jpg`
- Evite espaços: use hífens ou underscores
- Inclua dimensões quando relevante: `logo-horizontal-300x100.png`
- Use formatos apropriados: `.jpg` para fotos, `.png` para logos/ícones

## 🗂️ **Organização Recomendada**

```
Midia/
├── produtos/
│   ├── baterias/
│   ├── iluminacao/
│   └── conforto/
├── slides/
│   ├── promocoes/
│   └── institucional/
├── categorias/
├── logos/
│   ├── principal/
│   └── parceiros/
└── icones/
    ├── interface/
    └── categorias/
```

---
**📅 Criado em:** 28/05/2025  
**🔄 Última atualização:** 28/05/2025  
**👨‍💻 Sistema:** Zantrix AI - Grupo Central
