import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const API_URL = 'https://api.api-futebol.com.br/v1/campeonatos/10/rodadas/';
const API_KEY = 'live_5d453807c87061191fdf1f3486d64f';

const App = () => {
  const [rodadas, setRodadas] = useState([]); // Estado para armazenar as rodadas
  const [matches, setMatches] = useState([]); // Estado para armazenar os jogos de uma rodada
  const [loadingRodadas, setLoadingRodadas] = useState(true); // Controle de carregamento das rodadas
  const [loadingMatches, setLoadingMatches] = useState(false); // Controle de carregamento dos jogos
  const [error, setError] = useState(null);
  const [selectedRodada, setSelectedRodada] = useState(null); // Rodada selecionada pelo usuário

  // Cache para rodadas
  let rodadasCache = null;

  // Função para buscar as rodadas do campeonato
  const fetchRodadas = async () => {
    if (rodadasCache) {
      setRodadas(rodadasCache);
      setLoadingRodadas(false);
      return;
    }

    try {
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      rodadasCache = response.data; // Armazena em cache
      setRodadas(response.data);
    } catch (error) {
      console.error("Erro ao buscar rodadas:", error);
      setError("Erro ao buscar rodadas.");
    } finally {
      setLoadingRodadas(false);
    }
  };

  // Função para buscar os jogos de uma rodada selecionada
  const fetchMatches = async (rodada) => {
    setLoadingMatches(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Atraso de 2 segundos
      const response = await axios.get(`${API_URL}${rodada}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });
      setMatches(response.data.partidas);
    } catch (error) {
      console.error("Erro ao buscar jogos da rodada:", error);
      setError("Erro ao buscar jogos da rodada.");
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    fetchRodadas(); // Busca as rodadas ao carregar o componente
  }, []);

  const handleSearch = () => {
    if (selectedRodada) {
      fetchMatches(selectedRodada); // Busca os jogos da rodada selecionada
    }
  };

  // Função para converter data de DD/MM/YYYY para YYYY-MM-DD
  const convertDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`; // Converte para formato ISO
  };

  // Função para formatar a data no formato DD/MM/YYYY
  const formatDate = (dateString) => {
    const isoDate = convertDate(dateString);
    const date = new Date(isoDate);

    // Verifica se a data é válida
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('pt-BR'); // Formato DD/MM/YYYY
    } else {
      return "Data inválida"; // Caso a data não seja válida
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecione uma rodada:</Text>
      <Picker
        selectedValue={selectedRodada}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedRodada(itemValue)}
      >
        <Picker.Item label="Selecione uma rodada" value={null} />
        {rodadas.map(rodada => (
          <Picker.Item key={rodada.rodada} label={`Rodada ${rodada.rodada}`} value={rodada.rodada} />
        ))}
      </Picker>
      <Button title="Pesquisar" onPress={handleSearch} />

      <ScrollView>
        {loadingRodadas || loadingMatches ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <Text style={styles.text}>{error}</Text>
        ) : matches.length === 0 ? (
          <Text style={styles.text}>Nenhum jogo encontrado para esta rodada.</Text>
        ) : (
          matches.map((match, index) => (
            <View 
              key={match.partida_id} 
              style={[styles.matchContainer, { backgroundColor: index % 2 === 0 ? '#f0f0f0' : '#ffffff' }]}
            >
              <View style={styles.teamContainer}>
                <Image source={{ uri: match.time_mandante.escudo }} style={styles.teamLogo} />
                <Text style={styles.text}>
                  {match.time_mandante.nome_popular} vs {match.time_visitante.nome_popular}
                </Text>
                <Image source={{ uri: match.time_visitante.escudo }} style={styles.teamLogo} />
              </View>
              <Text style={styles.text}>
                Data: {formatDate(match.data_realizacao)} - Horário: {match.hora_realizacao}
              </Text>
              <Text style={styles.text}>
                Estádio: {match.estadio.nome_popular}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    marginTop: 20,
  },
  text: {
    marginBottom: 10,
    fontSize: 16,
  },
  matchContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamLogo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
});

export default App;
