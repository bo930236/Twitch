/* 
畫面 load 完成
取得熱門遊戲
將 navbar 更新成熱門的遊戲
更改標題遊戲名稱為最熱門的遊戲名稱
抓最熱門遊戲的實況並放上網頁
 */
window.addEventListener("load", () => {
  getTopGames((data) => {
    reNewNav(data);
    changeGameName(document.querySelectorAll("a")[0]);
    getHotStreams(data.data[0].id, reFillStreams);
  });
  document.querySelector("a").parentNode.classList.add("active");
  document.querySelector(".navbar-list").addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      counter = 0;
      paginator = "";
      getHotStreams(event.target.dataset.id, reFillStreams);
      document.querySelector(".active").classList.remove("active");
      event.target.parentNode.classList.add("active");
      changeGameName(event.target);
    }
  });
  addPlaceholder();
  addPlaceholder();
  window.addEventListener("scroll", debunce(addMoreStreams));
  window.addEventListener("scroll", backToTop);
  backToTop();
  addBackToTop();
});

let counter = 0;
let paginator = "";
let allowNextRequest = true;
const baseUrl = "https://api.twitch.tv/helix";
const errorMsg = "系統不穩定，請再試一次";
const TOKEN = "om9sk40ivir372b6055rwxbcrbryyv";
const CLIEND_ID = "sa8qsftf1cnffx3n1uez5gg39twnvv";

const IMAGE_WIDTH = 320;
const IMAGE_HEIGHT = 200;
const GAME_LIMIT = 5;
const STREAM_LIMIT = 20;
const TEMPLATE_HTML = `
      <div class='stream' >
        <div classs = 'stream-url' onclick="window.open('$url')">
            <img class='cover' src='$large'></img>
            <div class='stream-extra'>
            <div class=stream-details>
                <div class='stream-title'>$title</div>
                <div class='stream-name'>$name</div>
                <div class='stream-viewers'>$viewers</div>
            </div>
            </div>
        </div>
      </div>
      `;

// call API
function draw(url, cb) {
  const request = new XMLHttpRequest();
  request.onerror = function () {
    cb(errorMsg);
  };
  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      let data;
      try {
        data = JSON.parse(request.responseText);
      } catch (e) {
        cb(errorMsg);
        return;
      }
      cb(null, data);
    } else {
      cb(errorMsg);
    }
  };
  request.open("GET", url, true);
  request.setRequestHeader("client-Id", CLIEND_ID);
  request.setRequestHeader("Authorization", `Bearer ${TOKEN}`);
  request.send();
}

// 取得最熱門的遊戲
function getTopGames(callback) {
  const topGamesUrl = `${baseUrl}/games/top?first=${GAME_LIMIT}`;
  draw(topGamesUrl, (err, topGames) => {
    if (err) {
      alert(err);
      return;
    }
    callback(topGames);
  });
}

// 取得熱門實況
function getHotStreams(id, callback) {
  allowNextRequest = false;
  const topStreamsUrl = `${baseUrl}/streams/?game_id=${id}&first=${STREAM_LIMIT}&after=${paginator}`;
  document.querySelector(".desc").innerText = `Top ${
    20 * (counter + 1)
  } popular live streams sorted by current viewers`;
  draw(topStreamsUrl, (err, data) => {
    if (err) {
      alert(err);
      return;
    }
    callback(data);
  });
}
// 修改 streams data
function setStreamList(data) {
  const updatedList = data.map((stream) => {
    const updatedStream = { ...stream };
    updatedStream.thumbnail_url = stream.thumbnail_url.replace(
      "{width}x{height}",
      "640x320"
    );
    return updatedStream;
  });
  return updatedList;
}

// 建立佔位元素用於修正最後一行排版
function addPlaceholder() {
  const element = document.createElement("div");
  element.classList.add("stream-empty");
  document.querySelector(".streams-container").appendChild(element);
}

function removePlaceholder() {
  const streamsContainer = document.querySelector(".streams-container");
  const lastChild = streamsContainer.lastElementChild;

  if (lastChild) {
    try {
      streamsContainer.removeChild(lastChild);
    } catch (e) {
      console.error(e);
    }
  }
}

// 將熱門實況更新上 UI
function reFillStreams(data) {
  removePlaceholder();
  removePlaceholder();
  const streamsContainer = document.querySelector(".streams-container");
  if (counter === 0) {
    streamsContainer.innerHTML = "";
  }
  for (const stream of data.data) {
    const div = document.createElement("div");
    streamsContainer.appendChild(div);
    div.outerHTML = TEMPLATE_HTML.replace(
      "$url",
      `https://www.twitch.tv/${stream.user_login}`
    )
      .replace(
        "$large",
        stream.thumbnail_url
          .replace("{width}", IMAGE_WIDTH)
          .replace("{height}", IMAGE_HEIGHT)
      )
      .replace("$name", stream.user_name)
      .replace("$title", stream.title)
      .replace("$viewers", stream.viewer_count);
  }
  addPlaceholder();
  addPlaceholder();
  paginator = data.pagination.cursor;
  allowNextRequest = true;
}

// 更改標題遊戲名稱
function changeGameName(game) {
  const currentGame = document.querySelector(".game-name");
  currentGame.innerText = game.innerText;
  currentGame.dataset.id = game.dataset.id;
}

// 將 navbar 更新成熱門遊戲
function reNewNav(data) {
  const hyperLinks = document.querySelectorAll("a");
  let i = 0;
  for (const game of data.data) {
    hyperLinks[i].innerText = game.name;
    hyperLinks[i].dataset.id = game.id;
    i++;
  }
}

// 載入更多熱門實況
function addMoreStreams() {
  counter++;
  const { id } = document.querySelector(".game-name").dataset;
  getHotStreams(id, reFillStreams);
}

// debounce
function debunce(func, delay = 1000) {
  let timer = null;
  return () => {
    const page = document.documentElement;
    // 改寫讓頁面捲到一半就預先載入
    let a = page.scrollHeight - window.innerHeight * 0.9;
    if (a <= page.scrollTop + window.innerHeight && allowNextRequest) {
      clearTimeout(timer);
      // 改寫延遲時間為 500 毫秒
      timer = setTimeout(func, 100);
    }
  };
}
// 加入 backtotop 按鈕
function addBackToTop() {
  const backTopButton = document.getElementById("BackTop");

  backTopButton.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

function backToTop() {
  const backTopButton = document.getElementById("BackTop");

  if (window.scrollY > 300) {
    backTopButton.style.display = "block";
  } else {
    backTopButton.style.display = "none";
  }
}
