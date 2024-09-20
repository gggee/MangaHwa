import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginUser = async (email, password) => {
  try {
    const response = await fetch('http://192.168.0.105:3000/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error('Ошибка при входе: ' + response.statusText);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка при входе:', error);
    throw error;
  }
};
