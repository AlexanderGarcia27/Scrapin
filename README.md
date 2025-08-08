# Scrapin-OCC - Buscador de Vacantes

Una aplicación web para buscar y extraer información de vacantes de OCC.com.mx usando Puppeteer.

## Características

- Búsqueda de vacantes en tiempo real
- Generación de archivos en múltiples formatos (JSON, CSV, Excel, PDF)
- Interfaz web moderna y responsive
- Despliegue en Vercel

## Despliegue en Vercel

### 1. Preparación

Asegúrate de que todos los archivos estén en su lugar:
- `web-interface/` - Contiene la interfaz web y el servidor
- `scrape.js` - Script principal de scraping
- `vercel.json` - Configuración de Vercel
- `package.json` - Dependencias del proyecto

### 2. Variables de Entorno

En Vercel, configura las siguientes variables de entorno:
- `VERCEL=1`
- `NODE_ENV=production`

### 3. Despliegue

1. Conecta tu repositorio a Vercel
2. Vercel detectará automáticamente la configuración
3. El despliegue puede tomar varios minutos debido a las dependencias

### 4. Limitaciones de Vercel

- **Timeout**: Las funciones serverless tienen un límite de 300 segundos
- **Memoria**: Limitada a 1024MB por defecto
- **Puppeteer**: Requiere configuración especial para funcionar en serverless

## Desarrollo Local

### Instalación

```bash
npm install
cd web-interface
npm install
```

### Ejecución

```bash
# Para el scraping directo
npm start

# Para la interfaz web
cd web-interface
npm start
```

## Estructura del Proyecto

```
Scrapin-OCC/
├── scrape.js              # Script principal de scraping
├── vercel.json            # Configuración de Vercel
├── package.json           # Dependencias principales
└── web-interface/
    ├── server.js          # Servidor Express
    ├── index.html         # Página principal
    ├── vacantes.html      # Página de resultados
    └── package.json       # Dependencias del servidor
```

## Solución de Problemas

### Error de Conexión
- Verifica que el servidor esté ejecutándose
- Revisa los logs de Vercel para errores específicos
- Asegúrate de que todas las dependencias estén instaladas

### Timeout en Vercel
- El scraping puede tomar más de 5 minutos
- Considera implementar un sistema de cola para trabajos largos
- Usa la configuración de timeout extendida en `vercel.json`

### Problemas con Puppeteer
- La configuración especial para Vercel está en `scrape.js`
- Se usan argumentos específicos para serverless
- Considera usar un servicio de navegador headless como alternativa

## Archivos Generados

La aplicación genera los siguientes archivos:
- `resultados.json` - Datos en formato JSON
- `resultados.csv` - Datos en formato CSV
- `resultados.xlsx` - Datos en formato Excel
- `resultados.pdf` - Reporte en PDF

## Tecnologías Utilizadas

- **Backend**: Node.js, Express, Puppeteer
- **Frontend**: HTML, CSS (Tailwind), JavaScript
- **Procesamiento**: json2csv, xlsx, pdfkit
- **Despliegue**: Vercel
