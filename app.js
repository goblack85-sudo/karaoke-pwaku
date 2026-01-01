window.addEventListener('DOMContentLoaded', () => {

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const master = audioCtx.createGain();
master.gain.value = 0;

let ytPlayer;

// ===== YOUTUBE =====
window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('ytplayer', {
        height: '100%',
        width: '100%',
        videoId: 'k7qzx0CZyW8', // contoh video karaoke
        playerVars: { 'autoplay':1, 'controls':1, 'modestbranding':1 }
    });
};

// ===== MICROPHONE =====
navigator.mediaDevices.getUserMedia({ audio:true })
.then(stream => {
    const mic = audioCtx.createMediaStreamSource(stream);
    const gainNode = audioCtx.createGain();
    const compressor = audioCtx.createDynamicsCompressor();

    mic.connect(gainNode); gainNode.connect(compressor); compressor.connect(master);

    // ===== MIXER SLIDERS =====
    const faders = [
        {id:'gain-slider', node:gainNode, prop:'gain', min:0,max:2,start:1},
        {id:'comp-slider', node:compressor, prop:'threshold', min:-100,max:0,start:-50},
        {id:'attack-slider', node:compressor, prop:'attack', min:0,max:0.3,start:0.05},
        {id:'release-slider', node:compressor, prop:'release', min:0.05,max:1,start:0.2},
        {id:'echo-slider', node:gainNode, prop:'gain', min:0,max:0.6,start:0},
        {id:'master-slider', node:master, prop:'gain', min:0,max:1,start:1},
    ];

    faders.forEach(f=>{
        const sliderEl = document.getElementById(f.id);
        if(!sliderEl) return;
        noUiSlider.create(sliderEl, {
            start:[f.start],
            orientation:'vertical',
            direction:'rtl',
            range:{min:f.min,max:f.max},
            connect:[true,false]
        });
        sliderEl.noUiSlider.on('update', val => f.node[f.prop].value = val[0]);
    });

    // ===== Volume Mic =====
    const volMic = document.getElementById('vol-mic-slider');
    if(volMic){
        noUiSlider.create(volMic, {
            start:[1],
            orientation:'vertical',
            direction:'rtl',
            range:{min:0,max:1},
            connect:[true,false]
        });
        volMic.noUiSlider.on('update', val => master.gain.value = val[0]);
    }

    // ===== Volume YouTube =====
    const volYT = document.getElementById('vol-yt-slider');
    if(volYT){
        noUiSlider.create(volYT, {
            start:[1],
            orientation:'vertical',
            direction:'rtl',
            range:{min:0,max:1},
            connect:[true,false]
        });
        volYT.noUiSlider.on('update', val => {
            if(ytPlayer && ytPlayer.setVolume) ytPlayer.setVolume(val[0]*100);
        });
    }

})
.catch(err => console.log("Mic error:", err));

});
