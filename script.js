console.log("Lets write Javascript")
let currentSong = new Audio();
function decodeHtmlEntities(text) {
    let doc = new DOMParser().parseFromString(text, "text/html");
    return doc.documentElement.textContent;
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs() {
    let a = await fetch("http://127.0.0.1:3000/songs/");
    let response = await a.text();
    console.log(response);

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let songName = element.href.split("/songs/")[1];
            
            console.log("Before Decoding:", songName);

            // Decode HTML entities (like &amp;)
            let parser = new DOMParser();
            songName = parser.parseFromString(songName, "text/html").body.textContent;

            // Decode URL encoding (like %20 for spaces)
            songName = decodeURIComponent(songName);

            console.log("After Decoding:", songName);

            songs.push(songName);
        }
    }
    return songs;
}
const playMusic = (track, pause = false) => {
    let encodedTrack = encodeURIComponent(track); // Ensure proper encoding for URL
    console.log("Playing:", track);
    console.log("Encoded URL:", encodedTrack);
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg"
    }

    let audio = new Audio("/songs/" + encodedTrack);
    currentSong.src = "/songs/" + encodedTrack;
    currentSong.play();
    // play.src = "pause.svg";
    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
};




async function main() {


    let songs = await getSongs();
    playMusic(songs[0], true)
    console.log(songs);

    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = ""; // Clear existing list

    for (const song of songs) {
        let decodedSong = decodeHtmlEntities(song).replaceAll("%20", " ");
        
        let li = document.createElement("li");
        li.innerHTML = `
            <img class="invert" src="music.svg" alt="">
            <div class="info">
                <div>${decodedSong}</div>
                <div>Mayukh</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="">
            </div>
        `;

        li.addEventListener("click", () => {
            console.log(`Playing: ${decodedSong}`);
            playMusic(decodedSong);
        });

        songUL.appendChild(li);
    }

    // Attach an event listener to play , next and previous
    play.addEventListener("click", () =>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "pause.svg";

        }
        else{
            currentSong.pause()
            play.src = "play.svg";
        }
    })

    //listen for time update event
    currentSong.addEventListener("timeupdate", () =>{
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/ currentSong.duration) * 100 + "%";
    })

    //Add an event listener  to seekbar 
    document.querySelector(".seekbar").addEventListener("click", e =>{
        let percent = ( e.offsetX/e.target.getBoundingClientRect().width)*100 
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration)*percent)/100;
    })
}

main()

