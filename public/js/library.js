var gamesContainer, gameElements, burger, nav;
$('document').ready(function() {
    eventListeners();

    gamesContainer = document.getElementById('game-list');

    // Clone original state of game list
    if(gamesContainer !== null)
        gameElements = Object.assign({}, gamesContainer.childNodes);
});

function eventListeners() {
    // Listen for game hovers
    $('.game-column').hover(
        function() {
            $('#info_' + this.id).show();
        },
        function() {
            $('#info_' + this.id).hide();
        }
    );
    
    
    $('#sort-by').change(function() {
        if(this.value === 'pl-a') {
            sortGames(0, true);
        } else if(this.value === 'pl-d') {
            sortGames(0, false);
        } else if(this.value === 'm-a') {
            sortGames(1, true);
        } else if(this.value === 'm-d') {
            sortGames(1, false);
        }
    });

    $('#filter-input').on('input', function() {
        for( var i = 0; i < games.length; i++) {
            if(games[i].name.toLowerCase().includes(this.value.toLowerCase())) 
                $('#' + games[i].appid).show();
            else 
                $('#' + games[i].appid).hide();
        }
    });
}

function sortGames(selection, isAscending) {

    var toSort = [];

    if(selection === 0) {

        for(var i = 0; i < games.length; i++) toSort.push([games[i].playtime, gameElements[i]]);

        if(!isAscending)
            toSort.reverse();

    } else if(selection === 1) {
        // Used to order by metacritic (feature removed for now, will be replaced with opencritic scores instead)
        // var metacriticScore;
        // for(var i = 0; i < games.length; i++) {
            
        //     if(games[i].gameInfo !== null && games[i].gameInfo.metacritic !== null && games[i].gameInfo.metacritic !== undefined)
        //         metacriticScore = games[i].gameInfo.metacritic.score;
        //     else
        //         metacriticScore = 0;
            
        //     toSort.push([metacriticScore, gameElements[i]]);
        // }

        // toSort.sort(function(x, y) {
        //     if(isAscending)
        //         return y[0] - x[0];
        //     else
        //         return x[0] - y[0];
        // });
    }
    
    for(var i=0; i < toSort.length; i++) gamesContainer.appendChild(toSort[i][1]);
}