# Funcionalidad de Carga de Imágenes - TeleRed Inventory System

## ✅ Cambios Realizados

Se ha agregado la funcionalidad completa para cargar y mostrar imágenes de productos en el sistema de inventario TeleRed.

### 📦 Cambios en `app-telered.js`

1. **Seed Data actualizado**: Cada producto ahora tiene un campo `image: null` para almacenar la imagen en Base64.

   ```javascript
   { id: 'TR-001', name: 'Router WiFi 6 AX3000', category: 'Redes', stock: 42, price: 189.99, image: null }
   ```

2. **Función `create()`**: Ahora acepta y almacena el campo `image`.

3. **Función `update()`**: Actualiza el campo `image`, manteniéndolo si no se proporciona uno nuevo.

4. **Función `renderTable()`**: 
   - Agrega una columna de imagen al principio de cada fila
   - Muestra una miniatura (thumbnail) de 48x48px si hay imagen
   - Muestra "Sin imagen" si no la hay

   ```javascript
   <td class="td-img">${p.image ? `<img src="${p.image}" alt="${p.name}" class="product-thumb" />` : '<span class="no-image">Sin imagen</span>'}</td>
   ```

5. **Función `openModal()`**: 
   - Limpia el input de archivo
   - Muestra la vista previa de la imagen actual del producto (si está editando)

6. **Función `handleSave()`**: 
   - Lee el archivo de imagen seleccionado
   - Convierte la imagen a Base64 usando FileReader
   - Guarda la imagen junto con los datos del producto

7. **Función `init()`**: 
   - Agrega un event listener al input de imagen
   - Actualiza la vista previa en tiempo real mientras el usuario selecciona una imagen

### 🎨 Cambios en `index.html`

#### Estilos CSS añadidos:

```css
/* Image upload */
.image-upload-group { grid-column: 1 / -1; }
.file-input-label { /* Estilo atractivo para el área de carga */ }
#field-image { display: none; }
#image-preview { /* Contenedor para mostrar la vista previa */ }
#image-preview img { max-width: 100%; max-height: 100%; object-fit: contain; }

/* Product image thumbnail en tabla */
.td-img { text-align: center; }
.product-thumb { width: 48px; height: 48px; }
.no-image { /* Indicador cuando no hay imagen */ }
```

#### HTML del formulario modal actualizado:

Se agregó un nuevo campo de entrada de archivo:

```html
<div class="form-group image-upload-group">
  <label for="field-image" class="file-input-label">📷 Subir imagen del producto</label>
  <input id="field-image" type="file" accept="image/*" />
  <div id="image-preview"><span class="preview-placeholder">Sin imagen seleccionada</span></div>
</div>
```

#### Tabla actualizada:

Se agregó una columna para mostrar las imágenes:

```html
<thead>
  <tr>
    <th></th>  <!-- Nueva columna de imagen -->
    <th data-sort="id">SKU / ID <span class="si">↕</span></th>
    <!-- resto de columnas... -->
  </tr>
</thead>
```

## 🚀 Características

### Carga de Imágenes
- ✅ Selecciona imágenes PNG, JPG, GIF, etc.
- ✅ Vista previa en tiempo real en el formulario
- ✅ Las imágenes se guardan en Base64 (almacenadas localmente)
- ✅ Compatible con localStorage

### Visualización
- ✅ Miniaturas de 48x48px en la tabla principal
- ✅ Indicador "Sin imagen" para productos sin foto
- ✅ Vista previa grande en el modal de edición

### Datos
- ✅ Las imágenes se exportan en JSON (como Base64)
- ✅ Las imágenes persisten en localStorage
- ✅ Funciona con productos nuevos y edición de existentes

## 📝 Cómo usar

1. **Crear producto con imagen:**
   - Click en "＋ Nuevo Producto"
   - Completa los campos básicos
   - Click en "📷 Subir imagen del producto"
   - Selecciona una imagen
   - Verifica la vista previa
   - Click en "Guardar Producto"

2. **Editar imagen de producto existente:**
   - Click en "✏ Editar" en la fila del producto
   - Click en "📷 Subir imagen del producto" para cambiar
   - Selecciona una nueva imagen
   - Click en "Guardar Producto"

3. **Ver imágenes:**
   - Las miniaturas aparecen automáticamente en la tabla
   - Al editar un producto, la imagen actual se muestra en la vista previa

## 💾 Almacenamiento

Las imágenes se almacenan como Base64 en localStorage. Esto significa:
- ✅ Las imágenes persisten entre sesiones
- ✅ Se incluyen en la exportación JSON
- ⚠️ Las imágenes grandes pueden ocupar mucho espacio en localStorage
- ℹ️ El límite típico de localStorage es 5-10MB por dominio

## 🔄 Exportación JSON

Cuando exportas el inventario, las imágenes se incluyen como cadenas Base64:

```json
{
  "id": "TR-001",
  "name": "Router WiFi 6 AX3000",
  "category": "Redes",
  "stock": 42,
  "price": 189.99,
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEA..."
}
```

## 🎯 Mejoras futuras posibles

- Comprimir imágenes para optimizar almacenamiento
- Permitir URL de imágenes externas en lugar de Base64
- Galería de imágenes para cada producto
- Edición/rotación de imágenes en el navegador
- Integración con servicios de almacenamiento en la nube

---

**Sistema de Inventario TeleRed** © 2025
