export function formatDate(inputDateString) {
  // Parse the input date string
  const inputDate = new Date(inputDateString); // NB! Adds 2 hours to the date

  // Format the date components
  const day = String(inputDate.getDate()).padStart(2, '0');
  const month = String(inputDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = inputDate.getFullYear();
  const hours = String(inputDate.getHours()).padStart(2, '0');
  const minutes = String(inputDate.getMinutes()).padStart(2, '0');

  // Construct the formatted date string
  const formattedDateString = `${day}.${month}.${year} ${hours}:${minutes}`;

  return formattedDateString;
}
export function ImageValidation(file) {
  // file size validation
  const maxAllowedSize = 1024 * 1024; // 1MB
  if (file.size > maxAllowedSize) {
    return 'Image size must be less than 1MB';
  }
  // file type validation
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return 'Only png, jpg, jpeg and gif are allowed';
  }
  return '';
}
