# Deployment a GitHub Pages

## ✅ Problema Solucionado

**Problema original**: Los assets se cargaban desde la raíz `https://epaolillo.github.io/static/js/...` en lugar de la subcarpeta `https://epaolillo.github.io/cotizador-3d/static/js/...`

## 🔧 Solución Implementada

### 1. Configuración en `package.json`
```json
{
  "homepage": "https://epaolillo.github.io/cotizador-3d/",
  "scripts": {
    "build-gh-pages": "react-scripts build && npm run move-to-docs",
    "move-to-docs": "rm -rf docs && mv build docs",
    "deploy": "npm run build-gh-pages && git add docs && git commit -m 'Deploy to GitHub Pages' && git push"
  }
}
```

### 2. Archivos Necesarios
- ✅ `/docs/.nojekyll` - Evita que GitHub Pages use Jekyll
- ✅ `homepage` field - Define la base URL correcta
- ✅ Build automático a `/docs` - Directorio requerido por GitHub Pages

## 🚀 Proceso de Deployment

### Automático (Recomendado)
```bash
npm run deploy
```

### Manual
```bash
# 1. Build optimizado
npm run build-gh-pages

# 2. Commit y push
git add docs
git commit -m "Deploy to GitHub Pages"
git push origin main
```

## 🎯 URLs Resultantes

- **Sitio principal**: https://epaolillo.github.io/cotizador-3d/
- **Assets CSS**: https://epaolillo.github.io/cotizador-3d/static/css/main.[hash].css
- **Assets JS**: https://epaolillo.github.io/cotizador-3d/static/js/main.[hash].js
- **Manifest**: https://epaolillo.github.io/cotizador-3d/manifest.json
- **Favicon**: https://epaolillo.github.io/cotizador-3d/favicon.ico

## ⚙️ Configuración GitHub Pages

En el repositorio GitHub:
1. **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main`
4. **Folder**: `/docs`

## 🔍 Verificación

El HTML generado ahora incluye las rutas correctas:
```html
<script defer="defer" src="/cotizador-3d/static/js/main.[hash].js"></script>
<link href="/cotizador-3d/static/css/main.[hash].css" rel="stylesheet">
```

## ⚡ Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Desarrollo local |
| `npm run build` | Build local + mover a docs |
| `npm run build-gh-pages` | Build optimizado para GitHub Pages |
| `npm run deploy` | Build + commit + push automático |

## 🛠️ Troubleshooting

### Si los assets siguen sin cargar:
1. Verificar que `homepage` en `package.json` sea correcto
2. Confirmar que GitHub Pages esté configurado para usar `/docs`
3. Esperar 5-10 minutos para propagación de cambios
4. Limpiar caché del navegador

### Si hay problemas de rutas:
1. Verificar que el directorio `/docs` contenga `index.html`
2. Confirmar que existe `/docs/.nojekyll`
3. Verificar que las rutas en `index.html` tengan el prefijo `/cotizador-3d/`

## 🎉 Estado Actual

✅ **Configuración completa y funcionando**
✅ **Assets cargando desde las rutas correctas**
✅ **Deployment automatizado**
✅ **GitHub Pages configurado correctamente**

La aplicación debería estar disponible en: https://epaolillo.github.io/cotizador-3d/
