import React from 'react';
import styles from './Card.module.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    footer?: React.ReactNode;
}

export function Card({ children, className = '', title, footer }: CardProps) {
    return (
        <div className={`${styles.card} ${className}`}>
            {title && <div className={styles.header}><h3 className={styles.title}>{title}</h3></div>}
            <div className={styles.content}>{children}</div>
            {footer && <div className={styles.footer}>{footer}</div>}
        </div>
    );
}
