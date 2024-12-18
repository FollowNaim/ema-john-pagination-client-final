import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addToDb,
  deleteShoppingCart,
  getShoppingCart,
} from "../../utilities/fakedb";
import Cart from "../Cart/Cart";
import Product from "../Product/Product";
import "./Shop.css";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [size, setSize] = useState(10);
  const totalPages = Math.ceil(totalCount / size);
  const [currentPage, setCurrentPage] = useState(0);

  const [cardProducts, setCartProducts] = useState([]);

  const handleClick = (page) => {
    setCurrentPage(page);
  };

  const handcart = async () => {
    const storedCart = getShoppingCart();
    const loadedProducts = await fetch("http://localhost:5000/productsByIds", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify([...Object.keys(storedCart)]),
    });
    const products = await loadedProducts.json();
    setCartProducts(products);
  };

  useEffect(() => {
    fetch("http://localhost:5000/products-count")
      .then((res) => res.json())
      .then((data) => setTotalCount(data.count));
  }, []);

  useEffect(() => {
    handcart();
  }, []);

  console.log("cardProducts", cardProducts);

  useEffect(() => {
    fetch(`http://localhost:5000/products?page=${currentPage}&size=${size}`)
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, [currentPage, size]);

  useEffect(() => {
    const storedCart = getShoppingCart();
    console.log("storedCart", storedCart);

    const savedCart = [];
    // step 1: get id of the addedProduct
    for (const id in storedCart) {
      // step 2: get product from products state by using id
      const addedProduct = cardProducts.find((product) => product._id === id);
      if (addedProduct) {
        // step 3: add quantity
        const quantity = storedCart[id];
        addedProduct.quantity = quantity;
        // step 4: add the added product to the saved cart
        savedCart.push(addedProduct);
      }
      // console.log('added Product', addedProduct)
    }
    // step 5: set the cart
    console.log("saved cart", savedCart);
    setCart(savedCart);
    console.log("called inside");
  }, [products, currentPage]);

  console.log("state", cart);
  console.log("local", currentPage);
  console.log("products", products);

  const handleAddToCart = (product) => {
    // cart.push(product); '
    let newCart = [];
    // const newCart = [...cart, product];
    // if product doesn't exist in the cart, then set quantity = 1
    // if exist update quantity by 1
    const exists = cart.find((pd) => pd._id === product._id);
    if (!exists) {
      product.quantity = 1;
      newCart = [...cart, product];
    } else {
      exists.quantity = exists.quantity + 1;
      const remaining = cart.filter((pd) => pd._id !== product._id);
      newCart = [...remaining, exists];
    }

    setCart(newCart);
    addToDb(product._id);
    handcart();
  };

  const handleClearCart = () => {
    setCart([]);
    deleteShoppingCart();
  };

  return (
    <div className="shop-container">
      <div className="products-container">
        {products.map((product) => (
          <Product
            key={product._id}
            product={product}
            handleAddToCart={handleAddToCart}
          ></Product>
        ))}
      </div>
      <div className="cart-container">
        <Cart cart={cart} handleClearCart={handleClearCart}>
          <Link className="proceed-link" to="/orders">
            <button className="btn-proceed">Review Order</button>
          </Link>
        </Cart>
      </div>
      <div className="pagination">
        <button
          onClick={() => {
            currentPage > 0 ? setCurrentPage(currentPage - 1) : "";
          }}
        >
          prev
        </button>
        {[...Array(totalPages).keys()].map((page) => (
          <>
            <button
              className={`${page === currentPage ? "selected" : ""}`}
              onClick={() => handleClick(page)}
            >
              {page}
            </button>
          </>
        ))}
        <button
          onClick={() => {
            currentPage < totalPages - 1 ? setCurrentPage(currentPage + 1) : "";
          }}
        >
          next
        </button>
        <div>
          <select
            name=""
            id=""
            value={size}
            onChange={(e) => {
              setSize(parseInt(e.target.value));
              setCurrentPage(0);
            }}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Shop;
