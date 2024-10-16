import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const App = () => {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  // Função para buscar os times da Série A do Campeonato Brasileiro
  const fetchBrazilianSerieATeams = async () => {
    try {
      const response = await axios.get('https://api.football-data.org/v4/competitions/BSA/teams', {
        headers: {
          'X-Auth-Token': '2352a3a398d949e28fafacd25c8e6ebc',
        },
      });
      setTeams(response.data.teams);
    } catch (error) {
      setError("Erro ao buscar times.");
    } finally {
      setLoadingTeams(false);
    }
  };

  // Função para buscar os próximos jogos com parâmetros
  const fetchMatches = async () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7); // Uma semana a partir de hoje

    const dateFrom = today.toISOString().split('T')[0]; // Data de hoje
    const dateTo = nextWeek.toISOString().split('T')[0]; // Data de uma semana a partir de hoje

    try {
      const response = await axios.get('https://api.football-data.org/v4/matches', {
        headers: {
          'X-Auth-Token': '2352a3a398d949e28fafacd25c8e6ebc',
        },
        params: {
          competitions: 'BSA', // Filtrar pela competição Série A
          dateFrom: dateFrom, // Data de início
          dateTo: dateTo, // Data de fim
        },
      });
      setMatches(response.data.matches);
    } catch (error) {
      setError("Erro ao buscar jogos.");
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    fetchBrazilianSerieATeams();
    fetchMatches();
  }, []);

  const handleSearch = () => {
    if (selectedTeamId) {
      const teamMatches = matches.filter(match =>
        match.homeTeam.id === selectedTeamId || match.awayTeam.id === selectedTeamId
      );
      setSearchResults(teamMatches);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecione um time:</Text>
      <Picker
        selectedValue={selectedTeamId}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedTeamId(itemValue)}
      >
        <Picker.Item label="Selecione um time" value={null} />
        {teams.map(team => (
          <Picker.Item key={team.id} label={team.name} value={team.id} />
        ))}
      </Picker>
      <Button title="Pesquisar" onPress={handleSearch} />

      {loadingTeams || loadingMatches ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.text}>{error}</Text>
      ) : searchResults.length === 0 ? (
        <Text style={styles.text}>Nenhum jogo encontrado para este time.</Text>
      ) : (
        searchResults.map(match => (
          <View key={match.id} style={styles.matchContainer}>
            <Text style={styles.text}>
              {match.homeTeam.name} vs {match.awayTeam.name} - {new Date(match.date).toLocaleDateString()}
            </Text>
          </View>
        ))
      )}
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
    marginBottom: 10,
  },
  text: {
    marginBottom: 10,
    fontSize: 16,
  },
  matchContainer: {
    marginTop: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
});

export default App;
