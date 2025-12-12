import React from 'react';
import styles from './Loader.module.css';

interface LoaderProps {
    fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ fullScreen = false }) => {
    return (
        <div className={`${styles.container} ${fullScreen ? styles.fullScreen : ''}`}>
            <div className={styles.spinner} role="status" aria-label="Loading"></div>
        </div>
    );
};

export default Loader;
