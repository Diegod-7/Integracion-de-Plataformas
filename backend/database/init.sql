-- Crear la tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar productos de ejemplo
INSERT INTO products (name, description, price, category, image_url, stock) VALUES
('Taladro Eléctrico', 'Taladro eléctrico de 800W con 13 velocidades y función de percusión', 129.99, 'Herramientas Eléctricas', 'https://example.com/taladro.jpg', 15),
('Juego de Destornilladores', 'Set de 6 destornilladores de diferentes tamaños y tipos', 29.99, 'Herramientas Manuales', 'https://example.com/destornilladores.jpg', 30),
('Cinta Métrica', 'Cinta métrica de 5 metros con bloqueo automático', 12.99, 'Medición', 'https://example.com/cinta-metrica.jpg', 50),
('Martillo', 'Martillo de carpintero con mango de fibra de vidrio', 24.99, 'Herramientas Manuales', 'https://example.com/martillo.jpg', 25),
('Sierra Circular', 'Sierra circular de 1200W con guía láser', 89.99, 'Herramientas Eléctricas', 'https://example.com/sierra-circular.jpg', 10),
('Alicates', 'Alicates universales de 8 pulgadas', 19.99, 'Herramientas Manuales', 'https://example.com/alicates.jpg', 40),
('Nivel', 'Nivel de burbuja de 60cm con 3 viales', 34.99, 'Medición', 'https://example.com/nivel.jpg', 20),
('Atornillador Eléctrico', 'Atornillador inalámbrico de 18V con batería de litio', 79.99, 'Herramientas Eléctricas', 'https://example.com/atornillador.jpg', 12),
('Escalera', 'Escalera de aluminio de 5 escalones', 49.99, 'Accesorios', 'https://example.com/escalera.jpg', 8),
('Guantes de Trabajo', 'Par de guantes de trabajo resistentes', 14.99, 'Seguridad', 'https://example.com/guantes.jpg', 100); 