import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';

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
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productLS = cart.filter(product => product.id === productId);
      if(productLS.length > 0){
          updateProductAmount({productId, amount: productLS[0].amount+1})
      }else{
        const newProduct = await api.get(`/products/${productId}`).then(res => res.data);
        newProduct.amount = 1;
        setCart([...cart, newProduct]);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, newProduct]));
      }
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const newCart = cart.filter((product:Product)=>product.id !== productId);
      if(newCart.length === cart.length) throw "Erro na remoção do produto";
      setCart([...newCart]);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const stock = await api.get(`/stock/${productId}`).then(res => res.data);

      if( amount > stock.amount || amount === 0){
        toast.error('Quantidade solicitada fora de estoque');
      } else {
        const newCart = cart;
        newCart.forEach((product:Product)=>{
          if(product.id === productId)
            product.amount = amount;
        })
        setCart([...newCart]);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      }

    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

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
