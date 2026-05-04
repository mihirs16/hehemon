import { For, render } from 'solid-js/web';
import { createStore } from 'solid-js/store';
import * as zebar from 'zebar';

/** @refresh hot-reload */
import './index.css';

/** zebar providers for system statistics */ 
const providers = zebar.createProviderGroup({
    glazewm: { type: 'glazewm' },
    cpu: { type: 'cpu' },
    memory: { type: 'memory' },
    weather: { type: 'weather' },
    date: { type: 'date' }
});

render(() => <App />, document.getElementById('root')!);

function App() {
    const [output, setOutput] = createStore(providers.outputMap);

    providers.onOutput(outputMap => setOutput(outputMap));

    return (
        <div class="app">
            {/* Top-left group of islands */}
            <div class="archipelago-left">
                { output.glazewm && getWorkspacesIsland(output.glazewm)}
            </div>

            {/* Center group of islands */}
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

                {/* Island for Weather and Datetime */}
                <div class="island">
                    {
                        output.weather && 
                        <>
                            <div class="stat">
                                <span class="icon weather-icon">
                                    {getWeatherIcon(output.weather.status)}
                                </span>
                                <span class="value muted">
                                    {Math.round(output.weather.celsiusTemp)}°C
                                </span>
                            </div>
                            <span class="stat-divider">|</span>
                        </>
                    }
                    <div class="stat">
                        <span class="value">
                            {
                                output.date && 
                                    getFormattedDt(output.date.now).d
                            }
                        </span>
                    </div>
                    <span class="stat-divider">·</span>
                    <div class="stat">
                        <span class="value">
                            {
                                output.date && 
                                    getFormattedDt(output.date.now).t
                            }
                        </span>
                    </div>
                </div>
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

function getFormattedDt(epoch: number) {
    const dt = new Date(epoch);
    return {
        t: dt.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
        }),
        d: dt.toLocaleDateString([], { 
            day: '2-digit', 
            month: 'short' 
        })
    }
}

function getWorkspacesIsland(glazewm: zebar.GlazeWmOutput) {
    const possible = ['1', '2', '3', '4', '5'];
    const workspaces = possible.map(name => ({
        ...glazewm.currentWorkspaces.find(w => w.name === name),
        name,
    }));
    
    const gCmd = glazewm.runCommand;

    return (
        <div class="island island-slim">
            <div class="toggle-group">
                <For each={workspaces}>{(ws, i) =>
                    <button
                        onClick={() => !!ws.id && gCmd(`focus --workspace ${ws.name}`)}
                        classList={{
                            "toggle-solid": true,
                            "toggle-active": !!ws.id,
                            "toggle-on": !!ws.isDisplayed
                        }}
                    >
                        <span>{ws.name}</span>
                    </button>
                }</For>
            </div>
        </div>
    );
}

