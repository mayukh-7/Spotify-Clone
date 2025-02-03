console.log("Lets write Javascript")
let currentSong = new Audio();
function decodeHtmlEntities(text) {
    let doc = new DOMParser().parseFromString(text, "text/html");
    return doc.documentElement.textContent;
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



const playMusic = (track) => {
    let encodedTrack = encodeURIComponent(track); // Ensure proper encoding for URL
    console.log("Playing:", track);
    console.log("Encoded URL:", encodedTrack);

    let audio = new Audio("/songs/" + encodedTrack);
    currentSong.src = "/songs/" + encodedTrack;
    currentSong.play();
};




async function main() {
    let songs = await getSongs();
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
        }
        else{
            currentSong.pause()
        }
    })
}

main()

