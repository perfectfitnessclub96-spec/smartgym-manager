// frontend/src/hooks/useToast.ts
import { showToast } from '../components/common/Toast';

export const useToast = () => {
  const showSuccess = (message: string) => {
    showToast(message, 'success');
  };

  const showError = (message: string) => {
    showToast(message, 'error');
  };

  const showWarning = (message: string) => {
    showToast(message, 'warning');
  };

  const showInfo = (message: string) => {
    showToast(message, 'info');
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToast
  };
};