/* @refresh reload */
import './index.css';
import { For, render } from 'solid-js/web';
import { createStore } from 'solid-js/store';
import * as zebar from 'zebar';

const providers = zebar.createProviderGroup({
  cpu: { type: 'cpu' },
  memory: { type: 'memory' },
  weather: { type: 'weather' },
});

render(() => <App />, document.getElementById('root')!);

function App() {
  const [output, setOutput] = createStore(providers.outputMap);

  providers.onOutput(outputMap => setOutput(outputMap));

  return (
    <div class="app">
        <div class="archipelago-left"></div>
        <div class="archipelago-center"></div>
       
        {/* Top-right group of islands */}
        <div class="archipelago-right">

            {/* Island for CPU/Mem stats */}
            <div class="island">
                <div class="stat">
                    <span class="icon">
                        <i class="nf nf-oct-cpu"></i> 
                    </span>
                    <span class="value">
                        {
                            output.cpu ? 
                                Math.round(output.cpu.usage) : '--'
                        }%
                    </span>
                </div>
                <span class="stat-divider">·</span>
                <div class="stat">
                    <span class="icon">
                    <i class="nf nf-fa-memory"></i> 
                    </span>
                    <span class="value">
                        {
                            output.memory ? 
                                Math.round(output.memory.usage) : '--'
                        }%
                    </span>
                </div>
            </div>

            {/* Island for Weather */}
            { output.weather &&
                <div class="island">
                    <div class="stat">
                        <span class="icon weather-icon">
                            {getWeatherIcon(output.weather.status)}
                        </span>
                        <span class="value">
                            {Math.round(output.weather.celsiusTemp)}°C
                        </span>
                    </div>
                </div>
            }
        </div> 
    </div>
  );
}

function getWeatherIcon(status: string) {
    const iconLookup = {
        clear_day: 'nf-weather-day_sunny',
        clear_night: 'nf-weather-night_clear',
        cloudy_day: 'nf-weather-day_cloudy',
        cloudy_night: 'nf-weather-night_alt_cloudy',
        light_rain_day: 'nf-weather-day_sprinkle',
        light_rain_night: 'nf-weather-night_alt_sprinkle',
        heavy_rain_day: 'nf-weather-day_rain',
        heavy_rain_night: 'nf-weather-night_alt_rain',
        snow_day: 'nf-weather-day_snow',
        snow_night: 'nf-weather-night_alt_snow',
        thunder_day: 'nf-weather-day_lightning',
        thunder_night: 'nf-weather-night_alt_lightning'
    };
    const weatherIconClass = iconLookup[status];

    if (!weatherIconClass) {
        return '';
    }

    return (<i class={`nf ${weatherIconClass}`}></i>);
}
