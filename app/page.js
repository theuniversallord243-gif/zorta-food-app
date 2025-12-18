import Link from 'next/link';
import { ChefHat, User, ArrowRight } from 'lucide-react';
import styles from './home.module.css';

export default function Home() {
  return (
    <main className="container flex-col flex-center" style={{ minHeight: '100vh', padding: '2rem' }}>

      <div className="flex-col flex-center gap-4 fade-in" style={{ marginBottom: '3rem' }}>
        <div className={styles.logoBadge}>
          <ChefHat size={32} color="white" />
        </div>
        <h1 className={styles.title}>Zorta</h1>
        <p className={styles.tagline}>Scan, Order, Relax</p>
      </div>

      <div className="w-full flex-col gap-4 fade-in" style={{ animationDelay: '0.1s' }}>

        {/* Admin Card */}
        <Link href="/admin" className={styles.roleCard}>
          <div className={styles.iconCircle}>
            <ChefHat size={24} />
          </div>
          <div className="flex-col">
            <h3 className={styles.cardTitle}>Admin</h3>
            <p className={styles.cardDesc}>Manage Shop & Orders</p>
          </div>
          <ArrowRight className={styles.arrow} size={20} />
        </Link>

        {/* User Card */}
        <Link href="/user/login" className={styles.roleCard}>
          <div className={styles.iconCircle} style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <User size={24} />
          </div>
          <div className="flex-col">
            <h3 className={styles.cardTitle}>Customer</h3>
            <p className={styles.cardDesc}>Place an Order</p>
          </div>
          <ArrowRight className={styles.arrow} size={20} />
        </Link>

      </div>

    </main>
  );
}
