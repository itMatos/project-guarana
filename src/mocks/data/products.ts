import { Product } from '../../app/shared/models/product.model';

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Galaxy S25', description: 'Tela AMOLED de 6,2", 256 GB e câmera tripla de 50 MP.', price: 4999.0, category: 'celulares' },
  { id: 2, name: 'iPhone 17', description: 'Chip A19, 128 GB e bateria para o dia todo.', price: 7299.0, category: 'celulares' },
  { id: 3, name: 'Moto G85', description: 'Tela pOLED de 6,7", 256 GB e carregamento TurboPower.', price: 1699.0, category: 'celulares' },
  { id: 4, name: 'MacBook Air M4', description: 'Tela Liquid Retina de 13", 16 GB de RAM e SSD de 512 GB.', price: 10499.0, category: 'notebooks' },
  { id: 5, name: 'Dell Inspiron 15', description: 'Intel Core i7, 16 GB de RAM e SSD de 1 TB.', price: 5899.0, category: 'notebooks' },
  { id: 6, name: 'Lenovo IdeaPad Slim 3', description: 'AMD Ryzen 5, 8 GB de RAM e SSD de 512 GB.', price: 3199.0, category: 'notebooks' },
  { id: 7, name: 'iPad 11"', description: 'Chip A16, 128 GB e tela Liquid Retina.', price: 4299.0, category: 'tablets' },
  { id: 8, name: 'Galaxy Tab S10 FE', description: 'Tela de 10,9", 128 GB e S Pen inclusa.', price: 3499.0, category: 'tablets' },
  { id: 9, name: 'Xiaomi Pad 7', description: 'Tela 3K de 11,2", 256 GB e bateria de 8850 mAh.', price: 2799.0, category: 'tablets' }
];
