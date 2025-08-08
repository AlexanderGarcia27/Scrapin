import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeOCC } from '../scrape.js';
import fs from 'fs';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuraciones para Vercel
const isVercel = process.env.VERCEL === '1';
if (isVercel) {
  // Configuraciones específicas para Vercel
  process.env.NODE_ENV = 'production';
  console.log('🚀 Ejecutando en Vercel');
}

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Servir el archivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint para buscar
app.post('/search', async (req, res) => {
    try {
        const { searchTerm } = req.body;
        
        if (!searchTerm || !searchTerm.trim()) {
            return res.json({ success: false, error: 'Término de búsqueda requerido' });
        }

        console.log(`🔍 Buscando: ${searchTerm}`);
        
        // Configurar timeout más largo para Vercel
        const timeout = isVercel ? 280000 : 60000; // 280s para Vercel, 60s para local
        
        // Crear una promesa con timeout
        const searchPromise = new Promise(async (resolve, reject) => {
            try {
                if (isVercel) {
                    // En Vercel, usar configuración especial para Puppeteer
                    console.log('🔄 Iniciando scraping con configuración de Vercel...');
                    const results = await scrapeOCC(searchTerm.trim(), true);
                    resolve(results);
                } else {
                    // En desarrollo local
                    console.log('🔄 Iniciando scraping local...');
                    const results = await scrapeOCC(searchTerm.trim());
                    resolve(results);
                }
            } catch (error) {
                reject(error);
            }
        });

        // Ejecutar con timeout
        const results = await Promise.race([
            searchPromise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout: La búsqueda tomó demasiado tiempo')), timeout)
            )
        ]);
        
        if (results.length === 0) {
            return res.json({ success: false, error: 'No se encontraron vacantes' });
        }

        console.log(`✅ Búsqueda completada: ${results.length} vacantes encontradas`);
        res.json({ 
            success: true, 
            message: `Se encontraron ${results.length} vacantes y se generaron los archivos`
        });

    } catch (error) {
        console.error('❌ Error en la búsqueda:', error);
        
        let errorMessage = 'Error al procesar la búsqueda';
        if (error.message.includes('Timeout')) {
            errorMessage = 'La búsqueda tomó demasiado tiempo. Intenta con un término más específico.';
        } else if (error.message.includes('puppeteer')) {
            errorMessage = 'Error con el navegador. Intenta de nuevo.';
        } else if (error.message.includes('memory')) {
            errorMessage = 'Error de memoria. Intenta con menos resultados.';
        } else {
            errorMessage = 'Error al procesar la búsqueda: ' + error.message;
        }
        
        res.json({ success: false, error: errorMessage });
    }
});

// Servir resultados.json desde la raíz del proyecto
app.get('/resultados.json', (req, res) => {
  const filePath = path.join(__dirname, '..', 'resultados.json');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send({ error: 'No hay resultados.json' });
  }
});

// Servir resultados.csv
app.get('/resultados.csv', (req, res) => {
  const filePath = path.join(__dirname, '..', 'resultados.csv');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="resultados.csv"');
    res.sendFile(filePath);
  } else {
    res.status(404).send({ error: 'No hay resultados.csv' });
  }
});

// Servir resultados.xlsx
app.get('/resultados.xlsx', (req, res) => {
  const filePath = path.join(__dirname, '..', 'resultados.xlsx');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="resultados.xlsx"');
    res.sendFile(filePath);
  } else {
    res.status(404).send({ error: 'No hay resultados.xlsx' });
  }
});

// Servir resultados.pdf
app.get('/resultados.pdf', (req, res) => {
  const filePath = path.join(__dirname, '..', 'resultados.pdf');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resultados.pdf"');
    res.sendFile(filePath);
  } else {
    res.status(404).send({ error: 'No hay resultados.pdf' });
  }
});

// Endpoint proxy para geocodificación
app.get('/geocode', async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ error: 'Falta el parámetro q' });
    }
    const apiKey = 'pk.8e189bb0bea1772e515ad047bed32836';
    const url = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(q)}&countrycodes=mx&format=json&limit=1&addressdetails=1`;
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Scrapin-OCC/1.0 (tuemail@dominio.com)'
            }
        });
        if (!response.ok) {
            return res.status(500).json({ error: 'Error al consultar LocationIQ' });
        }
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error al buscar la ubicación' });
    }
});

// En Vercel exportamos la app en vez de escuchar
export default app;
