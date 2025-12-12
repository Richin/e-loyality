import React from 'react';
import styles from './shop.module.css';
import ProductList from './ProductList';

const PRODUCTS = [
    { id: '1', name: 'Running Shoes', price: 99.99 },
    { id: '2', name: 'Athletic Shorts', price: 29.99 },
    { id: '3', name: 'Water Bottle', price: 15.00 },
    { id: '4', name: 'Training Hoodie', price: 55.00 },
    { id: '5', name: 'Yoga Mat', price: 35.50 },
    { id: '6', name: 'Smart Watch', price: 199.99 },
];

export default function ShopPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Shop & Earn</h1>
                <p className={styles.subtitle}>Purchase items to earn loyalty points (1 point per $1)</p>
            </header>

            <ProductList products={PRODUCTS} />
        </div>
    );
}
