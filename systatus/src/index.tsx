import { For, render } from 'solid-js/web';
import { createStore } from 'solid-js/store';
import * as zebar from 'zebar';

/** @refresh hot-reload */
import './index.css';

/** zebar providers for system statistics */ 
const providers = zebar.createProviderGroup({
    glazewm: { type: 'glazewm' },
    media: { type: 'media' },
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
                {/* Island for GlazeWM workspaces */} 
                { output.glazewm && getWorkspacesIsland(output.glazewm) }
                
                {/* Island for GlazeWM windows */}
                { output.glazewm && getWindowsIsland(output.glazewm) }
            </div>

            {/* Center group of islands */}
            <div class="archipelago-center">
                {/* Island for a light media center */}
                { output.media && getMediaIsland(output.media) }
            </div>
       
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

/** 
 * Maintains a lookup for common weather statuses 
 * and returns the icon associated with it. 
 *
 * @returns <i>
 */
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

/** Normalises date and time for display */
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

/** Builds the island to show GlazeWM workspaces */
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

/** Builds the island for windows, as exposed by GlazeWM */
function getWindowsIsland(glazewm: zebar.GlazeWmOutput) {
    const allWindows = glazewm.allWindows;
    const allWorkspaces = glazewm.allWorkspaces;

    const gCmd = glazewm.runCommand;

    if (!allWindows || allWindows.length === 0) {
        return (<></>);
    }

    return (
        <div class="island island-slim">
            <div class="toggle-group">
                <For each={allWindows}>{(window, i) =>
                    <button
                        onClick={() => {
                            const workspace = findWorkspaceContainingWindow(
                                glazewm, 
                                window.id
                            );
                            if (workspace) {
                                gCmd(`focus --workspace ${workspace.name}`);
                            }
                            gCmd(`focus --container-id ${window.id}`);
                            if (window.state.type === 'minimized') {
                                gCmd(`toggle-minimized`);
                            }
                        }}
                        classList={{
                            "toggle": true,
                            "toggle-on": window.hasFocus && window.state.type === 'tiling'
                        }}
                    >
                        {
                            window.processName ? 
                                getFormattedWindows(window.processName) : 'unknown'
                        }
                    </button>
                }</For>
            </div>
        </div>
    );
}

/** 
 * Recursively traverses all workspaces and their 
 * containers to find the workspace which has the
 * given window
 */
function findWorkspaceContainingWindow(
    glazewm: zebar.GlazeWmOutput,
    windowId: string
): zebar.Workspace | undefined {
    function containsWindow(node: zebar.Container): boolean {
        if (node.id === windowId) {
            return true;
        }
        return node.children?.some(
            (child: zebar.Container) => containsWindow(child)
        ) ?? false;
    }

    return glazewm.allWorkspaces.find(
        ws => ws.children?.some(
            child => containsWindow(child)
        )
    );
}

/**
 * Maintains a lookup of common applications 
 * against their normalised label and icons.
 * Fallsback to default icon and lowercased label
 */
function getFormattedWindows(rawProcessName: string) {
    const processLookup = {
        discord: { name: 'discord', iconClass: 'nf-fa-discord' },
        windowsterminal: { name: 'term', iconClass: 'nf-fa-terminal' },
        zen: { name: 'zen', iconClass: 'nf-cod-globe' },
        steamwebhelper: { name: 'steam', iconClass: 'nf-fa-steam' },
        fusion360: { name: 'fusion360', iconClass: 'nf-md-cube_outline' },
        claude: { name: 'claude', iconClass: 'nf-fa-brain' }
    };

    const processName = rawProcessName.toLowerCase();
    const label = processLookup[processName] ?? { 
        name: processName,
        iconClass: 'nf-md-application_outline'
    };

    return (
        <>
            <span class='icon'>
                <i class={`nf ${label.iconClass}`}></i>
            </span>
            <span class='value'>
                {label.name}
            </span>
        </>
    );
}

/** Builds an island for a light media center */
function getMediaIsland(media: zebar.MediaOutput) {
    const session = media.currentSession;
    if (!session) return (<></>);

    return (
        <div class="island">
            <div class="stat">
                <span classList={{
                    icon: true,
                    "icon-media-play": session.isPlaying 
                }}>
                    <i class="nf nf-cod-music"></i>
                </span>
                <div class="media-value-container">
                    <span class="value media-value">
                        {session.title} - {session.artist}
                        &nbsp; &nbsp; &nbsp; &nbsp;
                        {session.title} - {session.artist}
                    </span>
                </div>               
            </div>
            <div class="stat">
                <button class="icon toggle-icon" onClick={() => media.togglePlayPause()}>
                    { 
                        session.isPlaying ? 
                            <i class="nf nf-md-pause"></i>
                            : <i class="nf nf-md-play"></i>
                    }
                </button>
            </div>
        </div>
    );
}

