export function getErrorMessage(error) {
  if (error?.code === 'ECONNABORTED' || error?.message?.toLowerCase().includes('timeout')) {
    return 'Server response timed out. If the backend is waking up from sleep mode, please wait a moment and try submitting again.';
  }
  if (error?.message === 'Network Error') {
    return 'Unable to reach the server. Please check your internet connection and verify VITE_API_BASE_URL is properly configured.';
  }
  return error?.response?.data?.message ?? error?.message ?? 'Something went wrong';
}
