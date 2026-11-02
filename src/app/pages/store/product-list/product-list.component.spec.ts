import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { ProductApiService } from '../../../core/api/product/product-api.service';
import { Product } from '../../../shared/models/product.model';
import { aProduct } from '../../../../testing/builders/product.builder';
import { ProductListComponent } from './product-list.component';

const EMPTY_MESSAGE = 'Nenhum produto disponível nesta categoria.';

describe('ProductListComponent', () => {
  let response: Subject<Product[]>;

  beforeEach(async () => {
    response = new Subject<Product[]>();

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [provideRouter([]), { provide: ProductApiService, useValue: { getProducts: () => response } }]
    }).compileComponents();
  });

  const render = async () => {
    const fixture = TestBed.createComponent(ProductListComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    return { element, settle: () => fixture.whenStable() };
  };

  it('mostra o carregamento, e não a mensagem de categoria vazia, enquanto a API não responde', async () => {
    const { element } = await render();

    expect(element.querySelector('mat-spinner')).not.toBeNull();
    expect(element.textContent).not.toContain(EMPTY_MESSAGE);
  });

  it('troca o carregamento pelos produtos quando a API responde', async () => {
    const { element, settle } = await render();

    response.next([aProduct().withName('Celular de Teste').withCategory('celulares').build()]);
    await settle();

    expect(element.querySelector('mat-spinner')).toBeNull();
    expect(element.textContent).toContain('Celular de Teste');
  });

  it('mostra a mensagem de categoria vazia depois que a API responde sem produtos', async () => {
    const { element, settle } = await render();

    response.next([]);
    await settle();

    expect(element.querySelector('mat-spinner')).toBeNull();
    expect(element.textContent).toContain(EMPTY_MESSAGE);
  });

  it('encerra o carregamento quando a API falha', async () => {
    const { element, settle } = await render();

    response.error(new HttpErrorResponse({ status: 500 }));
    await settle();

    expect(element.querySelector('mat-spinner')).toBeNull();
    expect(element.textContent).toContain(EMPTY_MESSAGE);
  });
});
