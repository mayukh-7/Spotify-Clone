console.log("Lets write Javascript")
let currentSong = new Audio();
let songs;
let currfolder;
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

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`${folder}`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
     songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let songName = element.href.split(`/${folder}/`)[1];
            
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

    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = ""; // Clear existing list

    for (const song of songs) {
        let decodedSong = decodeHtmlEntities(song).replaceAll("%20", " ");
        
        let li = document.createElement("li");
        li.innerHTML = `
            <img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${decodedSong}</div>
                <div>Mayukh</div>
            </div>
            <div class="playnow">
                <span class="Playing">Play Now</span>
                <img id = "start"class="invert" src="img/play.svg" alt="">
            </div>
        `;

        li.addEventListener("click", () => {
            console.log(`Playing: ${decodedSong}`);
            playMusic(decodedSong);

        });

        songUL.appendChild(li);
    }

    return songs;
    
}
const playMusic = (track, pause = false) => {
    let encodedTrack = encodeURIComponent(track); // Ensure proper encoding for URL
    console.log("Playing:", track);
    console.log("Encoded URL:", encodedTrack);
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg"
    }

    let audio = new Audio(`/${currfolder}/` + encodedTrack);
    currentSong.src = `/${currfolder}/` + encodedTrack;
    currentSong.play();
    // play.src = "pause.svg";
    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
};

async function displayAlbums(){
    // console.log(currfolder)
    let a = await fetch(`/songs/`);
    let response = await a.text();
    // console.log(response)

    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
    
        // console.log(e)
        if(e.href.includes("/songs") && !e.href.includes(".htaccess")){
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`songs/${folder}/info.json`)
            let response = await a.json();
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <div class="circular-box">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                    color="#000000" fill="none">
                                    <path
                                        d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                        stroke="currentColor" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                                </svg>
                            </div>

                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="img">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }

    }
     // Load the playlist whenever card is clicked
     Array.from(document.getElementsByClassName("card")).forEach(e =>{
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0],false);
        })
    })
    
    // div.innerHTML = response;
}


async function main() {


      await getSongs("songs/ncs");
    playMusic(songs[0], true);
    console.log(songs);

    //Display all the albums on the page
    displayAlbums()
   

    // Attach an event listener to play , next and previous
    play.addEventListener("click", () =>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "img/pause.svg";

        }
        else{
            currentSong.pause()
            play.src = "img/play.svg";
        }
    })

    //listen for time update event
    currentSong.addEventListener("timeupdate", () =>{
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/ currentSong.duration) * 100 + "%";
    })

    //Add an event listener  to seekbar 
    document.querySelector(".seekbar").addEventListener("click", e =>{
        let percent = ( e.offsetX/e.target.getBoundingClientRect().width)*100 
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration)*percent)/100;
    })

    // Add an event listener to hamburger
    document.querySelector(".hamburgerContainer").addEventListener("click", () =>{
        document.querySelector(".left").style.left = "0"
    })
    // Add an event listener to close button inside hamburger
    document.querySelector(".close").addEventListener("click", () =>{
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous and next
    previous.addEventListener("click", () =>{
        console.log("Previous clicked")
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)))
        console.log(currentSong.src)
        console.log(songs)
        if ((index-1) >= 0) {
            
            playMusic(songs[index-1])
        }
        if((index - 1) < 0){
            playMusic(songs[songs.length-1]);
        }
    })
    next.addEventListener("click", () =>{
        currentSong.pause();
        console.log("Next clicked")
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1))) 
        console.log(decodeURIComponent(currentSong.src.split("/").slice(-1)))
        console.log(songs)
        if((index + 1) == songs.length){
            playMusic(songs[0])
        }
        if ((index+1) < songs.length) {
            
            playMusic(songs[index+1])
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value)/100;
    })

   // Add event listener to mute the volume
   document.querySelector(".volume>img").addEventListener("click", e =>{
        console.log(e.target);
        if(e.target.src.includes("img/volume.svg")){
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg","img/volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
   })

}

main()

