# Talos PWA - Gestión de Gastos

**Talos** es una Progressive Web App (PWA) para la gestión de gastos con capacidades móviles completas.

## 🚀 Características

- ✅ PWA completa con manifest y service worker
- 📱 Compatible con Android e iOS mediante Capacitor
- 💾 Funciona offline
- 🎨 Interfaz moderna con React
- 📊 Gestión completa de gastos personales

## 📋 Requisitos para PWABuilder

Para generar el APK con [PWABuilder](https://www.pwabuilder.com/), esta aplicación ya incluye:

### ✓ Archivos Esenciales

1. **manifest.webmanifest** - Configuración de la PWA
   - Nombre de la app
   - Iconos en diferentes tamaños
   - Colores del tema
   - Orientación de pantalla
   - Modo de visualización

2. **service-worker.js** - Para funcionalidad offline
   - Cacheo de recursos
   - Estrategias de red
   - Actualización de la app

3. **index.html** - Punto de entrada
   - Referencia al manifest
   - Registro del service worker
   - Meta tags para PWA

4. **Iconos**
   - favicon.svg
   - icon.svg  
   - Iconos adicionales en /public

## 🔧 Estructura del Proyecto

```
talos-pwa/
├── public/
│   ├── manifest.webmanifest
│   ├── service-worker.js
│   ├── favicon.svg
│   └── icon.svg
├── src/
│   ├── components/
│   ├── App.tsx
│   └── index.tsx
├── index.html
├── package.json
└── capacitor.config.ts
```

## 📱 Generar APK con PWABuilder

### Paso 1: Preparar la URL
Esta PWA necesita estar desplegada en un servidor HTTPS. Opciones:

- **GitHub Pages**: Configurar Pages en este repositorio
- **Vercel/Netlify**: Deployar automáticamente desde GitHub
- **Firebase Hosting**: Deploy manual

### Paso 2: Usar PWABuilder

1. Ve a [https://www.pwabuilder.com/](https://www.pwabuilder.com/)
2. Ingresa la URL de tu PWA desplegada
3. PWABuilder analizará automáticamente:
   - ✓ Manifest
   - ✓ Service Worker
   - ✓ Iconos
   - ✓ HTTPS
4. Clic en "Build My PWA"
5. Selecciona "Android" y descarga el APK

### Paso 3: Configuración de Android

PWABuilder generará:
- APK firmado (para pruebas)
- AAB para Google Play Store
- Configuración de TWA (Trusted Web Activity)

## 🛠️ Desarrollo Local

### Instalación

```bash
git clone https://github.com/foxmuler/talos-pwa.git
cd talos-pwa
npm install
```

### Ejecutar en desarrollo

```bash
npm run dev
```

### Build para producción

```bash
npm run build
```

### Preview del build

```bash
npm run preview
```

## 📦 Deploy

### GitHub Pages

```bash
npm run build
# Configurar GitHub Pages para servir desde /dist
```

### Vercel

```bash
vercel deploy
```

## 🔑 Configuración de Capacitor

Para desarrollo nativo:

```bash
# Android
npm run capacitor:init
npm run capacitor:add android
npm run capacitor:sync
npm run capacitor:open android

# iOS  
npm run capacitor:add ios
npm run capacitor:sync
npm run capacitor:open ios
```

## ✅ Checklist PWA

- [x] Manifest.json configurado
- [x] Service Worker registrado
- [x] HTTPS habilitado (requerido para PWA)
- [x] Iconos en múltiples tamaños
- [x] Tema configurado
- [x] Viewport meta tag
- [x] Capacidades offline

## 📝 Notas Importantes

⚠️ **Para que PWABuilder funcione correctamente:**

1. La app DEBE estar en HTTPS
2. El manifest DEBE ser accesible en `/manifest.webmanifest` o `/manifest.json`
3. El service worker DEBE estar en la raíz (`/service-worker.js`)
4. Los iconos DEBEN estar en las rutas especificadas en el manifest

## 🔗 Links Útiles

- [PWABuilder](https://www.pwabuilder.com/)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [Capacitor](https://capacitorjs.com/)
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

## 📄 Licencia

MIT

## 👤 Autor

**foxmuler**

---

💡 **Tip**: Si ves este repositorio sin los archivos del código fuente, los archivos se encuentran en la aplicación original de Google AI Studio.
