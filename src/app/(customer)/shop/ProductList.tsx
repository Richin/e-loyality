'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import styles from './shop.module.css';
import { useRouter } from 'next/navigation';

interface Product {
    id: string;
    name: string;
    price: number;
}

interface ProductListProps {
    products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
    const [buying, setBuying] = useState<string | null>(null);
    const router = useRouter();

    const handleBuy = async (product: Product) => {
        setBuying(product.id);
        try {
            const res = await fetch('/api/shop/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    productName: product.name,
                    amount: product.price
                }),
            });

            if (!res.ok) {
                alert('Purchase failed');
            } else {
                const data = await res.json();
                alert(`Purchase successful! You earned ${data.pointsEarned} points.`);
                router.refresh(); // Refresh to update points in header if we had one there
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setBuying(null);
        }
    };

    return (
        <div className={styles.grid}>
            {products.map((product) => (
                <Card key={product.id}>
                    <div className={styles.productContent}>
                        <div className={styles.productImage}>
                            [Image Placeholder]
                        </div>
                        <h3 className={styles.productName}>{product.name}</h3>
                        <span className={styles.earnLabel}>
                            Earn {Math.floor(product.price)} pts
                        </span>

                        <div className={styles.price}>${product.price.toFixed(2)}</div>

                        <Button
                            fullWidth
                            onClick={() => handleBuy(product)}
                            disabled={buying === product.id}
                        >
                            {buying === product.id ? 'Processing...' : 'Buy Now'}
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    );
}
