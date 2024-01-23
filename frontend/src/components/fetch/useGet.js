import { useState, useEffect } from 'react';

const useGet = (url, method, bodyData = null) => {
  const [data, setData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const options = {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        };

        if (bodyData) {
          options.body = JSON.stringify(bodyData);
        }

        const response = await fetch(`http://localhost:8080${url}`, options);

        if (!response.ok) {
          throw new Error(response.statusText || 'Server response not OK');
        }

        const responseData = await response.json();
        setData(responseData);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchData();
  }, [url, method, bodyData]);

  return { data, isLoaded, error };
};
///Usage example:
// const { error, isLoaded, data } = useGet(`/users?id=${userId}`, 'GET');

// useEffect(() => {
//   if (data && Array.isArray(data.data) && data.data.length > 0) {
//     const userPublicStatus = data.data[0].public;
//     const isChecked = userPublicStatus === 0;
//     localStorage.setItem('isChecked', isChecked);
//     console.log('useGet Data:', data);
//   }
// }, [data, isLoaded, error]);

// if (!isLoaded) return <div>Loading...</div>;
// if (error) return <div>Error: {error.message}</div>;

export default useGet;
