const ExcelJS = require('exceljs');
const path = require('path');

async function crearRegistroDefectos() {
    const workbook = new ExcelJS.Workbook();
    
    // Hoja principal - Registro Defectos
    const worksheet = workbook.addWorksheet('Registro Defectos');
    
    // Configurar ancho de columnas
    worksheet.columns = [
        { key: 'A', width: 8 },   // ID
        { key: 'B', width: 12 },  // ID Caso Prueba
        { key: 'C', width: 10 },  // Nº Ciclo
        { key: 'D', width: 12 },  // Fecha
        { key: 'E', width: 15 },  // Módulo
        { key: 'F', width: 40 },  // Descripción Detallada
        { key: 'G', width: 15 },  // Tipo
        { key: 'H', width: 12 },  // Severidad
        { key: 'I', width: 12 },  // Estado
        { key: 'J', width: 50 }   // Observación de equipo de desarrollo
    ];

    // Logo y título (simulado con texto)
    worksheet.getCell('A1').value = 'DuocUC';
    worksheet.getCell('A1').font = { size: 24, bold: true, color: { argb: 'FF1F4E79' } };
    
    worksheet.getCell('F2').value = 'REGISTRO DE DEFECTOS';
    worksheet.getCell('F2').font = { size: 18, bold: true };
    worksheet.getCell('F2').alignment = { horizontal: 'center' };
    worksheet.mergeCells('F2:I2');

    // Información del proyecto
    worksheet.getCell('A4').value = 'Nombre Proyecto';
    worksheet.getCell('B4').value = 'Sistema de E-commerce Ferremas';
    worksheet.getCell('A4').font = { bold: true };
    worksheet.mergeCells('B4:J4');
    worksheet.getCell('B4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } };

    worksheet.getCell('A5').value = 'Jefe proyecto';
    worksheet.getCell('B5').value = 'Diego Díaz';
    worksheet.getCell('A5').font = { bold: true };
    worksheet.mergeCells('B5:J5');
    worksheet.getCell('B5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } };

    worksheet.getCell('A6').value = 'Analista Testing';
    worksheet.getCell('B6').value = 'Diego Díaz';
    worksheet.getCell('A6').font = { bold: true };
    worksheet.mergeCells('B6:J6');
    worksheet.getCell('B6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } };

    worksheet.getCell('A7').value = 'Desarrollador';
    worksheet.getCell('B7').value = 'Diego Díaz';
    worksheet.getCell('A7').font = { bold: true };
    worksheet.mergeCells('B7:J7');
    worksheet.getCell('B7').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } };

    // Encabezados de la tabla
    const headers = [
        'ID', 'ID Caso Prueba', 'Nº Ciclo', 'Fecha', 'Módulo', 
        'Descripción Detallada', 'Tipo', 'Severidad', 'Estado', 
        'Observación de equipo de desarrollo'
    ];

    // Fila 9 - Encabezados
    headers.forEach((header, index) => {
        const cell = worksheet.getCell(9, index + 1);
        cell.value = header;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    // Datos de ejemplo de defectos
    const defectos = [
        {
            id: 'RD1',
            idCaso: 'AUTH001',
            ciclo: 1,
            fecha: '23/06/2025',
            modulo: 'Autenticación',
            descripcion: 'Al registrar usuario con email duplicado, no se muestra mensaje de error apropiado',
            tipo: 'Funcionalidad',
            severidad: 'Medio',
            estado: 'Abierto',
            observacion: 'Validar mensaje de error en endpoint /auth/register'
        },
        {
            id: 'RD2',
            idCaso: 'PROD002',
            ciclo: 1,
            fecha: '24/06/2025',
            modulo: 'Productos',
            descripcion: 'La búsqueda de productos no filtra correctamente por categoría',
            tipo: 'Funcionalidad',
            severidad: 'Medio',
            estado: 'Asignado',
            observacion: 'Revisar lógica de filtrado en controlador de productos'
        },
        {
            id: 'RD3',
            idCaso: 'PAY003',
            ciclo: 1,
            fecha: '25/06/2025',
            modulo: 'Pagos',
            descripcion: 'Transacción con monto negativo no es rechazada por validación',
            tipo: 'Funcionalidad',
            severidad: 'Crítico',
            estado: 'Abierto',
            observacion: 'Implementar validación de monto mínimo en Webpay'
        },
        {
            id: 'RD4',
            idCaso: 'SEC001',
            ciclo: 1,
            fecha: '26/06/2025',
            modulo: 'Seguridad',
            descripcion: 'Posible vulnerabilidad XSS en campo de descripción de productos',
            tipo: 'Sistema',
            severidad: 'Crítico',
            estado: 'Reportado',
            observacion: 'Sanitizar inputs en frontend y backend'
        },
        {
            id: 'RD5',
            idCaso: 'NEWS001',
            ciclo: 1,
            fecha: '27/06/2025',
            modulo: 'Newsletter',
            descripcion: 'Emails con formato internacional no son aceptados correctamente',
            tipo: 'Interfaz',
            severidad: 'Leve',
            estado: 'Corregido',
            observacion: 'Actualizar regex de validación de emails'
        }
    ];

    // Agregar datos de defectos
    defectos.forEach((defecto, index) => {
        const row = 10 + index;
        worksheet.getCell(row, 1).value = defecto.id;
        worksheet.getCell(row, 2).value = defecto.idCaso;
        worksheet.getCell(row, 3).value = defecto.ciclo;
        worksheet.getCell(row, 4).value = defecto.fecha;
        worksheet.getCell(row, 5).value = defecto.modulo;
        worksheet.getCell(row, 6).value = defecto.descripcion;
        worksheet.getCell(row, 7).value = defecto.tipo;
        worksheet.getCell(row, 8).value = defecto.severidad;
        worksheet.getCell(row, 9).value = defecto.estado;
        worksheet.getCell(row, 10).value = defecto.observacion;

        // Aplicar bordes a todas las celdas de datos
        for (let col = 1; col <= 10; col++) {
            const cell = worksheet.getCell(row, col);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            
            // Colorear filas críticas
            if (defecto.severidad === 'Crítico') {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBEE' } };
            }
        }
    });

    // Agregar filas vacías para futuros defectos (hasta fila 30)
    for (let row = 15; row <= 30; row++) {
        for (let col = 1; col <= 10; col++) {
            const cell = worksheet.getCell(row, col);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    }

    // Crear hoja de listas desplegables
    const listsSheet = workbook.addWorksheet('Severidad-Tipo-Estado');
    
    // Listas de valores
    const severidades = ['Crítico', 'Grave', 'Medio', 'Leve', 'Observación', 'Mejora'];
    const tipos = ['Documentación', 'Sintaxis', 'Interfaz', 'Ambiente', 'Datos', 'Sistema', 'Funcionalidad'];
    const estados = ['Reportado', 'Abierto', 'Asignado', 'Corregido', 'Rechazado', 'Diferido', 'Reabierto', 'Cerrado'];

    // Escribir listas en la hoja
    listsSheet.getCell('A1').value = 'Severidad';
    listsSheet.getCell('A1').font = { bold: true };
    severidades.forEach((sev, index) => {
        listsSheet.getCell(index + 2, 1).value = sev;
    });

    listsSheet.getCell('C1').value = 'Tipo';
    listsSheet.getCell('C1').font = { bold: true };
    tipos.forEach((tipo, index) => {
        listsSheet.getCell(index + 2, 3).value = tipo;
    });

    listsSheet.getCell('E1').value = 'Estado';
    listsSheet.getCell('E1').font = { bold: true };
    estados.forEach((estado, index) => {
        listsSheet.getCell(index + 2, 5).value = estado;
    });

    // Crear validaciones de datos (listas desplegables)
    // Para Severidad (columna H)
    worksheet.dataValidations.add('H10:H100', {
        type: 'list',
        allowBlank: false,
        formulae: [`"${severidades.join(',')}"`],
        showErrorMessage: true,
        errorTitle: 'Valor inválido',
        error: 'Por favor seleccione un valor de la lista'
    });

    // Para Tipo (columna G)
    worksheet.dataValidations.add('G10:G100', {
        type: 'list',
        allowBlank: false,
        formulae: [`"${tipos.join(',')}"`],
        showErrorMessage: true,
        errorTitle: 'Valor inválido',
        error: 'Por favor seleccione un valor de la lista'
    });

    // Para Estado (columna I)
    worksheet.dataValidations.add('I10:I100', {
        type: 'list',
        allowBlank: false,
        formulae: [`"${estados.join(',')}"`],
        showErrorMessage: true,
        errorTitle: 'Valor inválido',
        error: 'Por favor seleccione un valor de la lista'
    });

    // Ajustar altura de filas
    worksheet.getRow(6).height = 25;
    worksheet.getRow(9).height = 30;

    // Congelar paneles
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 9 }];

    // Guardar archivo
    const fileName = `Registro_Defectos_Ferremas_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`;
    const filePath = path.join(__dirname, 'reports', fileName);

    try {
        await workbook.xlsx.writeFile(filePath);
        console.log(`\n✅ Registro de Defectos creado exitosamente:`);
        console.log(`📁 Archivo: ${fileName}`);
        console.log(`📍 Ubicación: ${filePath}`);
        console.log(`\n📊 Contenido del archivo:`);
        console.log(`   • Formato profesional DuocUC`);
        console.log(`   • Proyecto: Sistema de E-commerce Ferremas`);
        console.log(`   • Responsable: Diego Díaz`);
        console.log(`   • ${defectos.length} defectos de ejemplo incluidos`);
        console.log(`   • Listas desplegables configuradas`);
        console.log(`   • Validaciones de datos activas`);
        console.log(`   • Formato condicional para defectos críticos`);
        
        return filePath;
    } catch (error) {
        console.error('❌ Error al crear el archivo Excel:', error);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    crearRegistroDefectos().catch(console.error);
}

module.exports = { crearRegistroDefectos }; 