import { useEffect, useState } from 'react';
import { apiGet } from '@/utils/api';
import type { CarModel, ApiEnvelope } from '@/types';

interface UseCarModelsResult {
  models: CarModel[];
  loading: boolean;
  error: unknown;
}

// ดึงรุ่นรถทั้งหมดของยี่ห้อที่กำหนด (brand_id)
export default function useCarModelsByBrand(brandId: number | string | null | undefined): UseCarModelsResult {
  const [models, setModels] = useState<CarModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!brandId) {
      setModels([]);
      return;
    }
    setLoading(true);
    setError(null);
    apiGet<CarModel[] | ApiEnvelope<CarModel[]>>(`/api/vehicles/master/models?brand_id=${brandId}`)
      .then((res) => {
        if (Array.isArray(res)) setModels(res);
        else if (res && Array.isArray(res.data)) setModels(res.data);
        else setModels([]);
      })
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, [brandId]);

  return { models, loading, error };
}
