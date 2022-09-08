import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product>({} as Product);
  const [stock, setStock] = useState<Stock[]>([]);
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    console.log("Tem isso = ", cart, "Add isso = ", productId);;
    try {
      if(cart.filter(product => product.id === productId).length > 0){
        console.log("Já tem = ", productId, "aqui = ", cart);
        //Verificar Stock e adicionar amount caso possa adicionar ainda;
        //Fazer e usar updateProductAmount;
      }else{
        console.log("Não tem = ", productId, "aqui = ", cart);
        const newProduct = await api.get(`/products/${productId}`).then(res => res.data);;
        newProduct.amount = 1;
        setCart([...cart, newProduct]);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, newProduct]));
      }
    } catch {
      console.log('Erro no addProduct',productId);
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  useEffect(() => {
    async function loadProducts() {
      api.get('/products')
        .then(res => setProducts(res.data));
    }

    async function loadStock() {
      api.get('/stock')
        .then(res => setStock(res.data));
    }

    loadProducts();
    loadStock();
  }, []);

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
