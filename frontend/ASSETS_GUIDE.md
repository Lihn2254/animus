# 🎬 Instrucciones para Agregar Imágenes Locales en Animus

## 📁 Ubicación para recursos locales: `/frontend/public/`

Si deseas agregar imágenes locales en lugar de URLs externas, sigue estos pasos:

### 1. **Estructura de carpetas recomendada**
```
frontend/
├── public/
│   ├── logo_black.svg (ya existe)
│   ├── images/
│   │   ├── students/
│   │   │   └── university-students.jpg
│   │   ├── about/
│   │   └── features/
```

### 2. **Cómo agregar imágenes locales en el código**

En lugar de:
```tsx
src="https://images.unsplash.com/..."
```

Usa:
```tsx
src="/images/students/university-students.jpg"
```

### 3. **Formatos recomendados**
- JPG/JPEG: Para fotos (mejor compresión)
- PNG: Para imágenes con transparencia
- WebP: Para mejor rendimiento (navegadores modernos)

### 4. **Tamaños y optimización**
- Ancho máximo: 1200px
- Altura máxima: 800px
- Peso: < 200KB (optimizar con herramientas como TinyPNG)

### 5. **Archivos de imagen sugeridos**
- `students-group.jpg` - Estudiantes en grupo/aula
- `campus.jpg` - Vista del campus universitario
- `classroom.jpg` - Interior de aula

---

## 🧠 **Brain 3D - Three.js en Tiempo Real**

El nuevo cerebro 3D usa:
- **Three.js**: Motor de renderizado 3D
- **React Three Fiber**: Wrapper para React
- **OrbitControls**: Rotación automática suave
- **Materiales dinámicos**: Con iluminación en tiempo real

### Características:
✅ Rotación 3D automática  
✅ Dos hemisferios con colores degradados  
✅ Centro corpus callosum luminoso  
✅ Nodos neurales decorativos  
✅ Conexiones sinápticas visibles  
✅ Múltiples luces para profundidad  
✅ Materiales reflectivos (phong)  

---

## 📦 **Dependencias Instaladas**
- `three` - Motor 3D
- `@react-three/fiber` - React renderer
- `@react-three/drei` - Utilidades 3D

Instaladas en: `frontend/package.json`

---

## 🎨 **Dónde aparecen los elementos**

### Landing Page (`/landing/page.tsx`):
1. **Header**: Logo + título (existente)
2. **Sección principal**: Texto CTA + Brain 3D mejorado
3. **Sección visual**: Imagen de estudiantes + impactos
4. **Estadísticas**: 4 columnas de datos
5. **Por qué Animus**: 6 impactos con iconos
6. **Misión/Visión/Objetivo**: 3 tarjetas
7. **Cómo funciona**: Pasos + Tecnologías
8. **Ventajas competitivas**: Comparativas
9. **Datos de mercado**: Proyecciones
10. **CTA Final**: Botones + Footer

