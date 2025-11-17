let score = 0;
let bestScore = localStorage.getItem("bestPokeScore") || 0;
document.getElementById("best").textContent = bestScore;

let p1, p2;
let currentStat;

// Fonction pour récupérer un Pokémon aléatoire
async function getRandomPokemon() {
    const id = Math.floor(Math.random() * 1017) + 1;
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();

    return {
        name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
        img: data.sprites.other["official-artwork"].front_default,
        stats: {
            hp: data.stats[0].base_stat,
            attack: data.stats[1].base_stat,
            defense: data.stats[2].base_stat,
            "special-attack": data.stats[3].base_stat,
            "special-defense": data.stats[4].base_stat,
            speed: data.stats[5].base_stat
        }
    };
}

// Met à jour l'interface
function updateUI() {
    document.getElementById("img1").src = p1.img;
    document.getElementById("name1").textContent = p1.name;

    document.getElementById("img2").src = p2.img;
    document.getElementById("name2").textContent = p2.name;
    document.getElementById("stat2").textContent = "???";

    if (currentStat === "all") {
        const sum1 = Object.values(p1.stats).reduce((a,b)=>a+b,0);
        document.getElementById("stat1").textContent = `TOTAL : ${sum1}`;
        document.getElementById("currentStat").textContent = "TOTAL";
    } else {
        document.getElementById("stat1").textContent = `${currentStat.toUpperCase()} : ${p1.stats[currentStat]}`;
        document.getElementById("currentStat").textContent = currentStat.toUpperCase();
    }

    document.getElementById("card1").classList.add("reveal");
    document.getElementById("card2").classList.add("reveal");

    setTimeout(() => {
        document.getElementById("card1").classList.remove("reveal");
        document.getElementById("card2").classList.remove("reveal");
    }, 600);
}

// Nouvelle manche
async function newRound() {
    p1 = p2 || await getRandomPokemon();
    p2 = await getRandomPokemon();

    updateUI();
}

// Vérifie la réponse du joueur
async function guess(isHigher) {
    let s1, s2;

    if (currentStat === "all") {
        s1 = Object.values(p1.stats).reduce((a,b)=>a+b,0);
        s2 = Object.values(p2.stats).reduce((a,b)=>a+b,0);
        document.getElementById("stat2").textContent = `TOTAL : ${s2}`;
    } else {
        s1 = p1.stats[currentStat];
        s2 = p2.stats[currentStat];
        document.getElementById("stat2").textContent = `${currentStat.toUpperCase()} : ${s2}`;
    }

    const correct = (isHigher && s2 >= s1) || (!isHigher && s2 <= s1);

    if (correct) {
        score++;
        document.getElementById("score").textContent = score;

        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem("bestPokeScore", bestScore);
            document.getElementById("best").textContent = bestScore;
        }

        setTimeout(newRound, 800);
    } else {
        document.getElementById("loseMessage").textContent =
            currentStat === "all"
            ? `${p2.name} a TOTAL ${s2}.`
            : `${p2.name} a ${s2} en ${currentStat.toUpperCase()}.`;

        document.getElementById("loseOverlay").classList.remove("hidden");

        score = 0;
        document.getElementById("score").textContent = 0;
    }
}

// Redémarrage
function restart() {
    document.getElementById("loseOverlay").classList.add("hidden");
    p2 = null;
    newRound();
}

// Démarrage après choix de la stat
document.getElementById("startBtn").addEventListener("click", () => {
    currentStat = document.getElementById("statSelector").value;

    // Masque l'écran de choix
    document.getElementById("statChoice").classList.add("hidden");

    // Affiche le jeu
    document.getElementById("scoreBox").classList.remove("hidden");
    document.querySelector(".game").classList.remove("hidden");
    document.querySelector(".buttons").classList.remove("hidden");

    newRound();
});
