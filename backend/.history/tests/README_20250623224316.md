# �� Sistema de Pruebas Completo - E-commerce Ferremas

## 📋 Resumen del Sistema

Este sistema de pruebas exhaustivo cubre **25 casos de prueba principales** con más de **500 validaciones individuales** para el backend del e-commerce Ferremas.

### 📊 Estadísticas del Sistema
- **Casos de Prueba**: 25 casos principales
- **Validaciones Totales**: 500+ pruebas individuales
- **Archivos de Prueba**: 9 archivos especializados
- **Categorías**: 8 categorías de pruebas
- **Cobertura**: Funcional, Seguridad, Performance, Integración, API Validation, Stress Testing

## 🗂️ Estructura de Archivos

```
tests/
├── 🔐 auth.test.js                 # Autenticación (70+ pruebas)
├── 📦 products.test.js             # Productos (90+ pruebas)
├── 📧 newsletter.test.js           # Newsletter (70+ pruebas)
├── 💳 webpay.test.js              # Webpay (80+ pruebas)
├── 🔒 security.test.js            # Seguridad (100+ pruebas)
├── ⚡ performance.test.js          # Performance (40+ pruebas)
├── 🔗 integration.test.js         # Integración (30+ pruebas)
├── 🔍 api-validation.test.js      # Validación API (50+ pruebas)
├── 🔥 stress-testing.test.js      # Stress Testing (20+ pruebas)
├── 📊 excel-generator-professional.js
├── ⚙️ jest.config.js
├── 🔧 setup.js
├── 🌍 env-setup.js
└── 📈 custom-sequencer.js
```

## 🎯 Categorías de Pruebas

### 1. 🔐 **Autenticación** (auth.test.js)
- **Registro de Usuario**: 23 validaciones
  - Casos exitosos y validaciones básicas
  - Validaciones avanzadas de formato
  - Edge cases con caracteres especiales
  - Validaciones de longitud y tipos de datos
- **Inicio de Sesión**: 11 validaciones
- **Seguridad de Tokens**: 6 validaciones

### 2. 📦 **Productos** (products.test.js)
- **CRUD Básico**: 8 operaciones
- **Validaciones Avanzadas**: 29 validaciones específicas
  - Tipos de datos incorrectos
  - Límites de longitud
  - Caracteres especiales y Unicode
  - Validaciones de precio y stock
- **Paginación y Filtros**: 8 funcionalidades

### 3. 📧 **Newsletter** (newsletter.test.js)
- **Suscripción Básica**: 8 casos válidos
- **Validación de Emails**: 15+ formatos inválidos
- **Casos Especiales**: Duplicados, Unicode, edge cases

### 4. 💳 **Webpay** (webpay.test.js)
- **Transacciones Básicas**: 6 validaciones
- **Validaciones de Monto**: 7 casos específicos
- **Validaciones de Parámetros**: 8 validaciones
- **Confirmación**: 7 casos de prueba

### 5. 🔒 **Seguridad** (security.test.js)
- **Inyección SQL**: 14 payloads diferentes
- **Cross-Site Scripting (XSS)**: 15 vectores de ataque
- **Autenticación/Autorización**: Tokens, endpoints protegidos
- **Headers Maliciosos**: Ataques de headers HTTP

### 6. ⚡ **Performance** (performance.test.js)
- **Tiempos de Respuesta**: 5 endpoints medidos
- **Carga Concurrente**: 5 escenarios simultáneos
- **Stress Testing**: Pruebas de límites
- **Throughput**: Medición de rendimiento

### 7. 🔗 **Integración** (integration.test.js)
- **Flujos End-to-End**: 3 flujos completos
- **Integración entre Módulos**: Validación cruzada
- **Manejo de Errores**: Recuperación y rollback

### 8. 🔍 **API Validation** (api-validation.test.js) - **NUEVO**
- **Headers HTTP**: Content-Type, headers maliciosos
- **Métodos HTTP**: Validación de métodos y rutas
- **Validación de Payloads**: Tipos de datos, estructuras
- **Encoding**: UTF-8, Unicode, caracteres especiales
- **Límites**: Payloads grandes, objetos complejos

### 9. 🔥 **Stress Testing** (stress-testing.test.js) - **NUEVO**
- **Carga Extrema**: 100+ requests simultáneos
- **Memoria y Recursos**: Payloads de 1MB+
- **Recuperación**: Comportamiento post-sobrecarga
- **Casos Extremos**: Ataques simulados

## 🚀 Comandos de Ejecución

### Comandos Básicos
```bash
npm test                    # Todas las pruebas
npm run test:coverage      # Con cobertura
npm run test:watch         # Modo watch
```

