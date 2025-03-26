import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;
  
  // Imágenes de productos de ferretería
  private ferreteriaImages = [
    'https://cdn.pixabay.com/photo/2015/07/02/10/22/hammer-828715_960_720.jpg',
    'https://cdn.pixabay.com/photo/2016/03/26/22/22/wrench-1281743_960_720.jpg',
    'https://cdn.pixabay.com/photo/2015/07/28/20/55/tools-864983_960_720.jpg',
    'https://cdn.pixabay.com/photo/2013/07/12/19/20/pliers-154844_960_720.png',
    'https://cdn.pixabay.com/photo/2016/06/17/16/41/drill-1463831_960_720.jpg',
    'https://cdn.pixabay.com/photo/2017/06/05/15/53/drill-2374304_960_720.jpg',
    'https://cdn.pixabay.com/photo/2016/09/23/17/31/tools-1690773_960_720.jpg',
    'https://cdn.pixabay.com/photo/2015/09/14/19/13/tools-939410_960_720.jpg',
    'https://cdn.pixabay.com/photo/2015/06/25/17/56/craftsmen-821302_960_720.jpg',
    'https://cdn.pixabay.com/photo/2016/05/31/11/36/saw-1426867_960_720.jpg'
  ];

  // Constante para la imagen del kit de herramientas (index 2)
  private readonly KIT_TOOLS_IMAGE = this.ferreteriaImages[2];

  // Productos simulados
  private products: Product[] = [
    {
      id: 1,
      name: 'Martillo Profesional',
      description: 'Martillo ergonómico con mango antideslizante para uso profesional.',
      price: 14.99,
      category: 'Herramientas manuales',
      stock: 25,
      imageUrl: this.KIT_TOOLS_IMAGE
    },
    {
      id: 2,
      name: 'Juego de Llaves Ajustables',
      description: 'Set de 3 llaves ajustables de acero inoxidable con diferentes tamaños.',
      price: 29.99,
      category: 'Herramientas manuales',
      stock: 15,
      imageUrl: this.KIT_TOOLS_IMAGE
    },
    {
      id: 3,
      name: 'Kit de Herramientas (42 piezas)',
      description: 'Set completo de herramientas para el hogar con estuche organizador.',
      price: 65.50,
      category: 'Sets de herramientas',
      stock: 10,
      imageUrl: this.KIT_TOOLS_IMAGE
    },
    {
      id: 4,
      name: 'Alicate Universal',
      description: 'Alicate de alta resistencia para múltiples usos.',
      price: 9.99,
      category: 'Herramientas manuales',
      stock: 30,
      imageUrl: this.KIT_TOOLS_IMAGE
    },
    {
      id: 5,
      name: 'Taladro Inalámbrico 20V',
      description: 'Taladro sin cable con batería de larga duración y estuche.',
      price: 89.99,
      category: 'Herramientas eléctricas',
      stock: 12,
      imageUrl: this.KIT_TOOLS_IMAGE
    },
    {
      id: 6,
      name: 'Sierra Circular 1200W',
      description: 'Sierra circular con guía láser y ajuste de profundidad.',
      price: 129.99,
      category: 'Herramientas eléctricas',
      stock: 8,
      imageUrl: this.KIT_TOOLS_IMAGE
    },
    {
      id: 7,
      name: 'Destornilladores Precisión (6 piezas)',
      description: 'Juego de destornilladores de precisión para electrónica.',
      price: 12.99,
      category: 'Herramientas manuales',
      stock: 20,
      imageUrl: this.KIT_TOOLS_IMAGE
    },
    {
      id: 8,
      name: 'Nivel Láser Autonivelante',
      description: 'Nivel láser con líneas horizontales y verticales.',
      price: 49.99,
      category: 'Medición',
      stock: 10,
      imageUrl: this.KIT_TOOLS_IMAGE
    },
    {
      id: 9,
      name: 'Guantes de Trabajo (Par)',
      description: 'Guantes resistentes con refuerzo en palma y dedos.',
      price: 7.99,
      category: 'Seguridad',
      stock: 50,
      imageUrl: this.KIT_TOOLS_IMAGE
    },
    {
      id: 10,
      name: 'Sierra de Arco Profesional',
      description: 'Sierra de arco con marco de aluminio y hoja reemplazable.',
      price: 19.99,
      category: 'Herramientas manuales',
      stock: 15,
      imageUrl: this.KIT_TOOLS_IMAGE
    }
  ];

  constructor(private http: HttpClient) {
    console.log('ProductService: Inicializando servicio de productos');
    // Asegurarse de que todos los productos tengan imágenes al inicializar
    this.assignImagesToProducts();
  }

  // Método para asignar imágenes a todos los productos
  private assignImagesToProducts() {
    console.log('ProductService: Asignando imágenes a productos');
    
    this.products.forEach((product) => {
      product.imageUrl = this.KIT_TOOLS_IMAGE;
      console.log(`Producto ${product.id} (${product.name}): imagen asignada ${product.imageUrl}`);
    });
  }

  getProducts(): Observable<Product[]> {
    console.log('ProductService: Obteniendo lista de productos');
    // Asegurarse de que todos los productos tengan la imagen del kit de herramientas
    
    this.products.forEach(product => {
      product.imageUrl = this.KIT_TOOLS_IMAGE;
    });
    return of(this.products);
  }

  getProductById(id: number): Observable<Product | undefined> {
    console.log(`ProductService: Buscando producto con ID ${id}`);
    // Simular obtener un producto específico por ID
    const product = this.products.find(p => p.id === id);
    
    // Asegurarse de que el producto tenga la imagen del kit de herramientas
    if (product) {
      product.imageUrl = this.KIT_TOOLS_IMAGE;
      console.log(`Producto encontrado: ${product.name}`);
    } else {
      console.log(`No se encontró producto con ID ${id}`);
    }
    
    return of(product);
  }

  createProduct(product: Product): Observable<Product> {
    // Asignar un ID único
    const newProduct = {
      ...product,
      id: this.getNextId(),
      imageUrl: this.KIT_TOOLS_IMAGE // Siempre usar la imagen del kit de herramientas
    };
    
    // Añadir el producto al array
    this.products.push(newProduct);
    
    return of(newProduct);
  }

  updateProduct(id: number, product: Product): Observable<Product | undefined> {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      // Siempre usar la imagen del kit de herramientas
      product.imageUrl = this.KIT_TOOLS_IMAGE;
      
      this.products[index] = { ...product, id };
      return of(this.products[index]);
    }
    return of(undefined);
  }

  deleteProduct(id: number): Observable<boolean> {
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== id);
    return of(this.products.length < initialLength);
  }

  private getNextId(): number {
    return Math.max(0, ...this.products.map(p => p.id)) + 1;
  }
} 