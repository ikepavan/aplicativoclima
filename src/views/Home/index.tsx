import * as St from './styles';

import { Components, Typographic } from 'components';
import { Coords, GetWeatherRequest } from 'useCases/weather/request';
import React, { useCallback, useEffect, useState } from 'react';
import { Storage, StorageKeys, StorageType } from 'repository';

import { AxiosError } from 'axios';
import Geolocation from '@react-native-community/geolocation';
import { GetWeatherResponse } from 'useCases/weather/response';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Alert, Switch } from 'react-native';
import { getWeather } from 'useCases/weather';
import { removeUnitFromTheme } from 'utils/theme';
import { useSearch } from 'hooks/useSearch';
import { useTheme } from 'styled-components';
import { useHistory } from 'hooks/useHistory';

const Home: React.FC = () => {
  const theme = useTheme();
  const [weatherData, setWeatherData] = useState({} as GetWeatherResponse);
  const [currentLocation, setCurrentLocation] = useState('');
  const [isCelsius, setIsCelsius] = useState(true);
  const { value, setValue } = useSearch();
  const { cities, saveHistory } = useHistory();

  const handleRequest = useCallback(
    async (placeName?: string, currentLocation?: Coords) => {
      const payload: GetWeatherRequest = {
        currentLocation: currentLocation,
        anotherLocation: placeName,
      };
      await getWeather({ ...payload })
        .then(({ data }) => {
          setWeatherData(data);
          console.log(weatherData);
          if (currentLocation) {
            setValue(data.name);
            setCurrentLocation(data.name);
          }
          cities.unshift(data.name);
          const newHistory = [...new Set(cities)];
          if (newHistory.length > 10) {
            newHistory.pop();
          }
          saveHistory(newHistory);
        })
        .catch((error: Error | AxiosError | any) => {
          Alert.alert("Desculpe", "Cidade não encontrada");
        });
    },
    [cities, saveHistory]
  );
  

  const handleGetGeolocation = useCallback(async () => {

    Geolocation.getCurrentPosition(
      async ({ coords }) => {
        await handleRequest(undefined, { lat: -27.6347, long: -52.2747 });
      },
      (error) => {
        Alert.alert("Erro", "Erro ao obter localização");
        handleRequest('Erechim');
      }
    );
  }, [handleRequest]);
  

  const handleToggleSwitch = useCallback(
    async (value: boolean) => {
      await Storage.setItem<StorageType.IUnit>(StorageKeys.UNIT, {
        unit: value ? 'metric' : 'imperial',
      }).then(() => {
        setIsCelsius(value);
        handleRequest(weatherData.name);
      });
    },
    [weatherData]
  );

  useEffect(() => {
    Storage.getItem<StorageType.IUnit>(StorageKeys.UNIT).then((unit) => {
      setIsCelsius(unit?.unit === 'metric');
      handleGetGeolocation();
    });
  }, []);

  return (
    <Components.Container
      backgroundColor={theme.colors.primary[100]}
      statusBarColor={theme.colors.primary[100]}
      scrollStyle={{ paddingBottom: removeUnitFromTheme(theme.spacings.large) }}
      statusBarStyle="dark-content"
    >
      <Components.RowContainer>
        <Typographic.Subtitle>Bem Vindo!</Typographic.Subtitle>
        <Components.RowContainer>
          <St.Content>
            <Typographic.Title color={theme.colors.primary[100]}>
              {isCelsius ? 'C' : 'F'}
            </Typographic.Title>
          </St.Content>
          <Switch
            trackColor={{ false: theme.colors.primary[400], true: theme.colors.primary[700] }}
            thumbColor={theme.colors.primary[700]}
            value={isCelsius}
            onValueChange={handleToggleSwitch}
          />
          <St.LocationButton onPress={handleGetGeolocation}>
            <Icon
              name="crosshairs-gps"
              size={28}
              color={
                currentLocation === value ? theme.colors.primary[700] : theme.colors.secondary[400]
              }
            />
          </St.LocationButton>
        </Components.RowContainer>
      </Components.RowContainer>
      <Components.SearchBar
        icon="map-search"
        placeholder="Buscar Cidade"
        onPress={() => handleRequest(value)}
      />
      <Components.FilterList onPress={handleRequest} />
      {weatherData.name ? (
        <>
          <Components.WeatherCard
            icon={weatherData.weather[0].icon}
            unit={isCelsius ? 'metric' : 'imperial'}
            address={{
              city: weatherData.name,
              country: weatherData.sys.country,
            }}
            weather={{
              temperature: weatherData.main.temp,
              temperatureMax: weatherData.main.temp_max,
              temperatureMin: weatherData.main.temp_min,
            }}
          />
          <Typographic.Subtitle>Clima Agora</Typographic.Subtitle>
          <Components.RowContainer>
            <Components.WeatherTopic
              title="Umidade"
              icon="10d"
              detail={weatherData.main.humidity}
            />
            <Components.WeatherTopic
              title="Vel. Vento"
              icon="50n"
              detail={`${weatherData.wind.speed} ${isCelsius ? 'm/s' : 'mph'}`}
            />
          </Components.RowContainer>


          <Components.RowContainer>
            <Components.WeatherTopic
              title="Nascer do Sol"
              icon="01d"
              timestamp={weatherData.sys.sunrise}
            />
            <Components.WeatherTopic title="Por do Sol" icon="01n" timestamp={weatherData.sys.sunset} />
          </Components.RowContainer>
        </>
      ) : null}
    </Components.Container>
  );
};

export default Home;
