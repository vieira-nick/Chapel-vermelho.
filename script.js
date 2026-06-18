const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Elementos de Interface
const menu = document.getElementById("menu");
const gameContainer = document.getElementById("game-container");
const gameOverScreen = document.getElementById("game-over-screen");
const gameOverTitle = document.getElementById("game-over-title");
const gameOverText = document.getElementById("game-over-text");

// Botões
document.getElementById("btn-jogar").addEventListener("click", iniciarJogo);
document.getElementById("btn-reiniciar").addEventListener("click", iniciarJogo);

// Variáveis do Estado do Jogo
let jogoAtivo = false;
let pontuacao = 0;
const vitoriaPontos = 15; // Quantos obstáculos passar para vencer e ver o final

// Configurações dos Personagens
let chapeuzinho = { x: 150, y: 300, largura: 30, altura: 50, velocidadeY: 0, pulando: false };
let monstro = { x: 20, y: 280, largura: 60, altura: 70, frameAnimação: 0 };
let gravidade = 0.6;

let obstáculos = [];
let bolasDeFogo = [];
let spawnTimer = 0;

// Configurações do Cenário (Chão e Árvores)
let chaoY = 350;

// Inicialização do Jogo
function iniciarJogo() {
    menu.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    
    // Resetar variáveis
    chapeuzinho.y = 300;
    chapeuzinho.velocidadeY = 0;
    chapeuzinho.pulando = false;
    obstáculos = [];
    bolasDeFogo = [];
    pontuacao = 0;
    jogoAtivo = true;
    
    loopDoJogo();
}

// Loop Principal
function loopDoJogo() {
    if (!jogoAtivo) return;

    atualizar();
    desenhar();

    requestAnimationFrame(loopDoJogo);
}

// Atualização da Lógica
function atualizar() {
    // Física da Chapeuzinho
    chapeuzinho.velocidadeY += gravidade;
    chapeuzinho.y += chapeuzinho.velocidadeY;

    if (chapeuzinho.y > chaoY - chapeuzinho.altura) {
        chapeuzinho.y = chaoY - chapeuzinho.altura;
        chapeuzinho.velocidadeY = 0;
        chapeuzinho.pulando = false;
    }

    // Animação leve do Monstro flutuando/correndo
    monstro.frameAnimação += 0.1;
    monstro.y = 270 + Math.sin(monstro.frameAnimação) * 10;

    // Gerenciar Bolas de Fogo
    bolasDeFogo.forEach((bola, bIndex) => {
        bola.x += 7;
        // Remover bola se sair da tela
        if (bola.x > canvas.width) bolasDeFogo.splice(bIndex, 1);
    });

    // Gerenciar Obstáculos (Galhos/Pedras na floresta)
    spawnTimer++;
    if (spawnTimer > 90) { // Cria obstáculo a cada 1.5 segundos aprox.
        let alturaObstaculo = Math.random() > 0.5 ? 30 : 40;
        obstáculos.push({
            x: canvas.width,
            y: chaoY - alturaObstaculo,
            largura: 25,
            altura: alturaObstaculo
        });
        spawnTimer = 0;
    }

    obstáculos.forEach((obs, oIndex) => {
        obs.x -=(4 + pontuacao * 0.2); // Fica levemente mais rápido com o tempo

        // Verificar se o fogo destrói o obstáculo
        bolasDeFogo.forEach((bola, bIndex) => {
            if (bola.x < obs.x + obs.largura && bola.x + bola.raio > obs.x &&
                bola.y < obs.y + obs.altura && bola.y + bola.raio > obs.y) {
                obstáculos.splice(oIndex, 1);
                bolasDeFogo.splice(bIndex, 1);
                pontuacao++;
                
                // Condição de Vitória
                if (pontuacao >= vitoriaPontos) {
                    fimDeJogo(true);
                }
            }
        });

        // Colisão da Chapeuzinho com obstáculo (Gera atraso e o monstro pega)
        if (chapeuzinho.x < obs.x + obs.largura && chapeuzinho.x + chapeuzinho.largura > obs.x &&
            chapeuzinho.y < obs.y + obs.altura && chapeuzinho.y + chapeuzinho.altura > obs.y) {
            fimDeJogo(false);
        }

        // Remover obstáculos que saíram da tela
        if (obs.x + obs.largura < 0) {
            obstáculos.splice(oIndex, 1);
            pontuacao++;
            if (pontuacao >= vitoriaPontos) fimDeJogo(true);
        }
    });
}

