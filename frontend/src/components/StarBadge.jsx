import { useEffect, useState } from 'react';
import api from '../api';

export default function StarBadge({ productId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get(`/api/reviews/product/${productId}/stats`)
      .then(r => setStats(r.data))
      .catch(() => {});
  }, [productId]);

  if (!stats || stats.count === 0) return null;

  return (
    <span style={{ fontSize: '12px', color: '#f7971e', fontWeight: 700 }}>
      ★ {stats.average.toFixed(1)}
      <span style={{ color: '#aaa', fontWeight: 400 }}> ({stats.count})</span>
    </span>
  );
}