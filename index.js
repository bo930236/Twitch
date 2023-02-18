 $(document).ready(async () => {
            const clientID = 'sa8qsftf1cnffx3n1uez5gg39twnvv';
            const token = 'om9sk40ivir372b6055rwxbcrbryyv'
            const headers = new Headers({
                'client-Id': clientID,
                'Authorization': 'Bearer ' + token
            });
            const topGamesApiUrl = 'https://api.twitch.tv/helix/games/top';
            const streamsApiUrl = 'https://api.twitch.tv/helix/streams';
            let topGameNames = [];
            let topGamesNum = 5;
            let streamsNum = 20;
            let chosenGameIndex = 0;
            let streamDivNum = 0;
            let streamIsEnd = false;
            let topGameNamesId = [];
            //取得前五名熱門遊戲名單
            try {
                let topGameNamesJson = await makeRequest(`${topGamesApiUrl}?first=${topGamesNum}`);
                for (let topGameData of topGameNamesJson.data) {
                    topGameNamesId.push(topGameData.id)
                    topGameNames.push(topGameData.name);
                }
                //更改 Nav Bar 資訊
                let navBarLinks = $('.navbar__game');
                for (let i = 0; i < navBarLinks.length; i++) {
                    navBarLinks[i].innerText = topGameNames[i]
                }
            } catch (err) {
                console.log('Cannot get top games data! ', err);
            }
            //取得串流影片
            displaySteams(0);
            $('.navbar__top-games').click(async e => {
                let gameBtns = $('.navbar__game');
                switch (e.target) {
                    case gameBtns[0]:
                        reset();
                        chosenGameIndex = 0;
                        displaySteams(chosenGameIndex)
                        break
                    case gameBtns[1]:
                        reset();
                        chosenGameIndex = 1;
                        displaySteams(chosenGameIndex)
                        break
                    case gameBtns[2]:
                        reset();
                        chosenGameIndex = 2;
                        displaySteams(chosenGameIndex)
                        break
                    case gameBtns[3]:
                        reset();
                        chosenGameIndex = 3;
                        displaySteams(chosenGameIndex)
                        break
                    case gameBtns[4]:
                        reset();
                        chosenGameIndex = 4;
                        displaySteams(chosenGameIndex)
                        break
                }
            })
            //載入更多
            setLoadMoreBtn();
            //functions
            async function displaySteams(chosenGameIndex, offset) {
                try {
                    let topGameStreamsJson = await getTopGameStreamJson((topGameNamesId[chosenGameIndex]), offset);
                    let topGameStreamsArr = createStreamData(topGameStreamsJson);
                    if (topGameStreamsArr.length < streamsNum) streamIsEnd = true;
                    if (offset) {
                        createDisplayDivAndAppend(topGameStreamsArr);
                        return
                    }
                    $('.streams').empty();
                    createDisplayDivAndAppend(topGameStreamsArr);
                } catch (err) {
                    console.log('Cannot get top game streams data! ', err);
                }
            }
            function makeRequest(url) {
                return fetch(url, {
                    method: 'GET',
                    headers: headers
                }).then(response => {
                    if (response.status >= 200 && response.status < 400 && response.ok) {
                        return response.json();
                    } else {
                        return Promise.reject('Error occurred!');
                    }
                });
            }
            function setLoadMoreBtn() {
                $('.watch-more__btn').click(() => {
                    if (streamIsEnd) {
                        document.querySelector('.watch-more__btn').outerHTML = `<p class="no-more-results">No  More  Results</p>`;
                        return;
                    } else {
                        displaySteams(chosenGameIndex, streamDivNum);
                    }
                })
            }
            function reset() {
                if (streamIsEnd) {
                    document.querySelector('.watch-more__btn').outerHTML = `<button class="watch-more__btn">Watch  More ...</button>`;
                    setLoadMoreBtn();
                }
                streamIsEnd = false;
                streamDivNum = 0;
                window.scrollTo(0, 0);
            }
            function getTopGameStreamJson(gameNameId, offset) {
                let apiUrl = `${streamsApiUrl}?game_id=${gameNameId}&first=${streamsNum}`;
                if (offset) apiUrl += `&offset=${offset}`
                return makeRequest(apiUrl);
            }
            function createDisplayDivAndAppend(streamsData) {
                for (let i = 0; i < streamsData.length; i++) {
                    let block = document.createElement('div');
                    block.classList.add('stream__block');
                    block.innerHTML = `
          <div class="stream__preview"></div>
          <div class="stream__info">
            <div class="stream__content">
              <div class="stream__game"></div>
              <div class="stream__display-name"></div>
              <div class="stream__viewers"></div>
          </div>`;
                    block.setAttribute('onclick', `window.open('https://www.twitch.tv/${streamsData[i].url}')`);
                    block.querySelector('.stream__preview').style.background = `url('${streamsData[i].previewImage}') no-repeat center center`;
                    block.querySelector('.stream__info .stream__content .stream__game').innerText = streamsData[i].gameName;
                    block.querySelector('.stream__info .stream__content .stream__display-name').innerText = streamsData[i].displayName;
                    block.querySelector('.stream__info .stream__content .stream__viewers').innerText = `${streamsData[i].viewers} viewers`;
                    let streamsSection = document.querySelector('.streams');
                    streamsSection.appendChild(block);
                }
                streamDivNum = $('.stream__block').length;
            }
            function setStreamData(data) {
                data.previewImage = data.previewImage.replace(
                    "{width}x{height}",
                    "640x320"
                );
                return data
            }
            function createStreamData(jsonData) {
                let dataOfStreams = [];
                for (let i = 0; i < jsonData.data.length; i++) {
                    let eachStreamData = {};
                    eachStreamData['previewImage'] = jsonData.data[i].thumbnail_url;
                    eachStreamData['gameName'] = jsonData.data[i].title;
                    eachStreamData['displayName'] = jsonData.data[i].game_name;
                    eachStreamData['viewers'] = jsonData.data[i].viewer_count;
                    eachStreamData['id'] = jsonData.data[i].id;
                    eachStreamData['url'] = jsonData.data[i].user_login;
                    let updatedStreamData = setStreamData(eachStreamData);
                    dataOfStreams.push(eachStreamData);
                };
                return dataOfStreams;
            }
        })