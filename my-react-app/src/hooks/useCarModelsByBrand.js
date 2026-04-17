import { useEffect, useState } from 'react';
import { apiGet } from '../utils/api';

// ดึงรุ่นรถทั้งหมดของยี่ห้อที่กำหนด (brand_id)
export default function useCarModelsByBrand(brandId) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!brandId) {
      setModels([]);
      return;
    }
    setLoading(true);
    setError(null);
    apiGet(`/api/vehicles/master/models?brand_id=${brandId}`)
      .then(res => {
        if (Array.isArray(res)) setModels(res);
        else if (res && Array.isArray(res.data)) setModels(res.data);
        else setModels([]);
      })
      .catch(e => setError(e))
      .finally(() => setLoading(false));
  }, [brandId]);

  return { models, loading, error };
}
