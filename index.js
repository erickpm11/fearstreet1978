const audio = document.getElementById('bg-audio');
const startBtn = document.getElementById('start-btn');
const introScreen = document.getElementById('intro-screen');
const muteBtn = document.getElementById('mute-btn');

let currentMusic = "";
let isReadingStarted = false;
let isMutedByUser = false;

const sceneObserverOptions = {
    root: null,
    rootMargin: "-5% 0px -85% 0px", 
    threshold: 0
};

const actionObserverOptions = {
    root: null,
    rootMargin: "-20% 0px -50% 0px", 
    threshold: 0.5
};

const sceneObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && isReadingStarted && !isMutedByUser) {
            const newMusic = entry.target.getAttribute('data-music');
            if (newMusic && newMusic !== currentMusic) {
                currentMusic = newMusic;
                fadeAndPlay(newMusic);
            }
        }
    });
}, sceneObserverOptions);

const actionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && isReadingStarted && !isMutedByUser) {
            const action = entry.target.getAttribute('data-action');
            const internalMusic = entry.target.getAttribute('data-music-trigger');

            if (action === "pause" && !audio.paused) {
                audio.pause();
            } else if (action === "resume" && audio.paused && currentMusic) {
                audio.play().catch(err => console.error("Erro ao retomar áudio:", err));
            } else if (internalMusic && internalMusic !== currentMusic) {
                currentMusic = internalMusic;
                fadeAndPlay(internalMusic);
            }
        }
    });
}, actionObserverOptions);

document.querySelectorAll('.story-p').forEach(p => sceneObserver.observe(p));
document.querySelectorAll('.audio-trigger').forEach(el => actionObserver.observe(el));

startBtn.addEventListener('click', () => {
    isReadingStarted = true;
    introScreen.style.display = 'none';
    if (muteBtn) muteBtn.style.display = 'block';

    const firstActive = document.querySelector('.story-p');
    if (firstActive) {
        currentMusic = firstActive.getAttribute('data-music');
        if (currentMusic) {
            fadeAndPlay(currentMusic);
        }
    }
});

if (muteBtn) {
    muteBtn.addEventListener('click', () => {
        if (audio.paused) {
            isMutedByUser = false;
            muteBtn.innerText = "🔊 Mudar Música";
            if (currentMusic) audio.play().catch(err => console.error(err));
        } else {
            isMutedByUser = true;
            muteBtn.innerText = "🔇 Mutado";
            audio.pause();
        }
    });
}

function fadeAndPlay(musicSrc) {
    if (!audio.paused) {
        let fadeOut = setInterval(() => {
            if (audio.volume > 0.1) {
                audio.volume -= 0.1;
            } else {
                clearInterval(fadeOut);
                changeTrack(musicSrc);
            }
        }, 50);
    } else {
        changeTrack(musicSrc);
    }
}

function changeTrack(src) {
    audio.src = src;
    audio.volume = 0;
    
    audio.play().then(() => {
        let fadeIn = setInterval(() => {
            if (audio.volume < 0.9) {
                audio.volume += 0.1;
            } else {
                audio.volume = 1;
                clearInterval(fadeIn);
            }
        }, 50);
    }).catch(error => console.error("Erro ao tocar áudio:", error));
}
