import './src/style/main.css';
import { renderApp } from './src/page/app.js';
import { initLogic } from './src/script/logic.js';

// 1. Renderiza o HTML primeiro
renderApp();

// 2. Inicia a lógica depois que os elementos existem no DOM
initLogic();