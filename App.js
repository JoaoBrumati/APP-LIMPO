import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import axios from 'axios';

const App = () => {
  const [conversionRate, setConversionRate] = useState(null);
  const [result, setResult] = useState(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await axios.get('https://open.er-api.com/v6/latest/USD');
        setConversionRate(response.data.rates);
      } catch (error) {
        console.error("Erro ao buscar a taxa de câmbio:", error);
      }
    };

    fetchExchangeRate();
  }, []);

  const calculate = () => {
    const valueToConvert = parseFloat(inputValue);
    if (conversionRate && !isNaN(valueToConvert)) {
      const convertedValue = valueToConvert * conversionRate['EUR'];
      setResult(convertedValue);
    } else {
      setResult(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Taxa de Câmbio (USD para EUR): {conversionRate ? conversionRate['EUR'] : 'Carregando...'}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o valor em USD"
        keyboardType="numeric"
        value={inputValue}
        onChangeText={setInputValue}
      />
      <Button title="Calcular" onPress={calculate} />
      {result !== null && <Text style={styles.text}>Resultado da conversão: {result.toFixed(2)} EUR</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginBottom: 20,
    fontSize: 18,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
});

export default App;
