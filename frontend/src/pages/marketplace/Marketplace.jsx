import { useMemo, useState } from 'react';
import MarketplaceHero from './components/MarketplaceHero';
import MarketplaceFilters from './components/MarketplaceFilters';
import MarketplaceGrid from './components/MarketplaceGrid';
import './styles/marketplace.css';

const products = [
  {
    id: 1,
    name: 'Paket Sayur Fresh',
    seller: 'Dapur Hijau',
    category: 'Sayur',
    price: 18000,
    oldPrice: 26000,
    location: 'Bandung',
    stock: 12,
    expiresIn: '2 hari lagi',
    image: '🥬',
    tag: 'Hemat 31%',
  },
  {
    id: 2,
    name: 'Roti Gandum Sisa Produksi',
    seller: 'Bakery Up',
    category: 'Roti',
    price: 12000,
    oldPrice: 20000,
    location: 'Jakarta',
    stock: 8,
    expiresIn: 'Besok',
    image: '🍞',
    tag: 'Cepat habis',
  },
  {
    id: 3,
    name: 'Buah Campur Rescue Box',
    seller: 'Fruit Saver',
    category: 'Buah',
    price: 25000,
    oldPrice: 38000,
    location: 'Depok',
    stock: 15,
    expiresIn: '3 hari lagi',
    image: '🍎',
    tag: 'Best deal',
  },
  {
    id: 4,
    name: 'Nasi Box Berlebih',
    seller: 'Warung Berkah',
    category: 'Makanan Siap Saji',
    price: 15000,
    oldPrice: 28000,
    location: 'Bekasi',
    stock: 6,
    expiresIn: 'Hari ini',
    image: '🍱',
    tag: 'Prioritas',
  },
];

function Marketplace() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.seller.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        category === 'Semua' || product.category === category;

      return matchSearch && matchCategory;
    });
  }, [search, category]);

  return (
    <div className="marketplace-page">
      <div className="marketplace-grid-bg"></div>
      <div className="marketplace-orb marketplace-orb-one"></div>
      <div className="marketplace-orb marketplace-orb-two"></div>

      <main className="marketplace-shell">
        <MarketplaceHero totalProducts={products.length} />

        <MarketplaceFilters
          search={search}
          category={category}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
        />

        <MarketplaceGrid products={filteredProducts} />
      </main>
    </div>
  );
}

export default Marketplace;