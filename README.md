# Cotizador 3D - STEINBACH

Una aplicación React moderna para cotización de proyectos de paisajismo y construcción con visualización isométrica 3D en tiempo real.

## ✨ Características

- **Mapa Isométrico 3D**: Visualización en 3D de proyectos con perspectiva isométrica
- **Herramientas Extensibles**: Sistema de herramientas modular que permite agregar nuevos materiales fácilmente
- **Cotización en Tiempo Real**: Cálculo automático de presupuestos basado en las selecciones
- **Interfaz Intuitiva**: Diseño futurista con interacciones fluidas
- **Responsive**: Funciona perfectamente en dispositivos móviles y tablets
- **Pan & Zoom**: Navegación completa del canvas con gestos táctiles
- **Click Derecho Pan**: Navega sin cambiar herramientas con click derecho
- **Instrucciones Integradas**: Guía visual de controles accesible desde el canvas

## 🛠️ Tecnologías

- **React 18+**: Framework principal con hooks modernos
- **CSS3**: Animaciones y efectos 3D nativos
- **JavaScript ES6+**: Código moderno y optimizado
- **Progressive Web App**: Funcionalidad offline con manifest

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes React reutilizables
│   ├── Home/            # Página principal
│   ├── Canvas/          # Canvas isométrico 3D
│   ├── Tile/            # Elementos individuales del grid
│   ├── Toolbar/         # Barra de herramientas
│   ├── ToolbarItem/     # Items individuales de la toolbar
│   └── BudgetPanel/     # Panel de presupuesto
├── hooks/               # Hooks personalizados
│   ├── useGrid.js       # Manejo del grid y materiales
│   ├── useBudget.js     # Cálculos de presupuesto
│   └── useCanvasInteractions.js # Interacciones del canvas
├── utils/               # Utilidades y constantes
│   ├── constants.js     # Configuración de herramientas y precios
│   ├── gridUtils.js     # Funciones auxiliares del grid
│   └── budgetUtils.js   # Funciones de cálculo de presupuesto
├── App.jsx              # Componente principal
└── index.js             # Punto de entrada
```

## 🚀 Instalación y Ejecución

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Iniciar en modo desarrollo**:
   ```bash
   npm start
   ```

3. **Construir para producción**:
   ```bash
   npm run build
   ```

## 🎮 Cómo Usar

### Herramientas Disponibles

1. **Movimiento de Suelo** - $15,000/m²
2. **Platea** - $25,000/m²
3. **Grama** - $8,000/m²
4. **Espejo de Agua** - $35,000/m²
5. **Cerca** - $12,000/m lineal
6. **Borrar** - Elimina capas aplicadas
7. **Mover** - Navega por el canvas

### Controles

- **Clic Izquierdo + Arrastrar**: Seleccionar área para aplicar material
- **Clic Derecho + Arrastrar**: Pan (mover vista) - ¡Funciona con cualquier herramienta!
- **Rueda del Mouse**: Zoom in/out en el punto del cursor
- **Herramienta Mover**: Clic izquierdo también permite pan
- **Herramienta Cerca**: Primer clic marca inicio, segundo clic coloca la cerca
- **Botón "?"**: Muestra/oculta controles en tiempo real

### Presupuesto

El panel derecho muestra automáticamente:
- Cantidad de materiales aplicados
- Precio unitario por material
- Costo total por material
- **Total general del proyecto**

## 🔧 Extensibilidad

### Agregar Nueva Herramienta

Para agregar una nueva herramienta, modifica el archivo `src/utils/constants.js`:

```javascript
export const TOOLS_CONFIG = [
  // ... herramientas existentes
  {
    id: 'nueva_herramienta',
    name: 'Nueva Herramienta',
    type: 'material',
    icon: 'nueva_herramienta',
    price: 10000,
    unit: 'm²',
    layer: {
      height: 20,
      colors: {
        top: 'linear-gradient(45deg, #color1, #color2)',
        sides: 'linear-gradient(45deg, #color2, #color3)'
      }
    }
  }
];
```

Luego agrega los estilos CSS correspondientes en `src/components/ToolbarItem/ToolbarItem.css`:

```css
.toolbar-item__icon--nueva_herramienta {
  background: linear-gradient(45deg, #color1, #color2);
}
```

## 📱 Características Responsive

- **Desktop**: Layout completo con canvas 70% y panel 30%
- **Tablet**: Canvas superior, panel inferior
- **Mobile**: Layout apilado con controles optimizados para touch
- **Landscape**: Adapta automáticamente la orientación

## 🎨 Características de Diseño

- **Tema Futurista**: Colores azules y efectos de luz
- **Animaciones Suaves**: Transiciones CSS optimizadas
- **Efectos 3D**: Perspectiva isométrica real con CSS 3D
- **Feedback Visual**: Hover states y selecciones claras
- **Typography**: Fuente Orbitron para aspecto tecnológico

## 🔄 Arquitectura

### Hooks Personalizados

- **useGrid**: Maneja estado del grid, capas y herramientas
- **useBudget**: Cálculos de presupuesto memoizados
- **useCanvasInteractions**: Pan, zoom, selección y preview

### Componentes Reutilizables

- **Tile**: Elemento individual del grid con capas 3D
- **ToolbarItem**: Item configurable de herramienta
- **BudgetPanel**: Panel de presupuesto con scroll y responsive

### Utilidades

- **constants.js**: Configuración centralizada extensible
- **gridUtils.js**: Funciones auxiliares para cálculos del grid
- **budgetUtils.js**: Formateo de precios y cálculos

## 🚀 Características Avanzadas

- **Memoización**: Componentes y cálculos optimizados
- **Event Handling**: Gestión eficiente de eventos del mouse/touch
- **State Management**: Estado local con hooks personalizados
- **Performance**: Renderizado optimizado para grids grandes
- **Accessibility**: Controles accesibles y navegación por teclado

## 📄 Licencia

Este proyecto fue desarrollado para STEINBACH como una aplicación de cotización personalizada.