// Renderização Gráfica (Estilo Pixel Art Manual)
function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar Fundo (Céu Noturno e Floresta ao fundo)
    ctx.fillStyle = "#111a11";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar Chão
    ctx.fillStyle = "#0d1a0d";
    ctx.fillRect(0, chaoY, canvas.width, canvas.height - chaoY);
    ctx.fillStyle = "#8b5a2b"; // Linha de terra pixelada
    ctx.fillRect(0, chaoY, canvas.width, 4);

    // Desenhar Chapeuzinho Vermelho (Estilo Pixel)
    ctx.fillStyle = "#ff3333"; // Capuz Vermelho
    ctx.fillRect(chapeuzinho.x, chapeuzinho.y, chapeuzinho.largura, chapeuzinho.altura - 15);
    ctx.fillStyle = "#ffdbac"; // Rosto
    ctx.fillRect(chapeuzinho.x + 10, chapeuzinho.y + 10, 15, 15);
    ctx.fillStyle = "#3333aa"; // Saia/Roupa
    ctx.fillRect(chapeuzinho.x, chapeuzinho.y + 35, chapeuzinho.largura, 15);

    // Desenhar o Monstro Perseguidor
    ctx.fillStyle = "#222"; // Corpo Sombrio
    ctx.fillRect(monstro.x, monstro.y, monstro.largura, monstro.altura);
    ctx.fillStyle = "#ff0000"; // Olhos brilhantes vermelhos do monstro
    ctx.fillRect(monstro.x + 40, monstro.y + 15, 8, 8);
    ctx.fillRect(monstro.x + 20, monstro.y + 15, 8, 8);

    // Desenhar Obstáculos (Galhos roxos/misteriosos da floresta)
    ctx.fillStyle = "#4a2c5e";
    obstáculos.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.largura, obs.altura);
    });

    // Desenhar Bolas de Fogo
    ctx.fillStyle = "#ff6600";
    bolasDeFogo.forEach(bola => {
        ctx.beginPath();
        ctx.arc(bola.x, bola.y, bola.raio, 0, Math.PI * 2);
        ctx.fill();
    });

    // Mostrar Pontuação (Distância/Obstáculos)
    ctx.fillStyle = "#fff";
    ctx.font = "20px 'Courier New'";
    ctx.fillText(`Progresso na Floresta: ${pontuacao}/${vitoriaPontos}`, 20, 40);
}

// Mecânica de Ações (Pular e Atirar)
function acaoPular() {
    if (!chapeuzinho.pulando && jogoAtivo) {
        chapeuzinho.velocidadeY = -12;
        chapeuzinho.pulando = true;
    }
}

function acaoAtirar() {
    if (jogoAtivo) {
        bolasDeFogo.push({
            x: chapeuzinho.x + chapeuzinho.largura,
            y: chapeuzinho.y + 20,
            raio: 8
        });
    }
}

// Input de Controles (Teclado - PC)
window.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "ArrowUp") acaoPular();
    if (e.key === "f" || e.key === "Shift") acaoAtirar();
});

// Input de Controles (Toque - Mobile)
document.getElementById("btn-pular").addEventListener("touchstart", (e) => { e.preventDefault(); acaoPular(); });
document.getElementById("btn-atirar").addEventListener("touchstart", (e) => { e.preventDefault(); acaoAtirar(); });

// Finalização do Jogo e Revelação do Segredo
function fimDeJogo(ganhou) {
    jogoAtivo = false;
    gameContainer.classList.add("hidden");
    gameOverScreen.classList.remove("hidden");

    if (ganhou) {
        gameOverTitle.innerText = "Você Escapou!";
        gameOverTitle.style.color = "#00ff00";
        gameOverText.innerHTML = "<strong>O SEGREDO FOI REVELADO:</strong><br><br>Ao sair da névoa da floresta, o monstro misterioso tropeça... A capa cai e você vê que <strong>o monstro era a Vovozinha!</strong><br>Ela estava sonâmbula usando uma fantasia assustadora o tempo todo!";
    } else {
        gameOverTitle.innerText = "O Monstro te pegou!";
        gameOverTitle.style.color = "#ff3333";
        gameOverText.innerText = "A floresta te superou. Tente fugir novamente para descobrir o segredo por trás do monstro!";
    }
}
