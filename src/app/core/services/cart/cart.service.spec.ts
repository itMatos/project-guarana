import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';
import { aProduct } from '../../../../testing/builders/product.builder';
import { Cart } from '../../../shared/models/cart.model';
import { CartService, LIMIT_MESSAGE, UPDATE_ERROR_MESSAGE } from './cart.service';

const { cart: CART_URL, items: ITEMS_URL } = environment.apiEndpoints.cart;

const galaxy = aProduct().withId(1).withName('Galaxy S25').withPrice(4999).withCategory('celulares').build();
const macbook = aProduct().withId(4).withName('MacBook Air M4').withPrice(10499).withCategory('notebooks').build();

const cartWith = (...items: [typeof galaxy, number][]): Cart => ({
  items: items.map(([product, quantity]) => ({ product, quantity }))
});

describe('CartService', () => {
  let service: CartService;
  let http: HttpTestingController;
  let openSnackBar: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(CartService);
    http = TestBed.inject(HttpTestingController);
    openSnackBar = vi.spyOn(TestBed.inject(MatSnackBar), 'open').mockReturnValue(undefined as never);
  });

  afterEach(() => http.verify());

  const loadWith = (cart: Cart) => {
    service.load();
    http.expectOne(CART_URL).flush(cart);
  };

  it('loads the cart and sums units and total across categories', () => {
    loadWith(cartWith([galaxy, 2], [macbook, 1]));

    expect(service.status()).toBe('ready');
    expect(service.totalQuantity()).toBe(3);
    expect(service.total()).toBe(20497);
  });

  it('marks the cart as failed when loading fails', () => {
    service.load();
    http.expectOne(CART_URL).flush({ message: 'Erro' }, { status: 500, statusText: 'Server Error' });

    expect(service.status()).toBe('error');
  });

  it('adds a product and confirms with its name', () => {
    loadWith(cartWith());

    service.add(galaxy);
    const request = http.expectOne(ITEMS_URL);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ productId: 1 });
    request.flush(cartWith([galaxy, 1]));

    expect(service.totalQuantity()).toBe(1);
    expect(openSnackBar).toHaveBeenCalledWith('Galaxy S25 adicionado ao carrinho', 'Fechar', expect.anything());
  });

  it('warns about the limit without calling the API when the product already has 10 units', () => {
    loadWith(cartWith([galaxy, 10]));

    service.add(galaxy);
    service.increase(service.items()[0]);

    http.expectNone(ITEMS_URL);
    http.expectNone(`${ITEMS_URL}/1`);
    expect(openSnackBar).toHaveBeenCalledWith(LIMIT_MESSAGE, 'Fechar', expect.anything());
    expect(service.totalQuantity()).toBe(10);
  });

  it('changes the quantity by one unit at a time', () => {
    loadWith(cartWith([galaxy, 2]));

    service.increase(service.items()[0]);
    const increase = http.expectOne(`${ITEMS_URL}/1`);
    expect(increase.request.method).toBe('PUT');
    expect(increase.request.body).toEqual({ quantity: 3 });
    increase.flush(cartWith([galaxy, 3]));

    service.decrease(service.items()[0]);
    const decrease = http.expectOne(`${ITEMS_URL}/1`);
    expect(decrease.request.body).toEqual({ quantity: 2 });
    decrease.flush(cartWith([galaxy, 2]));

    expect(service.totalQuantity()).toBe(2);
  });

  it('does not go below one unit', () => {
    loadWith(cartWith([galaxy, 1]));

    service.decrease(service.items()[0]);

    http.expectNone(`${ITEMS_URL}/1`);
  });

  it('removes a product', () => {
    loadWith(cartWith([galaxy, 2], [macbook, 1]));

    service.remove(service.items()[1]);
    const request = http.expectOne(`${ITEMS_URL}/4`);
    expect(request.request.method).toBe('DELETE');
    request.flush(cartWith([galaxy, 2]));

    expect(service.items().map((item) => item.product.name)).toEqual(['Galaxy S25']);
    expect(service.total()).toBe(9998);
  });

  it('keeps the last confirmed cart and shows an error when an update fails', () => {
    loadWith(cartWith([galaxy, 1]));

    service.increase(service.items()[0]);
    expect(service.pending()).toBe(true);
    http.expectOne(`${ITEMS_URL}/1`).flush({ message: 'Erro interno' }, { status: 500, statusText: 'Server Error' });

    expect(service.pending()).toBe(false);
    expect(service.totalQuantity()).toBe(1);
    expect(openSnackBar).toHaveBeenCalledWith(UPDATE_ERROR_MESSAGE, 'Fechar', expect.anything());
  });

  it('shows the validation message sent by the API', () => {
    loadWith(cartWith());

    service.add(galaxy);
    http.expectOne(ITEMS_URL).flush({ message: LIMIT_MESSAGE }, { status: 400, statusText: 'Bad Request' });

    expect(openSnackBar).toHaveBeenCalledWith(LIMIT_MESSAGE, 'Fechar', expect.anything());
  });

  it('clears the previous cart while reloading', () => {
    loadWith(cartWith([galaxy, 2]));

    service.load();

    expect(service.totalQuantity()).toBe(0);
    expect(service.status()).toBe('loading');
    http.expectOne(CART_URL).flush(cartWith());
  });
});
