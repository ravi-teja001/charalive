import Swal from 'sweetalert2';
// CSS will be imported in index.css to avoid module resolution issues

// SweetAlert wrapper to replace toast notifications
export const swal = {
  success: (message: string, title: string = 'Success!') => {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#10b981', // green-500
      timer: 3000,
      timerProgressBar: true,
      allowOutsideClick: true,
      allowEscapeKey: true,
    });
  },

  error: (message: string, title: string = 'Error!') => {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#ef4444', // red-500
      allowOutsideClick: true,
      allowEscapeKey: true,
      showCloseButton: true,
      customClass: {
        confirmButton: 'swal2-confirm',
      },
      buttonsStyling: true,
    });
  },

  warning: (message: string, title: string = 'Warning!') => {
    return Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#f59e0b', // amber-500
      timer: 4000,
      timerProgressBar: true,
      allowOutsideClick: true,
      allowEscapeKey: true,
    });
  },

  info: (message: string, title: string = 'Info') => {
    return Swal.fire({
      icon: 'info',
      title: title,
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#3b82f6', // blue-500
      timer: 3000,
      timerProgressBar: true,
      allowOutsideClick: true,
      allowEscapeKey: true,
    });
  },

  // For compatibility with existing toast API
  toast: {
    success: (message: string) => swal.success(message),
    error: (message: string) => swal.error(message),
    warning: (message: string) => swal.warning(message),
    info: (message: string) => swal.info(message),
  }
};

// Export as default toast replacement
export default swal;
