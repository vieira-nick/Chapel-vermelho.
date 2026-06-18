const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const gameContainer = document.getElementById("game-container");
const gameOverScreen = document.getElementById("game-over-screen");
const gameOverTitle = document.getElementById("game-over-title");
const gameOverText = document.getElementById("game-over-text");

document.getElementById("btn-jogar").addEventListener("click", iniciarJogo);
document.getElementById("btn-reiniciar").addEventListener("click", iniciarJogo);

// --- CARREGAMENTO DAS IMAGENS ---
const imgChapeuzinho = new Image();
imgChapeuzinho.src = 'chapeuzinho.png';

const imgMonstro = new Image();
imgMonstro.src = 'monstro.png';

const imgObstaculo = new Image();
imgObstaculo.src = 'obstaculo.png';
// ---------------------------------

let jogoAtivo = false;
let pontuacao = 0;
const vitoriaPontos = 15;

let chapeuzinho = { x: 150, y: 300, largura: 40, altura: 60, velocidadeY: 0, pulando: false };
let monstro = { x: 20, y: 280, largura: 70, altura: 80, frameAnimação: 0 };
let gravidade = 0.6;

let obstáculos = [];
let bolasDeFogo = [];
let spawnTimer = 0;
let chaoY = 350;

function iniciarJogo() {
    menu.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    
    chapeuzinho.y = 300;
    chapeuzinho.velocidadeY = 0;
    chapeuzinho.pulando = false;
    obstáculos = [];
    bolasDeFogo = [];
    pontuacao = 0;
    jogoAtivo = true;
    
    loopDoJogo();
}

function loopDoJogo() {
    if (!jogoAtivo) return;
    atualizar();
    desenhar();
    requestAnimationFrame(loopDoJogo);
}

function atualizar() {
    chapeuzinho.velocidadeY += gravidade;
    chapeuzinho.y += chapeuzinho.velocidadeY;

    if (chapeuzinho.y > chaoY - chapeuzinho.altura) {
        chapeuzinho.y = chaoY - chapeuzinho.altura;
        chapeuzinho.velocidadeY = 0;
        chapeuzinho.pulando = false;
    }

    monstro.frameAnimação += 0.1;
    monstro.y = 260 + Math.sin(monstro.frameAnimação) * 10;

    bolasDeFogo.forEach((bola, bIndex) => {
        bola.x += 7;
        if (bola.x > canvas.width) bolasDeFogo.splice(bIndex, 1);
    });

    spawnTimer++;
    if (spawnTimer > 90) {
        let alturaObstaculo = 40;
        obstáculos.push({
            x: canvas.width,
            y: chaoY - alturaObstaculo,
            largura: 30,
            altura: alturaObstaculo
        });
        spawnTimer = 0;
    }

    obstáculos.forEach((obs, oIndex) => {
        obs.x -= (4 + pontuacao * 0.2);

        bolasDeFogo.forEach((bola, bIndex) => {
            if (bola.x < obs.x + obs.largura && bola.x + bola.raio > obs.x &&
                bola.y < obs.y + obs.altura && bola.y + bola.raio > obs.y) {
                obstáculos.splice(oIndex, 1);
                bolasDeFogo.splice(bIndex, 1);
                pontuacao++;
                if (pontuacao >= vitoriaPontos) fimDeJogo(true);
            }
        });

        if (chapeuzinho.x < obs.x + obs.largura && chapeuzinho.x + chapeuzinho.largura > obs.x &&
            chapeuzinho.y < obs.y + obs.altura && chapeuzinho.y + chapeuzinho.altura > obs.y) {
            fimDeJogo(false);
        }

        if (obs.x + obs.largura < 0) {
            obstáculos.splice(oIndex, 1);
            pontuacao++;
            if (pontuacao >= vitoriaPontos) fimDeJogo(true);
        }
    });
}

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fundo da floresta simples
    ctx.fillStyle = "#132213";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Linha do chão
    ctx.fillStyle = "#5c3a21";
    ctx.fillRect(0, chaoY, canvas.width, canvas.height - chaoY);

    // --- DESENHANDO COM AS SUAS IMAGENS ---
    ctx.drawImage(imgChapeuzinho, chapeuzinho.x, chapeuzinho.y, chapeuzinho.largura, chapeuzinho.altura);
    ctx.drawImage(imgMonstro, monstro.x, monstro.y, monstro.largura, monstro.altura);

    obstáculos.forEach(obs => {
        ctx.drawImage(imgObstaculo, obs.x, obs.y, obs.largura, obs.altura);
    });
    // ---------------------------------------

    // Efeito do fogo (mantido em vetor por ser dinâmico, mas pode ser imagem se quiser)
    ctx.fillStyle = "#ff6600";
    bolasDeFogo.forEach(bola => {
        ctx.beginPath();
        ctx.arc(bola.x, bola.y, bola.raio, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = "#fff";
    ctx.font = "20px 'Courier New'";
    ctx.fillText(`Progresso: ${pontuacao}/${vitoriaPontos}`, 20, 40);
}

function acaoPular() {
    if (!chapeuzinho.pulando && jogoAtivo) {
        chapeuzinho.velocidadeY = -12;
        chapeuzinho.pulando = true;
    }
}

function acaoAtirar() {
    if (jogoAtivo) {
        bolasDeFogo.push({ x: chapeuzinho.x + chapeuzinho.largura, y: chapeuzinho.y + 25, raio: 8 });
    }
}

window.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "ArrowUp") acaoPular();
    if (e.key === "f" || e.key === "Shift") acaoAtirar();
});

document.getElementById("btn-pular").addEventListener("touchstart", (e) => { e.preventDefault(); acaoPular(); });
document.getElementById("btn-atirar").addEventListener("touchstart", (e) => { e.preventDefault(); acaoAtirar(); });

function fimDeJogo(ganhou) {
    jogoAtivo = false;
    gameContainer.classList.add("hidden");
    gameOverScreen.classList.remove("hidden");

    if (ganhou) {
        gameOverTitle.innerText = "Você Escapou!";
        gameOverTitle.style.color = "#00ff00";
        gameOverText.innerHTML = "<strong>O SEGREDO FOI REVELADO:</strong><br><br>O monstro tropeça e a capa cai... <strong>Era a Vovozinha!</strong><br>Ela estava sonâmbula no meio da floresta!";
    } else {
        gameOverTitle.innerText = "O Monstro te pegou!";
        gameOverTitle.style.color = "#ff3333";
        gameOverText.innerText = "Tente novamente para descobrir o segredo por trás do monstro!";
    }
}
