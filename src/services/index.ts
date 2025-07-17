
import { mockApiService } from './mockApi';
import { apiService } from './api';

// 根据环境变量决定使用哪个API
const useRealApi = import.meta.env.VITE_USE_REAL_API === 'true' || true;
console.log(`API Service: Using ${useRealApi ? 'Real' : 'Mock'} API`);

export const api = useRealApi ? apiService : mockApiService;

// 也可以根据需要单独导出
export { mockApiService as mockApi, apiService as realApi };
