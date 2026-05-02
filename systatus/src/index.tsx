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
                    <span class="icon"></span> {output.cpu ? Math.round(output.cpu.usage) : '--'}%
                </div>
                <span class="stat-divider">·</span>
                <div class="stat">
                    <span class="icon"></span> {output.memory ? Math.round(output.memory.usage) : '--'}%
                </div>
            </div>
        </div> 
    </div>
  );
}