### Comandos por Módulo
```bash
npm run test:auth          # Solo autenticación
npm run test:products      # Solo productos
npm run test:newsletter    # Solo newsletter
npm run test:webpay        # Solo Webpay
npm run test:security      # Solo seguridad
npm run test:performance   # Solo performance
npm run test:integration   # Solo integración
npm run test:api-validation # Solo validación API
npm run test:stress        # Solo stress testing
```

### Comandos Agrupados
```bash
npm run test:basic         # Pruebas básicas (auth, products, newsletter, webpay)
npm run test:advanced      # Pruebas avanzadas (security, performance, integration, api-validation)
npm run test:quick         # Pruebas rápidas (sin stress testing ni performance)
npm run test:ci            # Para CI/CD (sin pruebas pesadas)
npm run test:all-extended  # Todas las pruebas en secuencia
```

### Generación de Reportes
```bash
npm run generate-excel-professional  # Reporte Excel completo
npm run test-and-report              # Ejecutar pruebas y generar reporte
npm run show-summary                 # Mostrar resumen
```

## ⚙️ Configuración

### Jest Configuration
- **Timeout**: 60 segundos (para pruebas de stress)
- **Workers**: 75% de CPU disponible
- **Cobertura**: Umbrales configurados
- **Retry**: 1 reintento para pruebas inestables

### Variables de Entorno
```javascript
// tests/env-setup.js
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
// ... más configuraciones
```

## 📈 Casos de Prueba Detallados

### CASO001 - Autenticación: Registro
- ✅ Registro exitoso con datos válidos
- ❌ Error al registrar email duplicado
- ❌ Validaciones de campos requeridos
- ❌ Validaciones de formato de email
- ❌ Validaciones de longitud
- ❌ Validaciones de caracteres especiales
- ❌ Validaciones de tipos de datos
- ❌ Validaciones de payload grande
- ❌ Validaciones Unicode y emojis

### CASO005 - Productos: Validaciones Avanzadas
- ❌ Precio como string, array, objeto
- ❌ Precio infinito, NaN, científico
- ❌ Stock decimal, muy grande
- ❌ Nombres con caracteres de control
- ❌ Descripciones extremadamente largas
- ❌ Caracteres RTL maliciosos
- ❌ JSON malformado
- ❌ Campos adicionales no permitidos

### CASO023 - API Validation: Headers HTTP
- ✅ Content-Type application/json válido
- ❌ Content-Type inválido para JSON
- ❌ Headers con caracteres especiales
- ❌ Headers extremadamente largos
- ❌ Múltiples headers duplicados
- ❌ Métodos HTTP no permitidos

### CASO025 - Stress Testing: Límites Extremos
- 🚀 100 requests simultáneos
- 💣 50 creaciones de productos simultáneas
- 📧 75 suscripciones newsletter simultáneas
- 📊 Payloads de 1MB+
- 💪 Recuperación después de sobrecarga

## 🔧 Características Avanzadas

### Secuenciador Personalizado
- Orden específico de ejecución
- Pruebas básicas primero
- Pruebas de stress al final

### Manejo de Errores
- Retry automático para pruebas inestables
- Timeout configurables por tipo de prueba
- Manejo de recursos y memoria

### Reportes Detallados
- HTML reports con Jest
- Excel reports profesionales
- Métricas de performance
- Análisis de cobertura

## 📊 Métricas de Cobertura

### Objetivos de Cobertura
- **Branches**: 60%
- **Functions**: 70%
- **Lines**: 75%
- **Statements**: 75%

### Archivos Cubiertos
- Controllers, Routes, Models
- Services, Middlewares
- Archivo principal (index.js)

## 🎯 Casos de Uso Específicos

### Para Desarrollo
```bash
npm run test:watch        # Desarrollo activo
npm run test:quick        # Pruebas rápidas
npm run test:basic        # Funcionalidad básica
```

### Para CI/CD
```bash
npm run test:ci           # Sin pruebas pesadas
npm run test:coverage     # Con métricas
```

### Para QA
```bash
npm run test:all-extended # Suite completa
npm run test:stress       # Pruebas de límites
npm run test:security     # Validaciones de seguridad
```

## 🚨 Consideraciones Importantes

### Performance
- Las pruebas de stress pueden tomar varios minutos
- Usar `--runInBand` para pruebas secuenciales
- Limitar workers para pruebas pesadas

### Memoria
- Algunas pruebas usan payloads de 1MB+
- Configurar límites de memoria apropiados
- Monitorear uso de recursos

### Estabilidad
- Retry configurado para pruebas inestables
- Timeouts ajustados por tipo de prueba
- Manejo de condiciones de carrera

## 👥 Responsable

**Diego Díaz** - Responsable técnico del sistema de pruebas

---

*Sistema de pruebas desarrollado para garantizar la máxima calidad y robustez del backend E-commerce Ferremas* 